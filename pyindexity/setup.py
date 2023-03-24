import os
import setuptools
from setuptools_scm.version import get_local_node_and_date
import sys


with open("README.md", "r") as fh:
    long_description = fh.read()


def get_custom_local_scheme(version):
    """
    Build a custom local scheme based on either the current tag or branch
    """
    # If we are on a tag, we use the default naming convention
    if os.environ.get('CI_COMMIT_TAG'):
        return get_local_node_and_date(version)
    # Otherwise we use the branch name
    # We use git to query the branch name to be able
    # to build the package outside of the CI
    elif os.environ.get('CI_COMMIT_REF_NAME'):
        return "+" + os.environ.get('CI_COMMIT_REF_NAME')
    else:
        print("Could not reliably determine version. "
              "Please either set the CI_COMMIT_TAG or "
              "the CI_COMMIT_REF_NAME variables.")
        sys.exit(1)


setuptools.setup(
    use_scm_version={
        "tag_regex": r"(?:[\w-]+-)?(?P<version>[vV]?\d+(?:\.\d+){0,2}[^\+]+)(?:\+.*)?$",  # noqa: E501 # pylint: disable=line-too-long
        "local_scheme": get_custom_local_scheme},
    setup_requires=['setuptools_scm'],
    name="pyindexity",
    description="Interface to the Indexity annotation platform",
    long_description="",
    long_description_content_type="text/markdown",
    url="https://<your_python_regitry>/",
    packages=setuptools.find_namespace_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.6',
    install_requires=[
        "requests>=2.21.0",
        "ffmpeg-python>=0.2.0",
        "requests_toolbelt>=0.9.1",
        "progressbar2>=3.51.4"
    ]
)
