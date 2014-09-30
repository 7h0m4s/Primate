#This script is used to comile the python source code into a *.exe
from distutils.core import setup
import py2exe

setup(console=['server.py'],
      options = {'global': {'verbose': '0'},
                   'py2exe': {'compressed': True,
                              'optimize': 2,
                              'excludes': 'perfmon IPython EasyDialogs hotshot adodbapi'
                                          'pyreadline wx nose genshi test pygtk'.split(),
                              'dll_excludes': 'OCI.dll w9xpopen.exe gdiplus.dll'.split(),
                              'packages': ['email',
                                           'werkzeug','Tkinter','jinja2','pyperclip'
                                             ],
                                  }})
