import unittest
import tempfile
from pyindexity.pyindexity import Client
from unittest import TestCase, mock
from unittest.mock import mock_open


class TestPyindexity(TestCase):
    """Mainly test the return type of various methods.
       The requests are mocked to return a value that will be asserted
       depending on the desired outcome.
       Other libraries are patched using mock.patch

    """

    @mock.patch('requests.post')
    @mock.patch('getpass.getpass', return_value="password")
    @mock.patch('builtins.input', return_value="email")
    @mock.patch('os.path.exists', return_value=False)
    def setUp(self, mock_path,
              mock_email, mock_paswd, mock_post):
        """Mock a pyindexity client with login access.
           Also create dummy annotation and a video objects to be used by
           other tests methods
        Args:
            - mock_path: variable for mocking the path to the token
            - mock_email: variable for mocking the input email
            - mock_paswd: variable for mocking the input password
            - mock_post: variable for mocking the requests.post method
        """
        mock_resp = mock.Mock()
        mock_resp.json.return_value = {'accessToken': 'token',
                                       'user': {'id': '1', 'name': 'name'}}
        mock_post.return_value = mock_resp
        _, self.temp_token = tempfile.mkstemp()
        self.client = Client(token_file_path=self.temp_token)
        self.client.login()
        #  fake the annotation object to be used for different tests
        self.annotation = [
            {
                "label": {
                    "name": "Test annotation",
                    "color": "#b31111",
                    "type": "phase"
                },
                "shape": None,
                "timestamp": 200,
                "duration": 1000,
                "videoId": 1,
                "userId": 2
            },
            {
                "label": {
                    "name": "Test annotation",
                    "color": "#b31111",
                    "type": "phase"
                },
                "shape": None,
                "timestamp": 200,
                "duration": 1000,
                "videoId": 1,
                "userId": 1
            }
        ]
        #  fake video object to be used for different tests
        self.video = {
            "id": 0,
            "createdAt": "2020-07-08T05:28:21.438Z",
            "updatedAt": "2020-07-08T05:28:22.124Z",
            "url": "/home/r/f-a490-84153af352e9.mp4",
            "description": "",
            "name": "video18.mp4",
            "fileName": "f06cab39-fb14-4694-a490-84153af352e9.mp4",
            "thumbnailUrl": "storage/vids/f039-f52e9.mp4_thumbnail.jpg",
            "userId": 2,
            "height": 480,
            "width": 854,
            "parentId": None,
            "groupIds": [],
            "childrenIds": [
                1692,
                1693
            ],
            "format": "custom"
        }

    @mock.patch('requests.post')
    @mock.patch('getpass.getpass', return_value="password")
    @mock.patch('builtins.input', return_value="email")
    @mock.patch('os.path.exists', return_value=False)
    def test_login_with_credentials(self, mock_path,
                                    mock_email, mock_paswd, mock_post):
        """Test the login by correct email and password. the test passes when
           the access is granted.
        Args:
            - mock_path: variable for patching the path to the token
            - mock_email: variable for patching the input email
            - mock_paswd: variable for patching the input password
            - mock_post: variable for patching the requests.post method
        """
        mock_resp = mock.Mock()
        mock_resp.json.return_value = {'accessToken': 'token',
                                       'user': {'id': '1', 'name': 'name'}}
        mock_post.return_value = mock_resp
        self.client = Client(token_file_path=self.temp_token)
        self.assertTrue(self.client.login())

    @mock.patch.object(Client, 'auth_verify', return_value=True)
    @mock.patch('builtins.open', mock_open(read_data="token"))
    @mock.patch('os.path.exists', return_value=True)
    def test_login_with_token(self, mock_path, mock_auth):
        """Test the login with a saved token.
        Args:
            - mock_path: variable for patching the path to the saved token
            - mock_auth: variable for patching the auth_verify method
        """
        self.assertTrue(self.client.login())

    @mock.patch('requests.get')
    def test_auth_verify(self, mock_get):
        """check the validity of the token
        Args:
            - mock_get: variable for patching the requests.get method
        """
        mock_resp = mock.Mock()
        mock_resp.json.return_value = {
            'id': 12322,
            'user': {
                'id': '1',
                'name': 'name'
            }
        }
        mock_get.return_value = mock_resp
        token = "token"
        result = self.client.auth_verify(token)
        self.assertTrue(result)

    @mock.patch('requests.get')
    def test_get_videos(self, mock_get):
        """ Ensure the method returns a list of videos
        Args:
            - mock_get: variable for patching the requests.get method
        """
        response_mock = mock.Mock()
        response_mock.json.return_value = {"id": 1, "data": ["vid1", "vid2"]}
        mock_get.return_value = response_mock
        result = self.client.get_videos()
        expected_result = ['vid1', 'vid2']  # returned a list of videos
        self.assertEqual(result, expected_result)

    @mock.patch('copy.deepcopy')
    @mock.patch.object(Client, 'get_available_resolutions')
    @mock.patch.object(Client, '_Client__get_video_data',
                       return_value='video')
    def test_download_videos(self, mock_vid, mock_resolution, mock_copy):
        """ Expected result is a string (path to the downloaded vids)
        Args:
            - mock_vid: variable for patching the __get_video_data method
        """
        mock_copy.return_value = self.video
        mock_resolution.return_value = {"vid": {"id": 0, "res": [0, 1]}}
        video = self.video
        result = self.client.download_video(video)
        self.assertTrue(type(result) is str)

    def test_download_annotations(self):
        """ Check if the returned data is json object of annotation"""
        with mock.patch.object(Client, '_Client__get_video_data') as m:
            m.return_value = self.annotation
            video = self.video
            result = self.client.download_annotations(video)
            self.assertTrue(type(result) is list)

    @mock.patch.object(Client, '_Client__get_video_data')
    @mock.patch('builtins.sorted')
    def test_get_available_resolutions(self, mock_sorted, mock_video_data):
        """ the test returns a resolution in json format, or
            None if something wrong happened
        """

        mock_video_data.return_value = [{"id": "1", "data": ["vid1", "vid2"]}]
        mock_sorted.return_value = [{"id": "1", "data": ["vid1", "vid2"]}]
        video = self.video
        result = self.client.get_available_resolutions(video)
        self.assertTrue(type(result) is list)

    @mock.patch('requests.post')
    @mock.patch.object(Client, '_Client__check_annotations',
                       return_value=True)
    def test_upload_annotation(self, mock_post, mock_annotation):
        """Returns the json output of the request command
        Args:
            - mock_post: variable to mock the requests.post method
            - mock_annotation: variable to mock the _check_annotations
            """
        self.client.__user_id = 2
        annotation = self.annotation
        response_mock = mock.Mock()
        response_mock.json.return_value = {"id": "1", "data": ["vid1", "vid2"]}
        mock_annotation.return_value = response_mock
        expected_result = self.client.upload_annotations(annotation, 4)
        result = {"id": "1", "data": ["vid1", "vid2"]}
        self.assertEqual(expected_result, result)

    @mock.patch('requests.patch')
    def test_update_video(self, mock_patch):
        """pass when a json output is returned
        Args:
            - mock_patch: variable for patching the requests.patch method
        """
        video = self.video
        response_mock = mock.Mock()
        response_mock.json.return_value = {"id": "1", "data": ["vid1", "vid2"]}
        mock_patch.return_value = response_mock
        mock_patch.return_value.status_code = 200
        expected_result = self.client.update_video(video, name="vid")
        result = [{"id": "1", "data": ["vid1", "vid2"]}]
        self.assertEqual(expected_result, result)

    def test_upload_xml_annotation(self):
        """Test the upload of the annotation. it passes when an json
            output is returned.
        """
        xml_file_path = 'test_data/file.xml'
        video_list = {"id": 1, "data": ["vid1", "vid2"]}
        video = {0: {"id": 1, "name": 2}, "data": ["vid1", "vid2"]}

        with mock.patch.object(Client, '_Client__post_file') as m:
            m.return_value = video_list
            expected_result = \
                self.client.upload_xml_annotation(video, xml_file_path)
            result = {"id": 1, "data": ["vid1", "vid2"]}
            self.assertEqual(expected_result, result)

    @mock.patch('ffmpeg.probe')
    @mock.patch.object(Client, '_Client__post_file')
    def test_upload_video(self, mock_post_file, mock_ffmpeg):
        """Test the upload of a video on the platform.
        Args:
            - mock_post_file: variable for patching the _post_file method
            - mock_ffmpeg: variable for patching ffmpeg.probe function
        """
        mock_ffmpeg.return_value = {"streams": [{"codec_name": "h264"}]}
        mock_post_file.return_value = [{"id": "1", "data": ["vid1", "vid2"]}]
        expected_result = self.client.upload_video('vid')
        self.assertTrue(type(expected_result) is list)

    @mock.patch('requests.post')
    def test_add_video_to_group(self, mock_post):
        """Test adding a video to a group on the platform.
        Args:
            - mock_post: variable for patching the requests.post method
        """
        video = self.video
        video_ids = {
            'videoIds': [
                video["id"]
            ]
        }
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = video_ids
        expected_result = self.client.add_video_to_group(
            video_id=video["id"], group_id=0)
        self.assertTrue(expected_result)

        mock_post.return_value.status_code = 404
        expected_result = self.client.add_video_to_group(
            video_id=video["id"], group_id=999)
        self.assertFalse(expected_result)


if __name__ == '__main__':
    unittest.main()
