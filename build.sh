#!/bin/bash

if [ "$#" -gt 2 ]; then
  echo "Usage: $0 <clean|init|build|watch|publish>"
  echo "Example: $0 clean"
  echo "Example: $0 init"
  echo "Example: $0 build"
  echo "Example: $0 [--springboard=recette] watch"
  echo "Example: $0 publish"
  exit 1
fi

if [ ! -e node_modules ]
then
  mkdir node_modules
fi

if [ -z ${USER_UID:+x} ]
then
  export USER_UID=1000
  export GROUP_GID=1000
fi

# options
SPRINGBOARD="recette"
for i in "$@"
do
case $i in
    -s=*|--springboard=*)
    SPRINGBOARD="${i#*=}"
    shift
    ;;
    *)
    ;;
esac
done

clean () {
  rm -rf node_modules dist
}

init () {
  docker-compose run --rm -u "$USER_UID:$GROUP_GID" node sh -c "npm install --production=false"
}

build () {
  docker-compose run --rm -u "$USER_UID:$GROUP_GID" node sh -c "npm run build"
}

watch () {
  docker-compose run \
    --rm \
    -u "$USER_UID:$GROUP_GID" \
    -v $PWD/../$SPRINGBOARD:/home/node/springboard \
    node sh -c "npm run watch --springboard=/home/node/springboard/assets"
}

publish () {
  LOCAL_BRANCH=`echo $GIT_BRANCH | sed -e "s|origin/||g"`
#  docker-compose run --rm -u "$USER_UID:$GROUP_GID" node sh -c "npm pack --dry-run"
  docker-compose run --rm -u "$USER_UID:$GROUP_GID" node sh -c "npm publish --tag $LOCAL_BRANCH"
}

for param in "$@"
do
  case $param in
    clean)
      clean
      ;;
    init)
      init
      ;;
    build)
      build
      ;;
    watch)
      watch
      ;;
    publish)
      publish
      ;;
    *)
      echo "Invalid argument : $action"
  esac
  if [ ! $? -eq 0 ]; then
    exit 1
  fi
done