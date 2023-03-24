"""
Video tracker using OpenCV.
"""

import base64
import json
import os
import sys
import logging
from logging import FileHandler, StreamHandler, Formatter
from datetime import datetime

import cv2

# ---------
# CONSTANTS
# ---------

# time (in ms) we wait to declare a structure definitively lost
TIMEOUT = 3000
# minimum duration (in ms) of an annotation
MIN_DURATION = 33
# how many characters are printed per output for the resulting annotations
OUTPUT_CHUNK_SIZE = 1000
# precision of the resulting annotations coordinates
COORD_PRECISION = 5
# message to send at the end of each annotation
MSG_END_ANNOTATION = "EOA"
# time interval (in ms) between two analysis of the image
DEFAULT_INTERVAL = 100
# how much (in % of the video width) a structure has to move to consider that its position changed
DEFAULT_THRESHOLD = 1.5

LOG_DIR = "logs"

# ---------
# FUNCTIONS
# ---------


def get_file_logger(annotation_id):
    """
    Create log directory, log file and configure file logger
    """
    file_logger = logging.getLogger(f"{__name__}_file")
    log_file = ""

    if file_logger.hasHandlers():
        log_file = file_logger.handlers[0].baseFilename
    else:
        log_date = datetime.now().strftime("%Y-%m-%d_%H:%M:%S.%f")
        log_file = f"logs/tracking_{annotation_id}_{log_date}.log"

        if not os.path.exists(LOG_DIR):
            os.mkdir(LOG_DIR)

        log_file_handler = FileHandler(log_file)
        log_file_handler.setLevel(logging.INFO)
        log_file_handler.setFormatter(Formatter('%(asctime)s - %(levelname)s - %(message)s'))

        file_logger = logging.getLogger(f"{__name__}_file")
        file_logger.setLevel(logging.INFO)
        file_logger.addHandler(log_file_handler)

    return file_logger, log_file


def get_logger():
    """
    Configure logger for stdout and stderr outputs
    """
    logger = logging.getLogger(__name__)

    if not logger.hasHandlers():
        logger_handler_stdout = StreamHandler(sys.stdout)
        logger_handler_stdout.setLevel(logging.INFO)
        logger_handler_stdout.addFilter(lambda record: record.levelno <= logging.INFO)

        logger_handler_stderr = StreamHandler(sys.stderr)
        logger_handler_stderr.setLevel(logging.WARNING)

        logger.setLevel(logging.INFO)
        logger.addHandler(logger_handler_stdout)
        logger.addHandler(logger_handler_stderr)

    return logger


def get_env(default_value, transformer, env_name):
    """
    Get the value of an environment variable or fall back to default value
    """
    val = default_value
    if env_name in os.environ:
        try:
            val = transformer(os.environ[env_name])
        except ValueError:
            logger = get_logger()
            logger.error(f"{env_name} ({os.environ[env_name]}) is not of correct type")
            sys.exit()
    return val


def init_video(video_path, init_ts, init_bbox, annotation_id):
    """
    Initialize the video to the correct frame, and the tracker
    with the first bounding box
    """
    logger = get_logger()
    file_logger, _ = get_file_logger(annotation_id)

    tracker = cv2.TrackerKCF_create()
    video = cv2.VideoCapture(video_path)
    file_logger.info(f'Created tracker. Got video at path {video_path}')

    fps = round(video.get(cv2.CAP_PROP_FPS), 2)

    # start the video directly at frame of interest
    frame_nb = int(fps * init_ts / 1000)
    video.set(cv2.CAP_PROP_POS_FRAMES, frame_nb)

    if not video.isOpened():
        file_logger.error(f"Cannot open video at {video_path}")
        logger.error(f"Cannot open video at {video_path}")
        sys.exit()
    file_logger.info(f"Video is opened at frame {frame_nb}")

    success, frame = video.read()
    if not success:
        file_logger.error("Cannot read first video frame")
        logger.error("Cannot read first video frame")
        sys.exit()
    file_logger.info("Started reading video")

    success = tracker.init(frame, (init_bbox["x"], init_bbox["y"], init_bbox["width"], init_bbox["height"]))
    if not success:
        file_logger.error("Cannot initialize tracker")
        logger.error("Cannot initialize tracker")
        sys.exit()
    file_logger.info("Tracker is initialized")

    return video, tracker, fps


def shape_to_percent(shape, total_width, total_height):
    """
    Transform absolute bounding box coordinates to percents
    """

    return {
        "x": round(shape["x"] / total_width * 100, COORD_PRECISION),
        "y": round(shape["y"] / total_height * 100, COORD_PRECISION),
        "width": round(shape["width"] / total_width * 100, COORD_PRECISION),
        "height": round(shape["height"] / total_height * 100, COORD_PRECISION)
    }


def has_bbox_moved(previous_shape, shape, threshold):
    """
    Compare two positions and indicates if the difference is important
    enough to consider the bounding box has moved
    """
    return abs(previous_shape["x"] - shape["x"]) > threshold or \
        abs(previous_shape["y"] - shape["y"]) > threshold or \
        abs(previous_shape["width"] - shape["width"]) > threshold or \
        abs(previous_shape["height"] - shape["height"]) > threshold


def get_last_timestamp(pos):
    """
    Get the last timestamp existing for the annotation
    """
    timestamps = [int(i) for i in list(pos.keys())]
    return max(timestamps)


def build_annotation(pos, annotation_first_ts, annotation_last_ts):
    """
    Format an annotation
    """
    duration = int(annotation_last_ts - annotation_first_ts)
    if duration < MIN_DURATION:
        duration = MIN_DURATION

    return {
        "positions": pos,
        "duration": duration,
        "timestamp": int(annotation_first_ts)
    }


