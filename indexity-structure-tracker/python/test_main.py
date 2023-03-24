"""
Test of video tracker using OpenCV.
"""

import sys
from _pytest.monkeypatch import MonkeyPatch

# ignore cv2 dependency
sys.modules['cv2'] = object()  # pylint: disable=wrong-import-position

import main

# HELPERS


def create_shape(x, y, width, height):
    """
    Create a shape corresponding to the tracker results
    """
    return {
        "x": x,
        "y": y,
        "width": width,
        "height": height
    }


# CONSTANTS

MOVEMENT_THRESHOLD = 0.5
SHAPE_KEYS = ["x", "y", "width", "height"]

EMPTY_SHAPE = create_shape(0, 0, 0, 0)

POSITIONS = {
    "100": EMPTY_SHAPE,
    "50": EMPTY_SHAPE,
    "400": EMPTY_SHAPE,
    "95": EMPTY_SHAPE,
    "10": EMPTY_SHAPE,
}


# GET_ENV

def test_get_env_default_value():
    """
    Check that get_env falls back to default value
    """
    MonkeyPatch().delenv("TEST", raising=False)
    val = main.get_env(False, bool, "TEST")
    assert not val


def test_get_env():
    """
    Check that get_env uses environment value
    """
    MonkeyPatch().setenv("TEST", str(True))
    val = main.get_env(False, bool, "TEST")
    assert val
    MonkeyPatch().delenv("TEST", raising=False)


# SHAPE_TO_PERCENT


def test_shape_to_percent():
    """ Test shape_to_percent function """
    shape = create_shape(150, 0, 30, 100)
    percent_shape = main.shape_to_percent(shape, 300, 200)
    expected = create_shape(50, 0, 10, 50)

    assert percent_shape == expected


# HAS_BBOX_MOVED


def test_with_movement():
    """
    Test shape_to_percent function
    Each movement or scale greater than the threshold should
    indicate that the bounding box moved
    """
    for key in SHAPE_KEYS:
        prev_shape = create_shape(2, 4, 50, 100)
        next_shape = prev_shape.copy()
        next_shape[key] = next_shape[key] + 0.6

        has_moved = main.has_bbox_moved(prev_shape, next_shape, MOVEMENT_THRESHOLD)
        assert has_moved


def test_with_light_movement():
    """
    Test shape_to_percent function
    A movement or scale smaller than the threshold should
    indicate that the bounding box did not change enough
    """
    prev_shape = create_shape(2, 4, 50, 100)
    next_shape = create_shape(2.3, 4.2, 50.1, 100.05)

    has_moved = main.has_bbox_moved(prev_shape, next_shape, MOVEMENT_THRESHOLD)
    assert not has_moved


def test_without_movement():
    """
    Test shape_to_percent function
    An unchanged shape should indicate that the bounding
    box did not change enough
    """
    prev_shape = create_shape(2, 4, 50, 100)
    next_shape = prev_shape.copy()

    has_moved = main.has_bbox_moved(prev_shape, next_shape, MOVEMENT_THRESHOLD)
    assert not has_moved


# GET_LAST_TIMESTAMP

def test_get_last_timestamp():
    """
    Test get_last_timestamp function
    """
    last_timestamp = main.get_last_timestamp(POSITIONS)

    assert last_timestamp == 400


# BUILD_ANNOTATION

def test_build_annotation():
    """
    Test build_annotation function
    """
    annotation_first_timestamp = 10
    annotation_last_timestamp = 1000
    expected = {
        "positions": POSITIONS,
        "duration": 990,
        "timestamp": 10
    }

    built_annotation = main.build_annotation(
        POSITIONS,
        annotation_first_timestamp,
        annotation_last_timestamp
    )
    assert built_annotation == expected


def test_build_short_annotation():
    """
    Test build_annotation function
    The annotation should respect a minimum duration
    """
    annotation_first_timestamp = 0
    annotation_last_timestamp = 1
    expected = {
        "positions": {"0": EMPTY_SHAPE},
        "duration": main.MIN_DURATION,
        "timestamp": 0
    }

    built_annotation = main.build_annotation(
        {"0": EMPTY_SHAPE},
        annotation_first_timestamp,
        annotation_last_timestamp
    )
    assert built_annotation == expected
