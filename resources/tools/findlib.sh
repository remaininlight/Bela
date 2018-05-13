#!/bin/bash

#say you have a line like this in one of your project files:
#include <libraryname/header.h>
#then this should be able to identify if that depends on a library that is installed
#TODO: how do you warn the user if they (may?) need to install a library?

LIBRARIES_FOLDER=libraries
which gsed &>/dev/null && SED=gsed || SED=sed

HEADERS=`grep -R "#[ \t]*include.*<.*>" $PROJECT_FOLDER | $SED "s/.*<\(.*\)>/\1/" | $SED "s|/\+|/|g"`
LIBRARIES=
echo HEADERS: $HEADERS
for H in $HEADERS; do
	echo HEADER: $H
	echo "Checking if $H is in a library"
	MATCH=`find $LIBRARIES_FOLDER -path $LIBRARIES_FOLDER/$H`
	[ -z "$MATCH" ] ||\
	{
		LIBRARY=`echo $H | cut -d / -f 1`
		echo found library containing $H: $LIBRARY
		LIBRARIES="$LIBRARIES $LIBRARY"
	} || echo "$H does not belong to a library"
done
# $LIBRARIES may now contain duplicates. Let's remove them:
LIBRARIES=`echo $LIBRARIES | $SED "s/ \+/\n/g" | sort -u`
echo LIBS: $LIBRARIES

