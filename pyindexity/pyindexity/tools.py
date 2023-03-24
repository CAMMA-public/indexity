"""
Module containing tools using the Indexity API
"""

import json
import os
from pyindexity import pyindexity
import tempfile

import logging
logging.basicConfig(level=logging.INFO)


def download_db(base_url="https://api.indexity.ircad.fr",
                regex="", output_path=tempfile.mkdtemp(),
                dry_run=False):
    """ Download a video/annotation database from an Indexity instance.

    Args:
        base_url (str): API url of the Indexity instance to address
            (default is "https://api.indexity.ircad.fr")
        regex (str): A regex to be matched to the video names on the platform.
            The "cont" operator is used for the server-side comparison.
            (default is "")
        output_path (str): Output path where the videos and annotations will
            be downloaded.

    Returns:
        Nothing.
    """

    client = pyindexity.Client(base_url=base_url)
    is_logged = client.login()
    if not is_logged:
        logging.error("You're not logged in Indexity")
        exit(1)

    # Check if a regex has been defined and use it
    # Otherwise get all the available videos
    filters = None
    if regex:
        filters = "name||cont||" + regex
    videos = client.get_videos(filters)

    logging.info("Found %s videos.", str(len(videos)))

    video_output_path = os.path.join(output_path, "videos")
    os.makedirs(video_output_path, exist_ok=True)
    annotation_output_path = os.path.join(output_path, "annotations")
    os.makedirs(annotation_output_path, exist_ok=True)

    logging.info("Downloading videos/annotations to %s.", output_path)

    for i, v in enumerate(videos):
        video_fname = os.path.join(video_output_path, v["name"])
        logging.info("[%s/%s] Downloading video to %s",
                     i, len(videos) - 1, video_fname)
        if not dry_run:
            client.download_video(v, filename=video_fname)
        r, e = os.path.splitext(v["name"])
        annotation_fname = os.path.join(annotation_output_path, r + ".json")
        logging.info("[%s/%s] Downloading annotation to %s",
                     i, len(videos) - 1, annotation_fname)
        if not dry_run:
            client.download_annotations(v, filename=annotation_fname)


def upload_db(video_paths,
              annotation_paths=None,
              base_url="https://api.indexity.ircad.fr",
              dry_run=False):
    """ Upload a video/annotation database to an Indexity instance.

    Args:
        video_paths (list): List of paths containing the videos to be uploaded
        annotation_paths (list): List of paths containing the annotations
            to be uploaded. Each annotation file will be matched to its
            corresponding video using the filename without the extension
            (default is None)
        base_url (str): API url of the Indexity instance to address
            (default is "https://api.indexity.ircad.fr")
        dry_run (bool): Perform a dry-run to check input data
            (default is False)

    Returns:
        Nothing.
    """

    # Gather videos and annotations
    videos = []
    for p in video_paths:
        if not os.path.exists(p):
            logging.error("Path %s does not exists", p)
            exit(1)
        videos = videos + [os.path.join(p, x) for x in os.listdir(p)]

    # Sort the videos
    videos = sorted(videos)

    annotations = []
    if annotation_paths:
        for p in annotation_paths:
            if not os.path.exists(p):
                logging.error("Path %s does not exists", p)
                exit(1)
            annotations = annotations + \
                [os.path.join(p, x) for x in os.listdir(p)]

    # Match the videos and the annotations
    video_annot = []
    for v in videos:
        bname = os.path.basename(v)
        vroot, _ = os.path.splitext(bname)

        if annotations:
            def assoc(x):
                aroot, _ = os.path.splitext(os.path.basename(x))
                if vroot == aroot:
                    return True
                else:
                    return False

            aname = list(filter(assoc, annotations))

            if aname:
                video_annot = video_annot + [[v, aname[0]]]
            else:
                video_annot = video_annot + [[v, None]]
        else:
            video_annot = video_annot + [[v, None]]

    for va in video_annot:
        logging.info("v: %s ; a: %s", va[0], str(va[1]))

    logging.info("Number of couples to process: %s", len(video_annot))

    video_issues = []
    annotation_issues = []

    client = pyindexity.Client(base_url=base_url)
    is_logged = client.login()
    if not is_logged:
        logging.error("You're not logged in Indexity")
        exit(1)

    for i, va in enumerate(video_annot):
        current_index_str = "[" + str(i) + "/" + \
            str(len(video_annot) - 1) + "]"

        video_name = os.path.basename(va[0])

        video = client.get_videos("name||eq||" + video_name)
        if video:
            logging.info("%s Video %s already uploaded as id: %s",
                         str(current_index_str), video_name,
                         str(video[0]["id"]))
        else:
            logging.info("%s Uploading %s", str(current_index_str), va[0])

            if not dry_run:
                # Renaming is not working as of now
                video = client.upload_video(va[0])

                if not video:
                    logging.info("%s There was an issue uploading video: %s",
                                 str(current_index_str), va[0])
                    video_issues.append(va[0])
                    continue

        # Process annotations
        if video and va[1] is not None and not dry_run:
            # Check if the annotation has already been uploaded
            annot = client.download_annotations(video[0])
            if not annot:
                r, e = os.path.splitext(va[1])
                out = None
                if e == ".json":
                    logging.info("%s Uploading json annotation %s",
                                 str(current_index_str), va[1])
                    with open(va[1], "r") as jf:
                        data = json.load(jf)

                    if len(data) > 0:
                        # Upload the video while taking care
                        # to update the associated id
                        out = client.\
                            upload_annotations(data,
                                               new_video_id=video[0]["id"])
                    else:
                        logging.info("%s Empty annotation %s",
                                     str(current_index_str), va[1])

                elif e == ".xml":
                    logging.info("%s Uploading xml annotation %s",
                                 str(current_index_str), va[1])
                    out = client.upload_xml_annotation(video, va[1])

                if not out:
                    logging.info("%s There was an issue uploading " +
                                 "annotation: %s",
                                 str(current_index_str), va[1])
                    annotation_issues.append(va[1])
            else:
                logging.info("%s Annotation for %s has already " +
                             "been uploaded",
                             str(current_index_str), video_name)

    if len(video_issues) > 0:
        logging.info("Issues detected in uploading videos:")
        for i in video_issues:
            logging.info("- %s", str(i))

    if len(annotation_issues) > 0:
        logging.info("Issues detected in uploading:")
        for i in annotation_issues:
            logging.info("- %s", str(i))
