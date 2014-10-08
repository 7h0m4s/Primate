from tornado.wsgi import WSGIContainer
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
from primateClasses import *
from server import app
from server import initConfig
import webbrowser
import os
from datetime import timedelta




if __name__ == "__main__":

    #initiate server config
    initConfig()
    
    #initiate object that will store the databases.
    global sessionVault
    sessionVault = SessionVault()

    #Open users browser to allow access to the frontend.
    webbrowser.open_new_tab('http://localhost:5000')


    #This key is used to encrypt the session cookies for security.
    app.secret_key = os.urandom(24)

    #This is how long the session will remain active untill it times-out. 
    app.permanent_session_lifetime = timedelta(seconds=600)
    
    app.config['UPLOAD_FOLDER'] = 'uploads' # Placeholder for where files should be stored if files are uploaded via HTML form.
    app.debug = True #Disable this for demonstrations to prevent the double loading problem.
    #app.threaded = True #Change if the server handles multiple requests at once.
    #app.run()

    http_server = HTTPServer(WSGIContainer(app))
    http_server.listen(5000, address='127.0.0.1')
    IOLoop.instance().start()
