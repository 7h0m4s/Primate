#!/bin/sh

#py2applet --make-setup server.py
rm -rf build dist
rm -rf dist
python appSetup.py py2app
cp -r static/ dist/server.app/Contents/Resources/
cp -r templates/ dist/server.app/Contents/Resources/