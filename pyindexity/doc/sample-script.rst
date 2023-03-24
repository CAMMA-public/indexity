Sample scripts
==============
Below are full-fledged examples of how to use PyIndexity client.

Download video-group
--------------------
The script downloads videos and their corresponding annotations in the
following steps:

1. Check the list of video groups which start with specified name
2. Get the videos in the mentioned group
3. Download and save those videos in the provided directory.
4. Download the corresponding annotations

.. literalinclude:: scripts/download_group.py

Uploading videos
----------------
Below is an example of how to upload some videos on indexity platform.

.. literalinclude:: scripts/upload_videos.py

Move a video to a specific target group
---------------------------------------

Below is an example of how to move some videos to a specific target group on the indexity platform

.. literalinclude:: scripts/move_videos.py
