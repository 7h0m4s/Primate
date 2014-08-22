from flask import Flask
from flask import request
from flask import render_template
from flask import flash
from vault import *
import os.path
import webbrowser
import logging

app = Flask(__name__)
#something happened

class SessionData:
    """A class to hold all session data in."""
    
    def __init__(self):
        self.loggedIn = False
        self.vault = None
        self.username = None
        self.password = None
        self.dbFile = None
        self.groups = []
        self.logger=None
        return
    
    def getGroups(self):
        if self.groups == []:
            for record in sessionData.vault.records:
                if str(record._get_group()) not in self.groups:
                    self.groups.append(str(record._get_group()))
                
        return self.groups

    def addGroup(self,group):
        if group not in self.groups:
                    self.groups.append(group)

        return "Group was added"
                


#Root function that is activated when a user first visits the website
@app.route("/")
def index():
    sessionData.logger.error("index")
    return render_template('index.html')



#Function that handled the logic of checking if the Login was successful or not.
#If success then redirect to dashboard.
#If fail redirect to login page with error message.
@app.route("/login", methods=['POST', 'GET'])
def login():
    sessionData.username=request.form['Username']
    sessionData.password=request.form['Password'].encode('ascii','ignore')
    sessionData.dbFile=request.form['DatabaseFile']
    if (os.path.isfile(sessionData.dbFile)==False):
        return render_template('index.html', error="Database file does not exist.")
    #global vault #A temporary mesure, will later replace with a kind of "Session Class Object" that store all session information and we can pass to all functions.
    try:
        sessionData.vault = Vault(sessionData.password,sessionData.dbFile)
    except 'BadPasswordError':
        return render_template('index.html', error="Incorrect Password.")
    except Exception,e:
        return render_template('index.html', error=str(e))

    
    return render_template('dashboard.html', sessionData=sessionData)


#Takes user to the new database page 
@app.route("/NewDatabase")
def newDatabase():
    return render_template('newDB.html')


#Function that handles the creation of a new DB file and logging the user in.
#If success then redirect to dashboard.
#If fail redirect to newDB page with error message.
@app.route("/newDB", methods=['POST', 'GET'])
def newDB():
    if (request.form['Password'].encode('ascii','ignore') != request.form['ConfirmPassword'].encode('ascii','ignore')):
        return render_template('newDB.html', error="Passwords do not match.")
    sessionData.username=request.form['Username']
    sessionData.password=request.form['Password'].encode('ascii','ignore')
    assert type(sessionData.password) != unicode
    sessionData.dbFile=request.form['DatabaseFile']
    #global vault #A temporary mesure, will later replace with a kind of "Session Class Object" that store all session information and we can pass to all functions.
    try:
        sessionData.vault = Vault(sessionData.password.encode('ascii','ignore'))
        sessionData.vault.write_to_file(sessionData.password.encode('ascii','ignore'),sessionData.dbFile)
    except 'BadPasswordError':
        return render_template('newDB.html', error="Incorrect Password.")
    #except Exception,e:
    #    return render_template('newDB.html', error="Error:"+str(e))

    return render_template('dashboard.html', sessionData=sessionData)


#Temporary proof of concept function.
#Function gets called if user clicks an account on the dashboard.
#Function returns a list of details about requested account.
@app.route("/getRecordData", methods=['POST', 'GET'])
def getRecordData():
    uuid=request.form['uuid']
    for record in sessionData.vault.records:
        if str(record._get_uuid()) == uuid:
            outString= "uuid: "+ str(record._get_uuid()) + "\n"
            outString+="title: "+ str(record._get_title()) + "\n"
            outString+="user: "+ str(record._get_user()) + "\n"
            outString+="password :"+ str(record._get_passwd()) + "\n"
            outString+="url: "+ str(record._get_url()) + "\n"
            return outString
        
    return "No Record Found"

#Returns data to populate the Group-Edit menu on the dashboard
@app.route("/getGroup", methods=['POST', 'GET'])
def getGroup():
    group=request.form['group']
    for record in sessionData.vault.records:
        outString= "uuid: "+ str(record._get_uuid()) + "\n"
        
    return "No Record Found"

@app.route("/refresh")
def refresh():

    return render_template('passwordGrid.html', sessionData=sessionData)



@app.route("/create-group", methods=['POST', 'GET'])
def createGroup():
    groupParent=request.form['groupParent']
    groupName=request.form['groupName']
    sessionData.logger.error("groupParent:"+groupParent)
    sessionData.logger.error("LENgroupParent:"+str(len(groupParent)))
    sessionData.logger.error("groupName:"+groupName)
    if len(groupParent) == 0:
        sessionData.addGroup(groupName)
    else:
        if groupParent not in sessionData.getGroups():
            return "Group Parent Not Found"
        sessionData.addGroup(groupParent +"."+ groupName)

    return "Group Added Successfully"

@app.route("/create-user", methods=['POST', 'GET'])
def createUser():
    usr=request.form['usr']
    pwd=request.form['pwd']
    userTitle=request.form['userTitle']
    userUrl=request.form['userUrl']
    notes=request.form['notes']

    return "Group Added Successfully"

#Returns data to populate the Group-Edit menu on the dashboard
@app.route("/save", methods=['POST', 'GET'])
def saveDB():
    sessionData.vault.write_to_file(sessionData.dbFile, sessionData.password)
    
    return "Database was saved to "+sessionData.dbFile

#Returns a list of all Titles in the database.
def getAllTitles():
    titleList=[]
    for rec in sessionData.vault.records:
        if rec._get_title() not in titleList:
            titleList.append(rec._get_title())
    return titleList

#Returns a list of all Groups in the database
def getAllGroups():
    groupList=[]
    for rec in sessionData.vault.records:
        if rec._get_group() not in groupList:
            groupList.append(rec._get_group())
    return groupList


#Code below is equivilent to a "Main" function in Java or C
if __name__ == "__main__":
    global sessionData
    sessionData = SessionData()
    webbrowser.open_new_tab('http://localhost:5000')

    sessionData.logger = logging.getLogger('werkzeug')
    handler = logging.FileHandler('access.log')
    handler2 = logging.StreamHandler()
    sessionData.logger.addHandler(handler)
    sessionData.logger.addHandler(handler2)
    #sessionData.logger.error("herror")
    #app.logger.addHandler(handler)
    
    app.debug = True
    app.run()
