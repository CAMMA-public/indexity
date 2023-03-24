#!/usr/bin/env python

import argparse
import logging
import os
import copy

from pyindexity import pyindexity

logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(message)s')


def download_group(base_url, group_name, output_path, dry_run):
    """ Upload a video/annotation database to an Indexity instance.
    Args:
        base_url (str): API url of the Indexity instance to address
        group_name (str): Group name to download
        output_path (str): Destination path for downloaded videos
                           and annotations
        dry_run (bool): Perform a dry-run to check input data
    Returns:
        Nothing.
    """
    # create a client and login with credentials
    client = pyindexity.Client(base_url=base_url)
    is_logged = client.login()
    if not is_logged:
        logging.error("You're not logged in Indexity")
        exit(1)

    # get the videos group starting with specified group name
    group = client.get_video_groups(filters=[f"name||starts||{group_name}"])
    if not group:
        logging.error(f'Not video group found with name "{group_name}".')
        exit(1)
    # get the videos in the specified category
    video_ids = group[0]['videoIds']
    videos = client.get_videos(filters=[f"id||in||{str(video_ids)}"])

    # specify the path to the output videos and annotations
    video_output_path = os.path.join(output_path, "videos")
    annotation_output_path = os.path.join(output_path, "annotations")
    if not dry_run:
        os.makedirs(video_output_path, exist_ok=True)
        os.makedirs(annotation_output_path, exist_ok=True)

    # Download videos and their corresponding annotations
    for i, v in enumerate(videos):
        v_new = copy.deepcopy(v)
        video_fname = os.path.join(video_output_path, v["name"])
        if not os.path.exists(video_fname):
            logging.info("[%s/%s] Downloading video to %s",
                         i, len(videos) - 1, video_fname)
            if not dry_run:
                client.download_video(v_new, filename=video_fname)
        else:
            logging.info("%s already exists.", video_fname)

        r, e = os.path.splitext(v["name"])
        annotation_fname = os.path.join(annotation_output_path, r + ".json")
        if not os.path.exists(annotation_fname):
            logging.info("[%s/%s] Downloading annotation to %s",
                         i, len(videos) - 1, annotation_fname)
            if not dry_run:
                client.download_annotations(v, filename=annotation_fname)


def main():
    parsed_arguments = parse_arguments()

    base_url = parsed_arguments.indexity_url
    group_name = parsed_arguments.group_name
    output_path = parsed_arguments.output_path
    dry_run = parsed_arguments.dry

    download_group(base_url, group_name, output_path, dry_run)


# Parse command line arguments
def parse_arguments(arguments=None):
    parser = argparse.ArgumentParser(
        description='Utility to download videos from indexity.'
    )
    parser.add_argument(
        '--indexity_url',
        '-u',
        type=str,
        default='https://api.indexity.local',
        help='Define indexity-api URL to use to download videos.'
    )
    parser.add_argument(
        '--dry',
        action='store_true',
        help='Prints some stuff, but do nothing that have any consequences.'
    )
    parser.add_argument(
        '--output_path',
        '-o',
        required=True,
        type=str,
        help='Define destination path for downloaded videos and annotations'
    )
    parser.add_argument(
        '--group_name',
        '-g',
        required=True,
        type=str,
        help='Define group name to download.'
    )
    return parser.parse_args(arguments)


if __name__ == "__main__":
    main()
