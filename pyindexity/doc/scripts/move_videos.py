import argparse
import logging

from pyindexity import pyindexity

logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(message)s')


def move_videos(video_filter, base_url, group_id, dry_run):
    """Move videos to a specified target group

    Args:
        - video_filter (list): the filter to be used to select videos
        - base_url (str): url to the indexity platform
        - group_id (str): the id of the group
        - dry_run (boolean): initially set to false to avoid changing
                             the db when testing
    """

    client = pyindexity.Client(base_url=base_url)
    is_logged = client.login()
    if not is_logged:
        logging.error("You're not logged in Indexity")
        exit(1)

    videos = client.get_videos([f'name||starts||{video_filter}'])
    for video in videos:
        video_id = video["id"]
        video_name = video["name"]
        logging.info(f'Adding video {video_name} in group {group_id}')
        if not dry_run:
            client.add_video_to_group(video_id, group_id)


def main():
    parsed_arguments = parse_arguments()

    base_url = parsed_arguments.indexity_url
    video_filter = parsed_arguments.video_filter
    group_id = parsed_arguments.group_id
    dry_run = parsed_arguments.dry

    move_videos(video_filter, base_url, group_id, dry_run)


# Parse command line arguments
def parse_arguments(arguments=None):
    parser = argparse.ArgumentParser(
        description='Utility to move videos in indexity.'
    )
    parser.add_argument(
        '--indexity_url',
        '-u',
        type=str,
        default='https://api.indexity.local',
        help='Define indexity-api URL to use.'
    )
    parser.add_argument(
        '--dry',
        action='store_true',
        help='Prints some stuff, but do nothing that have any consequences.'
    )
    parser.add_argument(
        '--video_filter',
        '-v',
        required=True,
        type=str,
        help='Define filter to find video.'
    )
    parser.add_argument(
        '--group_id',
        '-g',
        required=True,
        type=int,
        help='Define group ID to move found videos.'
    )
    return parser.parse_args(arguments)


if __name__ == "__main__":
    main()
