"""
Module to access the Indexity API
"""
import copy
import getpass
import json
import logging
import mimetypes
import os
import pathlib
import tempfile

import ffmpeg
import progressbar
import requests

from requests_toolbelt import MultipartEncoder, MultipartEncoderMonitor


class Client:
    def __init__(self, base_url="https://api.indexity.ircad.fr",
                 token_file_path=None):
        """ Initialize the class.
        """

        """ Url to access the indexity api """
        self.__base_url = base_url
        """ Current token """
        self.__token = None
        """ File where the token is stored """
        if token_file_path is None:
            self.__token_file = os.path.join(pathlib.Path.home(),
                                             ".indexity-token")
        else:
            self.__token_file = token_file_path
        """ Store the user id, notably to re-affect annotations """
        self.__user_id = -1

    def auth_verify(self, token):
        """ Check with the auth/verify endpoint that the user can be
        authenticated with the current token.

        Args:
            token (str): token to be checked for validity

        Returns:
            - True if the user can be authenticated with the current token
            - False if the user cannot be authenticated with the current token
        """

        # Setup endpoint and send request
        endpoint = os.path.join(self.__base_url, "auth/verify")
        headers = {"Authorization": "Bearer " + token}

        logging.info("GET %s", endpoint)
        req = requests.get(endpoint, headers=headers)

        # Store the user id
        output = req.json()
        if "id" in output.keys():
            self.__user_id = output["id"]
        else:
            return False

        # Check if we got a positive answer
        return bool(req)

    def login(self):
        """ Log the user on the Indexity annotation platform, by either:
              - Reading a cached token (that is check for validity)
              - Asking the user's credentials

        Returns:
            - True if the user has successfully been authenticated
            - False if authentication fails three times
        """

        # Check if the token already exists and is valid
        if os.path.exists(self.__token_file):
            token_file = open(self.__token_file, 'r')
            access_token = token_file.read()
            token_file.close()
            if self.auth_verify(access_token):
                self.__token = access_token
                logging.info("Successfully logged in with cached token.")
                return True

        # Build url
        endpoint = os.path.join(self.__base_url, "auth/login")
        # Retry loop, three tries allowed
        nb_tries = 3
        for retry in range(nb_tries):
            email = input('Login: ')
            password = getpass.getpass(prompt='Password: ')

            logging.info("POST %s", endpoint)
            req = requests.post(endpoint,
                                data={"email": email, "password": password})
            # Check if we got a positive answer
            if req:
                output = req.json()
                if "accessToken" in output.keys():
                    # First check that we can get the user id
                    if 'user' in output.keys() and \
                            'id' in output['user'].keys():
                        self.__user_id = output['user']['id']
                        self.__token = output['accessToken']

                        out_file = open(self.__token_file, 'w')
                        out_file.write(self.__token)
                        out_file.close()

                        logging.info(
                            "Successfully logged in with credentials.")
                        return True

            logging.warning(f'Login failed.'
                            f'{"Try again." if retry+1 < nb_tries else ""} '
                            f'[{retry+1}/{nb_tries}]')

        logging.warning("Make sure your email and password are correct.")
        return False

    def __get_data(self, data_type="videos", filters=None):
        """ Get a list of elements of type specified by data_type,
            potentially filtered.
        Args:
            type (str): type of data to find, can be "videos" or "video-groups"
            filters (list): List of filters to be applied. Valid filters are:
                  - eq (equals), ne (not equal), cont (contains),
                  - in/notin (with javascript array, [... , ...]),
                  - gt/gte (greater than), lt/lte (lower than),
                  - starts/ends (starts/end with),
                  - isnull, notnull

                The filter must be written using the following syntax:
                "<property>||<operator>||<value>".
                Only first level properties can be reached with this filtering.
        Returns:
            List of filtered data.
            The output format is the python translation of the json answer.
        """

        # Check token
        if self.__token is None:
            logging.warning("Token is not set. Did you login ?")
            return []

        # Force the filters to be a list
        # in case the user provided only one filter
        if not filters:
            filters = []
        if not isinstance(filters, list):
            filters = [filters]

        # Setup the endpoint
        endpoint = os.path.join(self.__base_url, data_type)

        # Apply filters
        if filters:
            endpoint = endpoint + "?filter=" + filters[0]

            for flt in filters[1:]:
                endpoint = endpoint + "&filter=" + flt

        headers = {"Authorization": "Bearer " + self.__token}
        logging.info("GET %s", endpoint)
        req = requests.get(endpoint, headers=headers)

        # Check if we got a positive answer
        if req:
            out = req.json()
            return out["data"]

        return []

    def get_videos(self, filters=None):
        """ Get the video list, potentially filtered.

        Args:
            filters (list): List of filters to be applied. Valid filters are:
                  - eq (equals), ne (not equal), cont (contains),
                  - in/notin (with javascript array, [... , ...]),
                  - gt/gte (greater than), lt/lte (lower than),
                  - starts/ends (starts/end with),
                  - isnull, notnull

                The filter must be written using the following syntax:
                "<property>||<operator>||<value>".
                Only first level properties can be reached with this filtering.

        Returns:
            List of filtered videos.
            The output format is the python translation of the json answer.
        """
        return self.__get_data("videos", filters)

    def get_video_groups(self, filters=None):
        """ Get the list of groups, potentially filtered.

        Args:
            filters (list): List of filters to be applied. Valid filters are:
                  - eq (equals), ne (not equal), cont (contains),
                  - in/notin (with javascript array, [... , ...]),
                  - gt/gte (greater than), lt/lte (lower than),
                  - starts/ends (starts/end with),
                  - isnull, notnull

                The filter must be written using the following syntax:
                "<property>||<operator>||<value>".
                Only first level properties can be reached with this filtering.

        Returns:
            List of filtered groups.
            The output format is the python translation of the json answer.
        """
        return self.__get_data("video-groups", filters)

    def __download_file(self, endpoint, extension="", filename=None):
        """ Download (via streaming) a file stored on Indexity to
            a temporary file, if filename is not specified.
            If filename is specified, then save the file under this name.
            This function also makes sure that all the intermediate
            directories exist.

        Args:
            endpoint (str): endpoint to download data from.
            extension (str): if filename is not specified, extension to be
                appended to the downloaded file.
            filename (str): filename used to save the downloaded content.

        Returns:
            Path to the written file.
        """

        if self.__token is None:
            return None

        headers = {"Authorization": "Bearer " + self.__token}

        # If the user specified a filename, we use this
        if filename:
            # Create the directory path to the selected filename
            os.makedirs(os.path.dirname(filename), exist_ok=True)
        # Otherwise we create a temporary file
        else:
            _, filename = tempfile.mkstemp(suffix=extension)

        logging.info("Downloading content to %s", filename)

        # Stream the data to the temporary file
        with open(filename, 'wb') as out_file:
            with requests.get(endpoint,
                              headers=headers,
                              allow_redirects=True,
                              stream=True) as req:
                req.raise_for_status()
                for chunk in req.iter_content(chunk_size=1048576):
                    if chunk:
                        out_file.write(chunk)
        return filename

    def __get_video_data(self, video, entry, filename=None):
        """ Get video data from a video list.

        Args:
            video (list): list of videos in the json format translated
                to python
            entry (str): route to be accessed for the videos.
                Useful entries to query: media, annotations, resolutions
                See the "videos/<id>/*" keywords in the API.
            filename (str): filename where the content will be downloaded to

        Returns:
            a dictionary representing the output value, either:
            - the python-translated json answer from Indexity
            - the path to the file that was downloaded
            Or None, if an error occurred
        """

        # Check token
        if self.__token is None or "id" not in video.keys():
            logging.warning("Invalid token or video passed for processing.")
            return None

        video_id = str(video["id"])

        # Setup endpoint and headers
        endpoint = os.path.join(self.__base_url, "videos", video_id, entry)
        headers = {"Authorization": "Bearer " + self.__token}

        # Get the response header to assess what will be the output
        logging.info("HEAD %s", endpoint)
        req = requests.head(endpoint, headers=headers, allow_redirects=True)
        content_type = req.headers['content-type']
        if not req:
            message = "An error occurred. Please check that the "
            message += "requested content is present on the platform."
            logging.warning(message)
            logging.warning(req)
            return None

        logging.info("GET %s", endpoint)

        output_value = None

        if content_type == "video/mp4":
            # Check if we updated the video to be downloaded
            output_value = self.__download_file(endpoint,
                                                extension=".mp4",
                                                filename=filename)

        elif content_type == "image/jpeg":
            output_value = self.__download_file(endpoint,
                                                extension=".jpg",
                                                filename=filename)

        else:
            req = requests.get(endpoint, headers=headers)

            # Check if we got a positive answer
            if req:
                json_output = req.json()
                if isinstance(json_output, dict) and \
                   "data" in json_output.keys():
                    # If the filename is not empty, then the user want the
                    # annotation to be written to a file
                    if filename:
                        # Create the directory path to the selected filename
                        os.makedirs(os.path.dirname(filename), exist_ok=True)
                        with open(filename, "w") as output_file:
                            output_file.write(json.dumps(json_output["data"]))

                    output_value = json_output["data"]
                elif isinstance(json_output, list):
                    output_value = json_output
                else:
                    output_value = []

        return output_value

    def download_video(self, video, video_resolution_index=0, filename=None):
        """ Download a video.

        Args:
            video (json): video json object.
            video_resolution_index (int): rank of the resolution to
                be downloaded.
            filename (str): if filename is set, then the video will be
                saved in the corresponding file, otherwise a temporary file
                will be created.

        Returns:
            path to the downloaded file.
        """

        # Make sure to work on a copy of the video structure
        # As we need to update it when selecting a lower resolution
        dc_video = copy.deepcopy(video)

        # If the user selected a specific video index
        # We select the corresponding video to be downloaded
        # The modulo is used here to ensure that we get a valid resolution
        resolutions = self.get_available_resolutions(dc_video)
        if video_resolution_index != 0:
            if video_resolution_index in list(range(len(resolutions))):
                # - We substitute the original video_id with the one
                # of the the lower resolution video
                dc_video["id"] = resolutions[video_resolution_index]["id"]
            else:
                logging.warning("Invalid resolution index (%s). " +
                                "Number of available resolutions: %s",
                                video_resolution_index,
                                len(resolutions))
                logging.warning("Skipping video.")
                return []

            msg = "Downloading video @ {}x{}".format(
                        resolutions[video_resolution_index]["width"],
                        resolutions[video_resolution_index]["height"])
            logging.info(msg)

        return self. \
            __get_video_data(dc_video, "media", filename=filename)

    def download_annotations(self, video, filename=None):
        """ Download an annotation.

        Args:
            video (json): video json object.
            filename (str): if filename is set, then the annotation will
                also be saved in the corresponding file.

        Returns:
            annotation in json format.
        """
        return self.__get_video_data(video, "annotations", filename=filename)

    def get_available_resolutions(self, video):
        """ Get the list of available resolutions.

        Args:
            video (json): video json object.

        Returns:
            json description of the available resolutions.
        """
        resolutions = self.__get_video_data(video, "resolutions")

        # Sort the resolutions in decreasing order
        # Keeping the original resolution at rank 0
        sorted_res = sorted(resolutions,
                            key=lambda x: x["height"],
                            reverse=True)

        return sorted_res

    def __check_annotations(self, annotations):
        """ Check annotation validity.

        Args:
            annotations (list): annotations to check (list of dictionaries).

        Returns:
            True if the annotations are valid, False otherwise.
        """

        # Store the different videos ids in a set
        # as in one annotation file we can have multiple
        # annotations for the same video
        videoSet = set()
        for annot in annotations:
            videoSet.add(annot["videoId"])
        videoList = list(videoSet)

        # Build a filter list containing all the videos to be updated
        # with annotations
        video_filter = "id||in||["
        if videoList:
            video_filter = video_filter + str(videoList[0])

            for vid in videoList[1:]:
                video_filter = video_filter + "," + str(vid)

        video_filter = video_filter + "]"

        # Get the list of filtered videos
        videos = self.get_videos([video_filter])

        # Test if we got the same number of videos than
        # the number of annotations
        # If the number of received videos is lower than
        # the number of annotations, it means that either:
        # - one of the video id is wrong,
        # - one of the video id is the id of a lower resolution video
        #   (which do not return data)
        if len(videoList) == len(videos):
            return True

        logging.warning("An error occured during annotation checking.")
        return False

    def upload_annotations(self, annotations, new_video_id=-1):
        """ Upload json annotations to the Indexity platform.
           Format: https://git.ircad.fr/indexity/indexity-api/-/wikis/API-Annotation-object-documentation
           (This link requires to be a member of the project)

        Args:
            annotations (list): list of json data to be uploaded for
                the matching videos
            new_video_id (int): videoId that will be set for all annotations,
                if the value is greater than or equal to 0,
                notable useful in the case of video migrations
                between different instances.

        Returns:
            - None, if there was a problem,
            - The json output of the request command.
        """ # noqa

        # Check token
        if self.__token is None:
            return None

        # Make sure to work on a copy of the annotation list
        # As we need to update it
        dc_annotations = copy.deepcopy(annotations)

        # Substitute the videoId with a new one if needed
        # e.g. when migrating videos/annotations from one instance to another
        for i in range(len(dc_annotations)):
            if new_video_id >= 0:
                logging.info("Relabeling annotation video Id from %s to %s",
                             str(dc_annotations[i]["videoId"]),
                             str(new_video_id))

                # Update the video id to the newly uploaded one
                dc_annotations[i]["videoId"] = new_video_id

            # Update the author id to the person uploading the annotation
            # As we cannot guarantee that the previous user will exist
            # notably in the case were videos are moved from one instance
            # to another
            dc_annotations[i]["userId"] = self.__user_id

            # Delete potential user section in data as it is not needed
            if "user" in dc_annotations[i].keys():
                del dc_annotations[i]["user"]

        # Check that the annotations are correct before uploading
        # Notably checking if one of the annotation is done on a
        # lower resolution video rather than on the original one
        # We must make sure that the annotation is uploaded on
        # the original resolution
        if not self.__check_annotations(dc_annotations):
            return None

        # Setup the endpoint
        endpoint = os.path.join(self.__base_url, "annotations", "bulk")
        headers = {'Authorization': 'Bearer ' + self.__token,
                   'Content-Type': 'application/json'}

        json_data = {"bulk": dc_annotations}

        logging.info("POST %s", endpoint)
        req = requests.post(endpoint, json=json_data, headers=headers)
        json_output = req.json()

        if req:
            logging.debug(json_output)
            return json_output

        logging.warning("%d: %s", json_output["statusCode"],
                        json_output["error"])
        logging.warning("Error: \n%s", json_output["message"])

        return None

    def __post_file(self, endpoint, file_path,
                    file_name=None, file_field="files"):
        """ Post a file using a custom field.

        Args:
            endpoint (str): endpoint to post data to
            file_path (str): file to be posted
            file_name (str): file name posted to the server
            file_field (str): custom field to be used for posting

        Returns:
            - None, if there was a problem,
            - The json output of the request command.
        """
        if not os.path.exists(file_path):
            return None

        in_file = open(file_path, 'rb')
        # Guess the mime type of the file to be posted
        mime_type = mimetypes.guess_type(file_path)

        # If we can't get the mimetype, skip the file upload
        if mime_type[0] is None:
            logging.warning("Can't guess mime type for %s", file_path)
            return []

        if file_name is None:
            file_name = os.path.split(file_path)[-1]
        multipart_encoder = MultipartEncoder(
            fields={
                file_field: (
                    file_name,
                    in_file,
                    mime_type[0]
                )
            }
        )

        widgets = [
            progressbar.widgets.Bar(marker="#", left="[", right="]"),
            progressbar.widgets.Percentage(), " | ",
            progressbar.widgets.FileTransferSpeed(), " | ",
            progressbar.DataSize(), " / ",
            progressbar.DataSize(variable="max_value"), " | ",
            progressbar.widgets.ETA(),
        ]
        file_size = os.path.getsize(file_path)
        bar = progressbar.ProgressBar(widgets=widgets, maxval=file_size)
        bar.start()
        multipart_encoder_monitor = MultipartEncoderMonitor(
            multipart_encoder,
            lambda mon: bar.update(min(file_size, mon.bytes_read)))

        headers = {'Authorization': 'Bearer ' + self.__token,
                   'Content-Type': multipart_encoder.content_type}

        logging.info("Uploading %s", file_path)
        logging.info("POST %s", endpoint)

        req = requests.post(
            endpoint,
            data=multipart_encoder_monitor,
            headers=headers)
        status = int(req.status_code)
        if status == 201:
            logging.info('Status 201: Successful upload of file: %s',
                         file_path)
        else:
            message = 'Status ' + str(status) + ', '
            message += 'Something went wrong when '
            message += 'uploading the file: ' + file_path
            logging.info(message)
            logging.warning(req.json())

            return []

        return json.loads(req.content.decode("utf-8"))

    def update_video(self, video, name=None):
        """ Update video information.

        Args:
            video (dict): video data in json format
            name (str): new video name

        Returns:
            - The json output of the patch command.
        """
        if name is None:
            return None

        video_id = video["id"]
        video_name = video["id"]
        endpoint = os.path.join(self.__base_url, "videos", str(video_id))

        headers = {"Authorization": "Bearer " + self.__token}

        json_data = {"name": name}

        logging.info("PATCH %s", endpoint)
        req = requests.patch(endpoint, json=json_data, headers=headers)
        status = int(req.status_code)
        if status == 200:
            logging.info(f'Status 200: '
                         f'Successful renamed video from'
                         f' "{video_name}" to "{name}"')
            return [req.json()]
        else:
            logging.warning(f'Status {status}, '
                            f'Something went wrong when '
                            f'video was renamed from '
                            f'"{video_name}" to "{name}"')
            logging.warning(req.json())
            return None

    def upload_video(self, video_path, name=None, group_id=None):
        """ Upload a video on the platform.

        Args:
            video_path (str): video to be uploaded
            name (str): new video name
            group_id (int): destination group for video

        Returns:
            - None, if there was a problem,
            - The json output of the request command.
        """

        # Check token
        if self.__token is None:
            return None

        # Check that the video is in the h264 format
        # Other format may not be openable in the player of
        # the web ui (e.g. mpeg4)
        video_format = None
        probe = ffmpeg.probe(video_path)
        if "streams" in probe and len(probe["streams"]) > 0 and \
                "codec_name" in probe["streams"][0]:
            video_format = probe["streams"][0]["codec_name"]
        else:
            logging.warning("Could not extract codec information. " +
                            "Please check your input.")
            return None

        if video_format != "h264":
            logging.warning("Your video is not in the h264 format and " +
                            "might not be compatible with the player " +
                            "on Indexity. It will not be uploaded.")
            return None

        endpoint = os.path.join(self.__base_url, "videos", "upload")

        video = self.__post_file(
            endpoint, video_path, name, file_field="files")

        # Add video to specified group
        if video and group_id:
            logging.info(f'Adding video {os.path.basename(video_path)} '
                         f'in group {group_id}')
            self.add_video_to_group(video[0]['id'], group_id)

        return video

    def upload_xml_annotation(self, video, xml_file_path):
        """ Upload an annotation in the SurgeTrack xml format.

        Args:
            video (dict): json entry to the video
                for which the annotations should be uploaded
            xml_file_path (str): xml file containing
                the annotations. Their are match by index with the video list
                content.

        Returns:
            - None, if there was a problem,
            - The json output of the request command.
        """

        # Check token
        if self.__token is None:
            return None

        vid = video[0]["id"]
        endpoint = os.path.join(self.__base_url, "admin", "surgetrack",
                                "import", "video", str(vid))
        out = self.__post_file(endpoint, xml_file_path,
                               file_field="file")

        return out

    def add_video_to_group(self, video_id, group_id):
        """
        Add a video to a specified group ID
        Args:
            video_id (int): video ID to add in specified group
            group_id (int): destination group for video

        Returns:
            - True if video is added to the group
            - False if there was a problem adding the video to the group

        """
        endpoint = os.path.join(
            self.__base_url, "video-groups", str(group_id), "videos")
        headers = {'Authorization': 'Bearer ' + self.__token,
                   'Content-Type': 'application/json'}
        req = requests.post(endpoint, headers=headers, json=[str(video_id)])
        status = int(req.status_code)
        if status == 200:
            # check if the video was really added to the group
            response = req.json()
            if video_id in response['videoIds']:
                logging.info(f'Status 200: '
                             f'Successful added video {video_id} '
                             f'in group {group_id}')
                return True

        logging.warning(f'Status {status} '
                        f'Something went wrong when '
                        f'adding video {video_id} in group {group_id}')
        return False


def create_dummy_annotation(video_id):
    """ Create a dummy annotation.

        Args:
            video_id (str): id of the video to be associated to
                the annotation

        Returns:
            - A dictionary containing a dummy annotation
    """
    annotation = {
        "label": {
            "name": "Test annotation",
            "color": "#b31111",
            "type": "phase"
        },
        "shape": None,
        "timestamp": 200,
        "duration": 1000,
        "videoId": video_id
    }

    return [annotation]
