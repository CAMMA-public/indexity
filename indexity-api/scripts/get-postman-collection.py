import json
import os
import subprocess
import uuid

import requests
from nested_lookup import nested_update, nested_alter, nested_delete, nested_lookup

# This script:
# - download Swagger API file
# - convert Swagger file to Postman collection
# - patch Postman file to clean collection and use Postman environment

# Usage:
# It is recommended to use conda (https://www.anaconda.com/products/individual) and install a virtual env,
# then, run the following commands:
#
# conda create -n get-postman-collection python=3.8
# conda activate get-postman-collection
# pip install requests nested_lookup
# python get-postman-collection.py

BASE_URL = os.getenv('SWAGGER_BASE_URL', 'http://localhost:8082')


def download_swagger_file(swagger_file):
    swagger_api_result = requests.get(f'{BASE_URL}/api-json', )
    swagger_api_result.raise_for_status()
    swagger_api_json = swagger_api_result.json()

    with open(swagger_file, 'w') as outfile:
        json.dump(swagger_api_json, outfile, indent=4)


# callback used to clean json elements that are too big (>500 characters)
def json_callback(data):
    return data if (len(data) <= 500) else ""


# replaces all randomly generated item ID by ID generated from a hash of the item
def fix_postman_id(postman_json):
    # -1 find item IDs
    replace_map = {}
    items = nested_lookup('item', postman_json)
    for item in items:
        for elt in item:
            old_id = elt['id']
            clean_elt = nested_delete(elt, 'id')
            # make a UUID using a SHA-1 hash
            new_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, json.dumps(clean_elt)))
            replace_map[old_id] = new_id

    # -2 find info IDs
    infos = nested_lookup('info', postman_json)
    for elt in infos:
        old_postman_id = elt['_postman_id']
        clean_elt = nested_delete(elt, '_postman_id')
        # make a UUID using a SHA-1 hash
        new_postman_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, json.dumps(clean_elt)))
        replace_map[old_postman_id] = new_postman_id

    # -3 replace all IDs found
    clean_postman_str = json.dumps(postman_json, indent=4)
    for key, value in replace_map.items():
        clean_postman_str = clean_postman_str.replace(key, value)

    return clean_postman_str


def patch_postman_collection(postman_file):
    postman_json = {}
    with open(postman_file, 'r') as data_file:
        postman_json = json.load(data_file)

    # remove response tag
    clean_response_postman_json = nested_update(postman_json, key='response', value='')

    # remove too big 'raw' tag:
    # some structures have circular dependencies,
    # so the swagger->postman conversion script
    # when trying to display the structure
    # will generate a huge block of code
    postman_json = nested_alter(clean_response_postman_json, 'raw', json_callback)

    # replaces all randomly generated item ID
    clean_postman_str = fix_postman_id(postman_json)

    # update token and url with env var
    clean_postman_str = clean_postman_str.replace("<Bearer Token>", "{{admin-token}}")
    clean_postman_str = clean_postman_str.replace("{{baseUrl}}", "{{api-host}}")

    with open(postman_file, 'w') as data_file:
        data_file.write(clean_postman_str)


def convert_swagger_to_postman(swagger_file, postman_file):
    subprocess.run(["npm", "install", "-g", "openapi-to-postmanv2"])
    subprocess.run(["openapi2postmanv2", "-s", swagger_file, "-o", postman_file, "-p"])


if __name__ == '__main__':
    current_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.abspath(os.path.join(current_dir, os.pardir))
    postman_dir = os.path.join(root_dir, 'postman')
    swagger_file = os.path.join(postman_dir, 'swagger-api.json')
    postman_file = os.path.join(postman_dir, 'indexity-api.postman_collection.json')

    print("-- Download Swagger file --")
    download_swagger_file(swagger_file)
    print("-- Convert Swagger file to Postman collection --")
    convert_swagger_to_postman(swagger_file, postman_file)
    print("-- Delete Swagger file --")
    os.remove(swagger_file)
    print("-- Patch Postman collection --")
    patch_postman_collection(postman_file)
    print("-- That's all folks --")
