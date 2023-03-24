Quickstart
==========


Installation
------------
To install the Pyindexity package, you can:

* Either clone the repository and make the package accessible
  via the ``PYTHONPATH`` environment variable,

* Or install the package with pip from the Ircad pypi server,
  by providing your credentials, using the following command:

.. code:: bash

    $ pip install pyindexity --extra-index-url https://pypi.ircad.fr/

How to use the module
---------------------

* Import pyindexity like this:


.. code:: python

    from pyindexity import pyindexity


* Create the client and login

First, you need to create the client object
and login to an instance of Indexity via:

.. code:: python

    # Create a instance of client
    client = pyindexity.Client(base_url=base_url)
    # Login on the instance
    client.login()

With ``base_url`` being the API url of the indexity instance to address.
In order to ``login``, you will provide your credentials to the indexity platform,
or by using a saved pyindexity token.


* Access the different methods in the module:

Depending on the task at hand call the appropriate method,
provide needed arguments as indicated in `pyindexity documentation`_.

.. _pyindexity documentation: pyindexity.html

Some use
case examples are provided below.

Sample use cases of pyindexity
------------------------------

1. Download a video

In order to download a video you can use the download_video method,
provide the json object of the video to download,
the needed video resolution, and file name of the downloaded video.

.. code:: python

    client.download_video(video, video_resolution_index, filename)

2. Upload a video

In order to upload a video, use the upload_video method.
Provide the path to the video to be uploaded. Here is an an example:

.. code:: python

    client.upload_video('video.mp4')

3. Get the list of videos on the platform

You can get the list of all videos on the platform, or a selected list of videos by using a filter
here is an example that will return all the videos on the plaftorm:

.. code:: python

    client.get_videos()
