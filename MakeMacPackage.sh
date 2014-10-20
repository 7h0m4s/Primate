#!/bin/sh

#py2applet --make-setup server.py
rm -rf build dist
rm -rf dist
python appSetup.py py2app
mv dist/server.app dist/PasswordPrimate.app
cp -r static/ dist/PasswordPrimate.app/Contents/Resources/
cp -r templates/ dist/PasswordPrimate.app/Contents/Resources/
cp MacBrowse3 dist/PasswordPrimate.app/Contents/Resources/MacBrowse3
cp MacSave dist/PasswordPrimate.app/Contents/Resources/MacSave
