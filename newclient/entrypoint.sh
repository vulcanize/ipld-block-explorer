#!/bin/sh

JSON_STRING='window.configs = { \
  "VUE_APP_HTTP_LINK":"'"${VUE_APP_HTTP_LINK}"'", \
  "VUE_APP_WS_CLIENT":"'"${VUE_APP_WS_CLIENT}"'", \
  "VUE_APP_OPENSEA_API":"'"${VUE_APP_OPENSEA_API}"'", \
  "VUE_APP_IS_POA_NETWORK":'"${VUE_APP_IS_POA_NETWORK}"', \
}'

sed -i "s@// CONFIGURATIONS_PLACEHOLDER@${JSON_STRING}@" /var/www/html/index.html
exec "$@"
