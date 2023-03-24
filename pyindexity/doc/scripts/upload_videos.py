#!/usr/bin/env python

import argparse
import logging
import os

from pyindexity import pyindexity

logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(message)s')


def upload_videos(video_paths, base_url, group_id, dry_run):
    """ Upload video files to an Indexity instance.
    Args:
        video_paths (list): List of paths containing the videos to be uploaded
        base_url (str): API url of the Indexity instance to address
        group_id (int): Group ID destination to add uploaded videos
        dry_run (bool): Perform a dry-run to check input data
    Returns:
        Nothing.
    """

    # Gather videos
    videos = []
    for path in video_paths:
        if not os.path.exists(path):
            logging.error(f'Path {path} does not exists')
            exit(1)
        if os.path.isdir(path):
            for root, dirs, files in os.walk(path):
                for file in files:
                    if file.endswith('.mp4'):
                        videos.append(os.path.join(root, file))
        elif path.endswith('.mp4'):
            videos.append(path)

    # Sort the videos
    videos = sorted(videos)
    logging.info(f'Number of videos to upload: {len(videos)}')
    for va in videos:
        logging.info(f"- {va}")

    video_issues = []

    client = pyindexity.Client(base_url=base_url)
    is_logged = client.login()
    if not is_logged:
        logging.error("You're not logged in Indexity")
        exit(1)

    for i, va in enumerate(videos):
        current_index_str = f'[{i}/{(len(videos) - 1)}]'
        video_name = os.path.basename(va)
        video = client.get_videos([f'name||eq||{video_name}'])
        if video:
            logging.info(f'{current_index_str} Video {video_name} '
                         f'already uploaded as id: {video[0]["id"]}')
            if not dry_run and group_id:
                logging.info(f'{current_index_str} Adding video {video_name} '
                             f'in group {group_id}')
                client.add_video_to_group(video[0]['id'], group_id)
        else:
            logging.info(f'{current_index_str} Uploading {va}')

        if not dry_run:
            video = client.upload_video(va, group_id=group_id)
            if not video:
                logging.info(f'{current_index_str} '
                             f'There was an issue uploading video: {va}')
                video_issues.append(va)
                continue

    if len(video_issues) > 0:
        logging.info('Issues detected in uploading videos:')
        for video_issue in video_issues:
            logging.info(f"- {video_issue}")


def main():
    parsed_arguments = parse_arguments()

    base_url = parsed_arguments.indexity_url
    video_paths = parsed_arguments.video_paths
    group_id = parsed_arguments.group_id
    dry_run = parsed_arguments.dry

    upload_videos(video_paths, base_url, group_id, dry_run)


# Parse command line arguments
def parse_arguments(arguments=None):
    parser = argparse.ArgumentParser(
        description='Utility to upload videos to indexity.'
    )
    parser.add_argument(
        '--indexity_url',
        '-u',
        type=str,
        default='https://api.indexity.local',
        help='Define indexity-api URL to use to upload videos.'
    )
    parser.add_argument(
        '--dry',
        action='store_true',
        help='Prints some stuff, but do nothing that have any consequences.'
    )
    parser.add_argument(
        'video_paths',
        nargs='+',
        help='Define path (dir or file) to find videos to upload.'
    )
    parser.add_argument(
        '--group_id',
        '-g',
        type=int,
        help='Define group ID to move uploaded videos.'
    )
    return parser.parse_args(arguments)


if __name__ == "__main__":
    main()
