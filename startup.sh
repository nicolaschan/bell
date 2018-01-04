#!/bin/bash

# Environment variables
if [ -z "$CATALINA_HOME" ]; then
    read -p "Set $CATALINA_HOME (directory of tomcat installation): " TEMP_CATA_HOME
    export CATALINA_HOME=$TEMP_CATA_HOME
fi
echo "CATALINA_HOME is set to $CATALINA_HOME"

if [ -z "$JAVA_HOME" ]; then
    read -p "Please set $JAVA_HOME (directory of JDK8): " TEMP_JAVA_HOME
    export JAVA_HOME=$TEMP_JAVA_HOME 
fi
echo "JAVA_HOME is set to $JAVA_HOME"

# Check dependencies
check_dep() {
    echo -e "\033[2;35mChecking command: $1\033[0m"
    if [ ! -x "$(command -v $1)" ]; then
        echo -e "\033[1;31mRequired command \033[1;31m\"$1\"\033[1;31m not found. Please install.\033[0m"
        exit 1
    fi
}

check_dep ant
check_dep gradle
check_dep webpack
check_dep npm
check_dep wget

check_sql_driver() {
    echo -e "\033[1;31mChecking SQL driver for $1\033[0m"
    if [ $(grep -i $1) != 0 ]; then
        echo -e "\033[0;31m$1 driver not found."
        echo -e "Attempting download."
        if [ $1 == "postgres" ]; then
            wget https://jdbc.postgresql.org/download/postgresql-42.1.4.jar P $CATALINA_HOME/lib/
            echo "\033[1;91mMake sure a postgres database is configured.\033[0m"
            echo "\033[1;31mSee https://www.codementor.io/devops/tutorial/getting-started-postgresql-server-mac-osx for help\033[0m"
        elif [  $1 == "sqlite" ]; then
            wget https://bitbucket.org/xerial/sqlite-jdbc/downloads/sqlite-jdbc-3.21.0.jar -P $CATALINA_HOME/lib/
        fi
    else
        echo -e "\033[0;32mFound $1, be warned that it may not be updated\033[0m"
    fi
}

check_sql_driver postgres
check_sql_driver sqlite

echo_cyan() {
    echo -e "\033[1;31m$1\033[0m"
}

echo_cyan "Building client scripts..."
npm run build || exit 1
cd "server"
echo_cyan "Building server stuff..."
ant dist || exit 1
echo_cyan "Attempting to start server..."
$CATALINA_HOME/bin/catalina.sh run || exit 1 # runs in current window; use start for daemon
echo -e "\033[1;32mSuccess! \033[2;32m(Hopefully. If something went wrong, contact the maintaners of this repo.)\033[0m"

# https://stackoverflow.com/questions/18415578/how-to-change-tomcat-port-number
echo "To change port number, please edit the connect port field in $CATALINA_HOME/conf/server.xml"
