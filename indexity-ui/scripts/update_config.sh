#!/usr/bin/env bash

# This script uses environment variables to update config.json file
#    "apiConfig": {
#      "baseUrl": "http://localhost:8082"
#    }
# will be updated with the value of APICONFIG_BASEURL
# It requires jq (https://stedolan.github.io/jq/) to be installed

set -euo pipefail

if (( $# != 1 )); then
  echo "USAGE: bash <config_file_path>"
  exit
fi

CONFIG_PATH=${1}
TMP_PATH="/tmp/$(basename ${CONFIG_PATH})"

if [[ -r ${CONFIG_PATH} && -w ${CONFIG_PATH} ]]; then
  echo "Producing interpolated configuration from ${CONFIG_PATH}"
  cat ${CONFIG_PATH} | jq '
    . as $input
    | reduce paths(scalars) as $path (
        {};
        setpath(
          $path;
          env[$path | join("_") | ascii_upcase] // ($input | getpath($path))
        )
      )
  ' > ${TMP_PATH}
  mv ${TMP_PATH} ${CONFIG_PATH}
  echo "Overwrote original configuration"
else
  echo "Configuration file not found at ${CONFIG_PATH}"
fi

rm -f ${TMP_PATH}
