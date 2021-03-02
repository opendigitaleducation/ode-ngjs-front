#!/bin/bash

if [ "$#" -gt 1 ]; then
  echo "Usage: $0 <clean|init|build|publish>"
  echo "Example: $0 clean"
  echo "Example: $0 init"
  echo "Example: $0 build"
  echo "Example: $0 publish"
  exit 1
fi

action=$1

if [ ! -e node_modules ]
then
  mkdir node_modules
fi

if [ -z ${USER_UID:+x} ]
then
  export USER_UID=1000
  export GROUP_GID=1000
fi

clean () {
  rm -rf node_modules dist
}

init () {
  docker-compose run --rm -u "$USER_UID:$GROUP_GID" node sh -c "npm install --production=false"
}

build () {
  docker-compose run --rm -u "$USER_UID:$GROUP_GID" node sh -c "npm run test"
}

publish () {
  LOCAL_BRANCH=`echo $GIT_BRANCH | sed -e "s|origin/||g"`
#  docker-compose run --rm -u "$USER_UID:$GROUP_GID" node sh -c "npm pack --dry-run"
  docker-compose run --rm -u "$USER_UID:$GROUP_GID" node sh -c "npm publish --tag $LOCAL_BRANCH"
}

case $action in
  clean)
    clean
    ;;
  init)
    init
    ;;
  build)
    build
    ;;
  publish)
    publish
    ;;
  *)
    echo "Invalid argument : $action"
esac
