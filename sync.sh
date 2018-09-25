#!/bin/bash

if [ $# = 0 ]
then
    echo "Required argument: target directory"
elif [ $# != 1 ]
then
    echo "Usage: $0 <target directory>"
elif [ -d "$1" ]
then
    rsync --exclude "$(basename "$(readlink -f "$0")")" \
          --exclude README.md                           \
          --exclude .git                                \
          --recursive --delete --checksum               \
          --verbose                                     \
          "$(dirname "$0")"                             \
          "$1/"
fi
