#!/bin/bash

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <clean|init|localDep|build|install|watch>"
  echo "Example: $0 clean"
  echo "Example: $0 init"
  echo "Example: $0 localDep   Use this option to update the ode-ts-client NPM dependency with a local version"
  echo "Example: $0 build"
  echo "Example: $0 install"
  echo "Example: $0 [--springboard=recette] watch"
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

if [ -e "?/.gradle" ] && [ ! -e "?/.gradle/gradle.properties" ]
then
  echo "odeUsername=$NEXUS_ODE_USERNAME" > "?/.gradle/gradle.properties"
  echo "odePassword=$NEXUS_ODE_PASSWORD" >> "?/.gradle/gradle.properties"
  echo "sonatypeUsername=$NEXUS_SONATYPE_USERNAME" >> "?/.gradle/gradle.properties"
  echo "sonatypePassword=$NEXUS_SONATYPE_PASSWORD" >> "?/.gradle/gradle.properties"
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
  rm -rf node_modules dist .gradle package.json package-lock.json deployment
}

init () {
  echo "[init] Get branch name from jenkins env..."
  BRANCH_NAME=`echo $GIT_BRANCH | sed -e "s|origin/||g"`
  if [ "$BRANCH_NAME" = "" ]; then
    echo "[init] Get branch name from git..."
    BRANCH_NAME=`git branch | sed -n -e "s/^\* \(.*\)/\1/p"`
  fi
  docker-compose run -e BRANCH_NAME=$BRANCH_NAME --rm -u "$USER_UID:$GROUP_GID" gradle sh -c "gradle generateTemplate"
  docker-compose run --rm -u "$USER_UID:$GROUP_GID" node sh -c "npm install --production=false"
}

# Install local dependencies as tarball (installing as folder creates symlinks which won't resolve in the docker container)
localDep () {
  if [ -e $PWD/../ode-ts-client ]; then
    rm -rf ode-ts-client.tar ode-ts-client.tar.gz
    mkdir ode-ts-client.tar && mkdir ode-ts-client.tar/dist \
      && cp -R $PWD/../ode-ts-client/dist $PWD/../ode-ts-client/package.json ode-ts-client.tar
    tar cfzh ode-ts-client.tar.gz ode-ts-client.tar
    docker-compose run --rm -u "$USER_UID:$GROUP_GID" node sh -c "npm install --no-save ode-ts-client.tar.gz"
    rm -rf ode-ts-client.tar ode-ts-client.tar.gz
  fi
}

build () {
  docker-compose run --rm -u "$USER_UID:$GROUP_GID" node sh -c "npm run build"
  VERSION=`grep "version="  gradle.properties| sed 's/version=//g'`
  echo "ode-ngjs-front=$VERSION `date +'%d/%m/%Y %H:%M:%S'`" >> dist/version.txt
}

watch () {
  docker-compose run --rm \
    -u "$USER_UID:$GROUP_GID" \
    -v $PWD/../$SPRINGBOARD:/home/node/springboard \
    node sh -c "npm run watch --watch_springboard=/home/node/springboard"
}

publishNPM () {
  LOCAL_BRANCH=`echo $GIT_BRANCH | sed -e "s|origin/||g"`
  docker-compose run --rm -u "$USER_UID:$GROUP_GID" node sh -c "npm publish --tag $LOCAL_BRANCH"
}

packageJar () {
  rm -rf ode-ngjs-front.tar.gz ode-ngjs-front
  mkdir ode-ngjs-front && mv dist/version.txt ode-ngjs-front && cp -R dist/bundle/* ode-ngjs-front
  cd ode-ngjs-front && tar czhf ../ode-ngjs-front.tar.gz * && cd ..
}

publishNexus () {
  VERSION=`grep "version="  gradle.properties| sed 's/version=//g'`
  case "$VERSION" in
    *SNAPSHOT) nexusRepository='snapshots' ;;
    *)         nexusRepository='releases' ;;
  esac
  if [ -e "?/.gradle" ] && [ ! -e "?/.gradle/gradle.properties" ]
  then
    echo "odeUsername=$NEXUS_ODE_USERNAME" > "?/.gradle/gradle.properties"
    echo "odePassword=$NEXUS_ODE_PASSWORD" >> "?/.gradle/gradle.properties"
    echo "sonatypeUsername=$NEXUS_SONATYPE_USERNAME" >> "?/.gradle/gradle.properties"
    echo "sonatypePassword=$NEXUS_SONATYPE_PASSWORD" >> "?/.gradle/gradle.properties"
  fi
  publishCmd "mvn deploy:deploy-file -DgroupId=com.opendigitaleducation -DartifactId=ode-ngjs-front -Dversion=$VERSION -Dpackaging=tar.gz -Dfile=ode-ngjs-front.tar.gz -Duser.home=/var/maven -DrepositoryId=wse -Durl=https://maven.opendigitaleducation.com/nexus/content/repositories/$nexusRepository/" \
    && docker-compose run --rm -u "$USER_UID:$GROUP_GID" gradle sh -c "gradle deploymentJar publish"
}

publishMavenLocal(){
  VERSION=`grep "version="  gradle.properties| sed 's/version=//g'`
  publishCmd "mvn install:install-file -DgroupId=com.opendigitaleducation -DartifactId=ode-ngjs-front -Dversion=$VERSION -Dpackaging=tar.gz -Dfile=ode-ngjs-front.tar.gz -Duser.home=/var/maven" \
    && docker-compose run --rm -u "$USER_UID:$GROUP_GID" gradle sh -c "gradle deploymentJar publishToMavenLocal"
  rm -rf ode-ngjs-front ode-ngjs-front.tar.gz build
}

publishCmd(){
  local deploymentString=$1
  echo "Publish command is: $ $deploymentString"
  docker-compose run \
    --rm \
    --no-deps \
    -u "$USER_UID:$GROUP_GID" \
    -w /usr/src \
    -e MAVEN_CONFIG=/var/maven/.m2 \
    maven sh -c "$deploymentString"
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
    localDep)
      localDep
      ;;
    build)
      build
      ;;
    install)
      build && packageJar && publishMavenLocal
      ;;
    watch)
      watch
      ;;
    publishNPM)
      publishNPM
      ;;
    publishNexus)
      packageJar && publishNexus
      ;;
    *)
      echo "Invalid argument : $param"
  esac
  if [ ! $? -eq 0 ]; then
    exit 1
  fi
done