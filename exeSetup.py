#This script is used to comile the python source code into a *.exe
from distutils.core import setup
import py2exe

setup(console=['server.py'])
