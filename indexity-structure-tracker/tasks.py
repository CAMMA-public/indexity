""" Invoke Tasks """

import os
from invoke import task # pylint: disable=import-error

PYTHON_DIR = f"{os.path.dirname(__file__)}/python"
PYTHON_FILES = f"{PYTHON_DIR}/*.py"
PYTHON_DEPENDENCIES_DIR = "python-dependencies"

@task
def patch_pythonpath(ctx):  # pylint: disable=unused-argument
    """
    Patches PYTHONPATH.
    Adds the application location to the path.
    """

    if os.environ.get("PYTHONPATH") is None:
        os.environ["PYTHONPATH"] = PYTHON_DIR
    else:
        os.environ["PYTHONPATH"] += os.pathsep + os.path.join(PYTHON_DEPENDENCIES_DIR)


@task(patch_pythonpath)
def flake8(ctx):
    """
    Check the coding style according to Flake8.
    """
    cmd = f"python3 -m flake8 --max-line-length 120 --ignore E402 {PYTHON_DIR}"
    ctx.run(cmd, shell='/bin/sh')

@task(patch_pythonpath)
def pylint(ctx):
    """
    Check the coding style according to Flake8.
    """
    cmd = f"python3 -m pylint {PYTHON_FILES}"
    ctx.run(cmd, shell='/bin/sh')

@task(patch_pythonpath)
def pytest(ctx):
    """
    Runs the code tests.
    """
    cmd = f"python3 -m pytest --cov=python --cov-config=.coveragerc {PYTHON_DIR}"
    ctx.run(cmd, shell='/bin/sh')
