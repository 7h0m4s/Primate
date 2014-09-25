#This script is used to comile the python source code into a *.exe
from distutils.core import setup
import py2app

##setup(console=['server.py'],
##      options = {'global': {'verbose': '0'},
##                   'py2app': {'compressed': True,
##                              'optimize': 2,
##                              'excludes': 'perfmon IPython EasyDialogs hotshot adodbapi'
##                                          'pyreadline wx nose genshi test pygtk'.split(),
##                              
##                              'packages': ['email',
##                                           'werkzeug','Tkinter','jinja2','pyperclip'
##                                             ],
##                                  }})


setup(
    app=['server.py'],
    options=dict(py2app=dict(includes=['views'],packages=['email','werkzeug','pyperclip','jinja2'],argv_emulation=True))
)
#'jinja2', 'jinja2.ext','flask','email','werkzeug','Tkinter','pyperclip'