def output_annotation(annotation_to_output):
    """
    Output an annotation by chunks
    """
    # outputs with double quotes so that it's valid JSON
    output = json.dumps(annotation_to_output)
    logger = get_logger()

    for i in range(0, len(output), OUTPUT_CHUNK_SIZE):
        logger.info(output[i:i + OUTPUT_CHUNK_SIZE])
    logger.info(MSG_END_ANNOTATION)


def main():
    """
    Main function
    """

    # ------
    # INPUTS
    # ------

    video_path = sys.argv[1]
    input_annotation = json.loads(base64.b64decode(sys.argv[2]).decode("utf-8"))

    # logs
    file_logger, log_file = get_file_logger(input_annotation['id'])

    file_logger.info("Logs initialized")

    # display (or not) the tracking results in the video
    display_tracking = get_env(False, bool, 'DISPLAY_TRACKING')
    interval = get_env(DEFAULT_INTERVAL, int, 'TRACK_INTERVAL')
    movement_threshold = get_env(DEFAULT_THRESHOLD, float, 'MOVEMENT_THRESHOLD')

    video_height = int(input_annotation["video"]["height"])
    video_width = int(input_annotation["video"]["width"])

    data_last_timestamp = get_last_timestamp(input_annotation["shape"]["positions"])
    bbox_percent = input_annotation["shape"]["positions"][str(data_last_timestamp)]
    init_timestamp = data_last_timestamp + input_annotation["duration"]

    # -------
    # OUTPUTS
    # -------
    positions = {}
    positions[str(init_timestamp)] = bbox_percent

    # get absolute coordinates
    bbox = {
        "x": bbox_percent["x"] / 100 * video_width,
        "y": bbox_percent["y"] / 100 * video_height,
        "width": bbox_percent["width"] / 100 * video_width,
        "height": bbox_percent["height"] / 100 * video_height
    }

    video, tracker, fps = init_video(
        video_path,
        init_timestamp,
        bbox,
        input_annotation['id']
    )

    # ANALYSIS
    frame_count = 0

    current_timestamp = init_timestamp
    annotation_first_timestamp = init_timestamp
    annotation_last_timestamp = init_timestamp
    annotation_last_idle_timestamp = init_timestamp

    # if 'max_lost_frames' are lost, we stop the tracking
    max_lost_frames = int(fps / 1000 * TIMEOUT)
    lost_frames_count = 0

    # know how many frames we can skip between each analysis
    frame_interval = int(round(fps / 1000 * interval, 0))
    ms_interval = 1 / fps * 1000

    while True:
        current_timestamp += ms_interval

        success, frame = video.read()
        if not success:
            file_logger.info(f"Cannot read video frame: stop tracking at {current_timestamp}")
            break

        frame_count += 1
        if (frame_count % frame_interval) != 0:
            continue
        frame_count = 0

        success, bbox = tracker.update(frame)
        bbox = {"x": bbox[0], "y": bbox[1], "width": bbox[2], "height": bbox[3]}
        file_logger.debug(f"Tracker results: {bbox} at {current_timestamp}")

        if success:
            if display_tracking:
                pt_1 = (int(bbox["x"]), int(bbox["y"]))
                pt_2 = (int(bbox["x"] + bbox["width"]), int(bbox["y"] + bbox["height"]))
                cv2.rectangle(frame, pt_1, pt_2, (255, 0, 0), 2, 1)

            has_moved = True
            bbox_percent = shape_to_percent(bbox, video_width, video_height)

            if annotation_first_timestamp == -1:
                # save the first timestamp of a new annotation
                annotation_first_timestamp = current_timestamp
                lost_frames_count = 0
            else:
                # it's at least the second position of the annotation
                has_moved = has_bbox_moved(
                    positions[str(int(annotation_last_timestamp))],
                    bbox_percent,
                    movement_threshold
                )

            if has_moved:
                annotation_last_timestamp = current_timestamp
                positions[str(int(current_timestamp))] = bbox_percent
            else:
                annotation_last_idle_timestamp = current_timestamp

        else:
            if display_tracking:
                cv2.putText(frame, "Tracking failure detected", (100, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 0, 255),
                            2)

            # save previous positions in an annotation
            if len(positions) > 0:
                annotation = build_annotation(
                    positions,
                    annotation_first_timestamp,
                    max(annotation_last_timestamp, annotation_last_idle_timestamp)
                )
                output_annotation(annotation)
                file_logger.info(f"Sent 1 annotation at {current_timestamp}")

                annotation_first_timestamp = -1
                positions = {}

            lost_frames_count += 1
            if lost_frames_count > max_lost_frames:
                file_logger.info(f"{lost_frames_count} frames lost: stop tracking at {current_timestamp}")
                break

        if display_tracking:
            cv2.imshow("Tracking", frame)

            # interruption of the video with 'q' key
            if cv2.waitKey(25) & 0xFF == ord('q'):
                cv2.destroyAllWindows()
                file_logger.info(f"User action: stop tracking at {current_timestamp}")
                break

    video.release()
    file_logger.info("Video released")

    if len(positions) > 0:
        annotation = build_annotation(
            positions,
            annotation_first_timestamp,
            max(annotation_last_timestamp, annotation_last_idle_timestamp)
        )
        output_annotation(annotation)
        file_logger.info("Sent 1 annotation")

    # delete log file
    if os.path.isfile(log_file):
        os.remove(log_file)


if __name__ == '__main__':
    LOGGER = get_logger()

    if len(sys.argv) != 3:
        LOGGER.error("USAGE: main.py <video_path> <base_64_annotation>")
    else:
        main()
