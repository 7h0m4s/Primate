#!/bin/sh

py2applet --make-setup server.py
rm -rf build dist
python setup.py py2app