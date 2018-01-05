#!/bin/bash

echo-green () {
    echo -e "\033[1;32m$1\033[0m"
}
echo-cyan () {
    echo -e "\033[1;36m$1\033[0m"
}

download () {
    URL=$1
    FILENAME=$(basename $URL)
    cd $DOWNLOAD_DIR
    if [ -e $FILENAME ]; then
        echo-cyan "Already downloaded $URL"
    else
        echo-cyan "Downloading $URL"
        wget $URL
    fi
}

if [ -z "$JAVA_HOME" ]; then
    echo "JAVA_HOME not set, using Linux default"
    echo "If this does not work, please set JAVA_HOME manually"
    # Thanks: https://stackoverflow.com/questions/1117398/java-home-directory-in-linux#20653441
    export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which javac))))
fi

ORIGINAL_DIR=$(pwd)
DOWNLOAD_DIR="$(pwd)/dependencies/downloads"
BUILD_DIR="$(pwd)/dependencies/builds"
mkdir -p $DOWNLOAD_DIR
mkdir -p $BUILD_DIR

echo-cyan "Installing Apache Ant 1.10.1"
download http://www-eu.apache.org/dist/ant/source/apache-ant-1.10.1-src.tar.gz
if [ ! -d "$BUILD_DIR/apache-ant-1.10.1" ]; then
    tar -xzvf $DOWNLOAD_DIR/apache-ant-1.10.1-src.tar.gz -C $BUILD_DIR
    cd $BUILD_DIR/apache-ant-1.10.1
    ./build.sh -Ddist.dir=build dist
fi
cd $BUILD_DIR/apache-ant-1.10.1
export PATH=$(pwd)/build/bin:$PATH
echo-green "Apache Ant 1.10.1 installed at $(which ant)"

echo-cyan "Installing Apache Tomcat 9.0.2"
download http://www.namesdir.com/mirrors/apache/tomcat/tomcat-9/v9.0.2/bin/apache-tomcat-9.0.2.tar.gz
if [ ! -d "$BUILD_DIR/apache-tomcat-9.0.2" ]; then
    tar -xzvf $DOWNLOAD_DIR/apache-tomcat-9.0.2.tar.gz -C $BUILD_DIR
    cd $BUILD_DIR/apache-tomcat-9.0.2
fi
export CATALINA_HOME=$BUILD_DIR/apache-tomcat-9.0.2
echo-green "Apache Tomcat 9.0.2 installed in $CATALINA_HOME"

echo-cyan "Installing Gradle 4.4.1"
download https://services.gradle.org/distributions/gradle-4.4.1-all.zip
if [ ! -d "$BUILD_DIR/gradle-4.4.1" ]; then
    unzip $DOWNLOAD_DIR/gradle-4.4.1-all.zip -d $BUILD_DIR
    cd $BUILD_DIR/gradle-4.4.1
fi
export PATH=$BUILD_DIR/gradle-4.4.1/bin:$PATH
echo-green "Gradle 4.4.1 installed in $(which gradle)"

cd $ORIGINAL_DIR
