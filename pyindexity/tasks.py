""" Invoke Tasks """

import logging.config
import os
import requests

from invoke import task, exceptions  # pylint: disable=import-error

LOGGER = logging.getLogger(__name__)


def get_files(path, extension=None):
    """ Get the list of files recursively in a directory, matching an extension.
    """

    file_list = []
    for root, _, files in os.walk(path):
        for file in files:
            if extension:
                if file.endswith(extension):
                    file_list.append(os.path.join(root, file))
            else:
                file_list.append(os.path.join(root, file))

    return file_list


@task
def flake8(ctx):
    """
    Check the coding style according to Flake8.
    """
    python_files = get_files(os.path.dirname(__file__), extension=".py")
    # Exclude files in python-dependencies
    build_files = 'python-dependencies'
    remain_files = [i for i in python_files if build_files not in i]
    cmd = f"python3 -m flake8 {' '.join(remain_files)}"
    LOGGER.debug(cmd)
    ctx.run(cmd, shell='/bin/sh')


@task
def pylint(ctx):
    """
    Check the coding style according to Flake8.
    """
    python_files = get_files(os.path.dirname(__file__), extension=".py")

    cmd = f"python3 -m pylint {' '.join(python_files)}"
    LOGGER.debug(cmd)
    ctx.run(cmd, shell='/bin/sh')


@task
def rstlint(ctx):
    """
    Check the coding style according to doc8.
    """
    python_files = get_files(os.path.dirname(__file__), extension=".rst")
    # Exclude files in python-dependencies
    build_files = 'python-dependencies'
    remain_files = [i for i in python_files if build_files not in i]
    cmd = f"python3 -m doc8 --max-line-length 120 {' '.join(remain_files)}"
    LOGGER.debug(cmd)
    ctx.run(cmd, shell='/bin/sh')


@task
def builddoc(ctx):
    """
    build html documentation.
    """

    with ctx.cd('doc'):
        cmd = 'make html'
        LOGGER.debug(cmd)
        ctx.run(cmd, shell='/bin/sh')


@task
def package(ctx):

    # Check if the package exists then we build it
    if (os.path.exists('pyindexity')):
        ctx.run("python3 setup.py sdist bdist_wheel", shell='/bin/sh')
    else:
        raise exceptions.Exit(message="package not found", code=1)


@task
def test(ctx):

    if (os.path.exists('tests')):
        ctx.run("python3 tests/test_pyindexity.py", shell='/bin/sh')
    else:
        raise exceptions.Exit(message="tests directory not found", code=1)


def delete_branch_package(ctx, api_url, project_id, token):
    """
    Delete a python package deployed for a specific branch on Gitlab
    """
    # Get the current branch name
    branch = os.environ.get('CI_COMMIT_REF_NAME')

    # Build up the request to be sent
    endpoint = os.path.join(api_url, "projects", str(project_id), "packages")

    headers = {"PRIVATE-TOKEN": token}

    # Send the get request
    req = requests.get(endpoint, headers=headers)

    if req:
        output = req.json()

        # Find if an already existing package has been uploaded
        # for the current branch and delete it if so
        filtered_branch = branch.replace("-", ".")
        for e in output:
            if e["version"].endswith(filtered_branch):
                # Get the delete link fro the package
                delete_api_path = e["_links"]["delete_api_path"]
                # Delete the package
                requests.delete(delete_api_path, headers=headers)


@task
def upload(ctx):
    """
    Runs twine to upload the module to the registry.
    """
    # if the package exists, then build it
    if os.path.exists('pyindexity'):

        api_url = os.getenv('CI_API_V4_URL',
                            default="https://git.ircad.fr/api/v4")
        project_id = os.getenv('CI_PROJECT_ID', default="8923")

        if os.environ.get('REPOSITORY_ACCESS_TOKEN'):
            delete_branch_package(ctx, api_url,
                                  project_id,
                                  os.environ['REPOSITORY_ACCESS_TOKEN'])

        url = os.path.join(api_url, "projects",
                           project_id, 'packages/pypi')
        command = 'python3 -m twine upload '
        command += '--verbose '
        command += '--repository-url ' + url + ' '
        command += 'dist/*'
        ctx.run(command, shell='/bin/sh')
