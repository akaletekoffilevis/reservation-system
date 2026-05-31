#!/bin/bash
cd "$(dirname "$0")"
EXPO_NO_METRO_WORKSPACE_ROOT=1 exec node ./node_modules/expo/bin/cli start "$@"
