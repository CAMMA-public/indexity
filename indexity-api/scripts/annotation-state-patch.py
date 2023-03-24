import requests
import os
import json

# This script gets all videos (by first getting original videos and then scaled videos)
# that have an 'annotationState' property set to null,
# then, it will save these data (in order to be able to rollback the update)
# in a file (named annotation-state-null-results.json)
# finally, it will update these null values to 'ANNOTATION_NOT_REQUIRED'

# Usage:
# It is recommended to use conda (https://www.anaconda.com/products/individual) and install a virtual env,
# then, run the following commands:
# conda create -n annotation-state-patch python=3.8
# conda activate annotation-state-patch
# pip install requests
# AUTH_TOKEN=<indexity_api_admin_token> python annotation-state-patch.py


BASE_URL = os.getenv('INDEXITY_API_BASE_URL', 'http://localhost:8082')

def getVideosWithNullAnnotationState():
    original_videos_response = requests.get(
        f'{BASE_URL}/videos?filter=annotationState||isnull&offset=0&limit=0',
        headers={
            "Authorization": "Bearer " + os.getenv('AUTH_TOKEN')
        })
    original_videos_response.raise_for_status()
    all_videos = original_videos_response.json()

    for video in all_videos["data"]:
        for child_id in video["childrenIds"]:
            child_video_response = requests.get(f'{BASE_URL}/videos/{child_id}', headers={
                "Authorization": "Bearer " + os.getenv('AUTH_TOKEN')
            })
            child_video_response.raise_for_status()
            scaled_video = child_video_response.json()
            if scaled_video["annotationState"] is None:
                all_videos["data"].append(scaled_video)
                all_videos["total"] = all_videos["total"] + 1
    return all_videos

def writeResults(results):
    with open('../annotation-state-null-results.json', 'w') as outfile:
        json.dump(results, outfile)

def setAnnotationStateToDefaultValue(results):
    for video in results['data']:
        res = requests.patch(f'{BASE_URL}/videos/{video["id"]}/annotation-state',
                             headers={
                                 "Authorization": "Bearer " + os.getenv('AUTH_TOKEN')
                             },
                             data={
                                 "state": "ANNOTATION_NOT_REQUIRED"
                             })
        res.raise_for_status()


if __name__ == '__main__':
    json_results = getVideosWithNullAnnotationState()
    writeResults(json_results)
    setAnnotationStateToDefaultValue(json_results)
