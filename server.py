"""
Password Primate Python Backend.
The Primate Python backend ensures all backend features are fully functional.
Copyright (c) 2014, Asterix Solutions
"""
from flask import Flask
from flask import request
from flask import session
from flask import redirect
from flask import url_for
from flask import render_template
from flask import flash
from flask import make_response
from werkzeug import secure_filename
from vault import *
from datetime import timedelta
import os
import os.path
import webbrowser
import logging
import json
import csv
import StringIO
import cStringIO
import Tkinter
import tkFileDialog
import pyperclip
import time
from ConfigParser import SafeConfigParser
import appdirs
import subprocess
from tendo import singleton
import threading
import urllib2
import sys

#Configuration to handle HTML file uploads if implemented later.
UPLOAD_FOLDER = 'uploads/'
ALLOWED_EXTENSIONS = set(['csv'])

app = Flask(__name__)

global appName
global appAuthor
appName = "PasswordPrimate"
appAuthor = "AsterixSolutions"

global loginFunction
global dashboardFunction
global newdbFunction
loginFunction = 'index'
dashboardFunction = 'dashboard'
newdbFunction = 'newDatabase'

global confParser
global confPath
confParser = SafeConfigParser()
confPath = str(os.path.join(appdirs.user_data_dir(appName, appAuthor),"config.ini"))

global shutdown_delay
shutdown_delay = 5 #seconds

global server_port_number
server_port_number = "5000"

"""
Class holds session values that are not compatiable with the Flask session variable.
Data being stored includes:
-The encrypted password database for the user. Known as a Vault.
"""
class SessionVault:
    
    
    def __init__(self):
        self.vaults = {}
        return

    def addVault(self,vault):
        if session['id'] in self.vaults:#TODO check if vault is already loaded
            raise KeyError
        self.vaults[session['id']] = vault
        return

    def getVault(self):
        return self.vaults.get(session['id'])

    def getRecords(self):
        return self.vaults.get(session['id']).records

    def removeVault(self):
        del self.vaults[session['id']]
        
        return

"""
Function return the home page which acts as the login page.
Checks that sesion variables are initiated.
If logged it it will redirect to dashboard.
"""
@app.route("/")
def index():
    # For the timeout/session lifetime config to work we need
    # to make the sessions permanent.  It's false by default
    # +INFO: http://flask.pocoo.org/docs/api/#flask.session.permanent
    session.permanent = True

    #Test if session is initiated.
    try:
        session['groups'] == []
    except KeyError:
        session['groups'] = []

    #Test if the session is logged in.
    try:
        if session['loggedIn'] == True:
            return redirect(url_for(dashboardFunction))
        
    except KeyError:
        #Key error assumes false
        return app.send_static_file('index.html')
    #if session is not logged in \/
    return app.send_static_file('index.html')


"""
Function returns the main dashboard.
If user is not logged in they will be redirected to index().
"""
@app.route("/dashboard")
def dashboard():

    #Test if the session is NOT logged in.
    try:
        if session['loggedIn'] == False:
            return redirect(url_for(loginFunction))
        
    except KeyError:
        #Key error assumes false
        return redirect(url_for(loginFunction))
    
    #If session IS logged in \/
    getGroups() #important, it populates the group list
    return app.send_static_file('main.html')



"""
Function returns if user is logged in yet or not.
Returns True if logged in.
"""
def isLoggedIn():
#Test if the session is logged in.
    try:
        if session['loggedIn'] == True:
            return True
        
    except KeyError:
        #Key error assumes false
        return False
    #If session is not logged in \/
    return False
    

"""
Function handles login proccess.
If success then redirect to dashboard.
If fail redirect to login page with error message.
"""
@app.route("/login", methods=['POST', 'GET'])
def login():
    if isLoggedIn():#Redirects if already logged in
        return "",304
    try:
        session['id'] = uuid.uuid4()
        session['username'] = "sponge bob square pants"
        session['password'] = request.values['Password'].encode('ascii','ignore')
        session['dbFile'] = request.values['DatabaseFile']
        if (os.path.isfile(session['dbFile']) == False):
            return "Incorrect Database File",200
        
        try:
            sessionVault.addVault(Vault(session['password'],session['dbFile']))
        except 'BadPasswordError':
            return "Incorrect Password",200
        except Exception,e:
            return str(e),200

        session['loggedIn'] = True
        getGroups() #Important, it populates the group list
        return "",304
    except Exception,e:
        return str(e),500

"""
Function redirects user to the New Database template page.
"""
@app.route("/NewDatabase")
def newDatabase():
    if isLoggedIn():#redirects if already logged in
        return redirect(url_for(dashboardFunction))
    return app.send_static_file('new-database.html')

"""
Function that handles the creation of a new DB file and logging the user in.
If success then redirect to dashboard.
If fail redirect to newDB page with error message.
"""
@app.route("/newDB", methods=['POST', 'GET'])
def newDB():
    if isLoggedIn():#Redirects if already logged in
        return "",304
    try:
        if (request.form['Password'].encode('ascii','ignore') != request.form['ConfirmPassword'].encode('ascii','ignore')):
            return redirect(url_for(newdbFunction))
        session['id'] = uuid.uuid4()
        session['password'] = request.form['Password'].encode('ascii','ignore')
        assert type(session['password']) != unicode
        session['dbFile'] = request.form['DatabaseFile']
        try:
            open(session['dbFile'], 'w').close()
            os.unlink(session['dbFile'])
        except (OSError,IOError):
            return "Database filename is invalid",200
            
        try:
            sessionVault.addVault(Vault(session['password'].encode('ascii','ignore')))
            sessionVault.getVault().write_to_file(session['password'].encode('ascii','ignore'),session['dbFile'])
        except 'BadPasswordError':
            return redirect(url_for(newdbFunction))

        session['loggedIn'] = True
        getGroups() #Important, it populates the group list
        saveDB()
        return "",304
    except Exception,e:
        return str(e),500

"""
Function closes the user session and logs them out
"""
@app.route("/logout")
def logoff():
    try:
        if isLoggedIn():#redirects if already logged in
            sessionVault.removeVault()
            session.clear()
            return redirect(url_for(loginFunction))
        return redirect(url_for(loginFunction))
    except Exception,e:
            return str(e),500


"""
Function returns a JSON of details about requested login account.
Form Parameter: -String uuid
"""
@app.route("/get-user", methods=['POST'])
def getUser():
    try:
        uuid = request.form['uuid']
        for record in sessionVault.getRecords():
            if str(record._get_uuid()) == uuid:
                data = {}
                data["uuid"] = str(record._get_uuid())
                data['groupParent']= str(record._get_group())
                data["user"] = str(record._get_user())
                data["passwd"] = str(record._get_passwd())
                data["title"] = str(record._get_title())
                data["url"] = str(record._get_url())
                data["notes"] = str(record._get_notes())
                data["last_mod"] = str(time.strftime("%H:%M %d-%m-%Y", time.localtime(record._get_last_mod())))
                return json.dumps(data)
            
        return "No Account Record Found", 500
    except Exception,e:
        return str(e),500

"""
Returns data to populate the Group-Edit menu on the dashboard
Form Parameter: -String group
"""
@app.route("/getGroup", methods=['POST'])
def getGroup():
    group = request.form['group']
    for record in sessionVault.getVault().records:
        outString = "uuid: " + str(record._get_uuid()) + "\n"
        
    return "No Group Record Found"

"""
Function returns the dashboard page
"""
@app.route("/refresh")
def refresh():

    return redirect(url_for(dashboardFunction))


"""
Function creates group.
Form Parameters:    String groupParent
                    String groupName
NOTE: The created group does not save to the database
unless there is a user under that group.
"""
@app.route("/create-group", methods=['POST', 'GET'])
def createGroup():
    try:
        groupParent = request.form['groupParent']
        groupName = request.form['groupName']
        if len(groupParent) == 0:
            addGroup(groupName)
        else:
            if groupParent not in getGroups():
                return "Group Parent Not Found", 500
            if (groupParent + "." + groupName)in getGroups():
                return "Group already exists", 500
            session['groups'].append(groupParent + "." + groupName)#

        return "Group Added Successfully", 304
    except Exception,e:
        return str(e),500


"""
Function edits existing group's name and all users under it.
Form Parameters:    String groupParent
                    String groupName
                    String group
TODO: Make it update users recursively to subgroups
"""
@app.route("/edit-group", methods=['POST'])
def editGroup():
    try:
        #sessionData.logger.error("stuff")
        group = request.form['group']
        groupParent = request.form['groupParent']
        groupName = request.form['groupName']
        outstring = []
        if len(groupParent) > 0:
            groupName = groupParent + "." + groupName
        
        #update group list
        
            
        for name in session['groups']:
            if name.startswith(group):
                session['groups'].remove(name)
                session['groups'].append(name.replace(group, groupName,1))
                

            
        #update related records
        for record in sessionVault.getVault().records:
            if record._get_group().startswith(group):
                record._set_group(record._get_group().replace(group, groupName,1))

        saveDB()
        return "Group edited Successfully", 304
    except Exception,e:
        return str(e),500


"""
Function deletes existing group name and all users under it.
Form Parameters:    String groupParent
                    String groupName
                    String group
                    
TODO: Make it delete users recursively to subgroups
"""
@app.route("/delete-group", methods=['POST'])
def deleteGroup():
    try:
        group = request.form['group']

        #delete from group list
        for name in session['groups']:
            if name.startswith(group):
                session['groups'].remove(name)
            
        #delete related records
        for record in sessionVault.getVault().records:
            if record._get_group().startswith(group):
                sessionVault.getVault().records.remove(record)

        saveDB()
        return "Group deleted Successfully", 304
    except Exception,e:
        return str(e),500


"""
Function creates account entry into database. Then saves database.
Form Parameters:    String group
                    String usr
                    String pwd
                    String userTitle
                    String userUrl
                    String notes
"""
@app.route("/create-user", methods=['POST'])
def createUser():
    try:
        #group = request.form['group']
        #usr = request.form['usr']
        #pwd = request.form['pwd']
        #userTitle = request.form['userTitle']
        #userUrl = request.form['userUrl']
        #notes = request.form['notes']

        uuid = request.form['uuid']
        group = request.form['groupParent']
        usr = request.form['user']
        pwd = request.form['passwd']
        userTitle = request.form['title']
        userUrl = request.form['url']
        notes = request.form['notes']
        if len(group) <= 0:
            return "Cannot Create User. No Group Name Given.", 200
        entry = Vault.Record.create()
        entry._set_group(group)
        entry._set_user(usr)
        entry._set_passwd(pwd)
        entry._set_title(userTitle)
        entry._set_url(userUrl)
        entry._set_notes(notes)
        sessionVault.getVault().records.append(entry)

        saveDB()
        data = {}
        data["uuid"] = str(entry._get_uuid())
        data['groupParent']= str(entry._get_group())
        data["user"] = str(entry._get_user())
        data["passwd"] = str(entry._get_passwd())
        data["title"] = str(entry._get_title())
        data["url"] = str(entry._get_url())
        data["notes"] = str(entry._get_notes())
        data["last_mod"] = str(time.strftime("%H:%M %d-%m-%Y", time.localtime(entry._get_last_mod())))
        return json.dumps(data), 200
    except Exception,e:
        return str(e),500


"""
Function edits account entry in database. Then saves database.
Form Parameters:    String uuid
                    String usr
                    String pwd
                    String userTitle
                    String userUrl
                    String notes
"""
@app.route("/edit-user", methods=['POST', 'GET'])
def editUser():
    try:
        uuid = request.form['uuid']
        group = request.form['groupParent']
        usr = request.form['user']
        pwd = request.form['passwd']
        userTitle = request.form['title']
        userUrl = request.form['url']
        notes = request.form['notes']


        for record in sessionVault.getVault().records:
            if str(record._get_uuid()) == uuid:
                record._set_group(group)
                record._set_user(usr)
                record._set_passwd(pwd)
                record._set_title(userTitle)
                record._set_url(userUrl)
                record._set_notes(notes)
                saveDB()
                return str(record._get_uuid()), 200
            
        return "Account was not found.", 500
    except Exception,e:
        return str(e),500


"""
Function deletes account entry from database. Then saves database.
Form Parameters:    String uuid
"""
@app.route("/delete-user", methods=['POST', 'GET'])
def deleteUser():
    try:
        uuid = request.form['uuid']
        for record in sessionVault.getVault().records:
            if str(record._get_uuid()) == uuid:
                sessionVault.getVault().records.remove(record)
                saveDB()
                return "Account Deleted Successfully", 304
        return "Cannot Find Account To Be Deleted.", 200
    except Exception,e:
        return str(e),500
    return

"""
Function returns list of all groups.
Also populates the session['groups'] if not already populated.
NOTE: this inclues groups that are created but have no accounts in them so are not yet saved to the database.

"""
def getGroups():
    try:
        if session['groups'] == []:
            getGroupsHelper()
    except KeyError:#yes I know this is repeated code.  I was lazy tonight :P
            session['groups'] = []
            getGroupsHelper()
                    
    return session['groups']

"""
Function is a helper for get groups.
Made to reduce repeditive code.
Yes im sorry, the name is terrible.
"""
def getGroupsHelper():
    for record in sessionVault.getVault().records:
##                if str(record._get_group()) not in session['groups']:
##                    session['groups'].append(str(record._get_group()))
        for name in groupNameSplitter(str(record._get_group())):
            if name not in session['groups']:
                session['groups'].append(name)
    return


"""
Function gets a string of a group name and returns a list of the group and all its parents names as a list of strings.
"""
def groupNameSplitter(groupName):
    outList = []
    groupNameSplit = csv.reader(cStringIO.StringIO(groupName), delimiter='.', escapechar='\\').next()
    count = 1
    while count <= len(groupNameSplit):
        outList.append(".".join(groupNameSplit[:count]))
        count += 1
    return outList

def addGroup(group):
    if group not in session['groups']:
                session['groups'].append(group)

    return


"""
Function saves changes to the database to the database file.
"""
@app.route("/save", methods=['POST'])
def saveDB():
    try:
        if isLoggedIn() == False:
            return "User Not Logged In.",200
        sessionVault.getVault().write_to_file(session['dbFile'], session['password'])
        
        return "Database was saved to " + session['dbFile']
    except Exception,e:
        return str(e),500


"""
Function saves database under a new master password
Parameter: newPassword= string of new password
            oldPassword= string of old password for validation
"""
@app.route("/new-master-password", methods=['POST'])
def newMasterPasword():
    try:
        if isLoggedIn() == False:
            return "User not logged in.",200
        newPass = request.values.get('newPassword', default="")
        oldPass = request.values.get('oldPassword', default="")
        if newPass == "":
            return "No New Password Recived",200
        if oldPass != session['password']:
            return "Your current password is incorrect.",200
        if oldPass == newPass:
            return "New password cannot match old password.",200
        session['password'] = newPass
        saveDB()
        return "Master Password changed.",304
    except Exception,e:
        return str(e),500



"""
Function is used in the index.html template JS code.
Will open a file selection dialog window for user to select the database they want to use.
Returns selected filepath as a string.
"""
@app.route("/get-filepath")
def getFilepath():
    try:

        return fileBrowse()
    except Exception,e:
        return str(e),500



"""
Function is used in the newdatabase.html template JS code.
Will open a file selection dialog window for user to create database file.
Returns selected filepath as a string.
Returns empty string if cancelled
"""
@app.route("/set-filepath")
def setFilepath():
    try:

        file_path=''
        if os.name=='posix':
            file_path = subprocess.check_output('./MacSave', shell=True)
            file_path = file_path[7:]
            file_path = file_path.replace("%20"," ")
        else:
            file_path = subprocess.check_output('SaveFileDialog.exe', shell=True)

        return file_path
    except Exception,e:
        return str(e),500


"""
Function opens file broswer dialog window for user to select file with.
Returns the selected filepath as a string.
"""
@app.route("/import-browse")
def importBrowser():
    try:


        return fileBrowse()
    except Exception,e:
            return str(e),500

"""
Function acts as the file browser for importbrowse and getfilepath
"""
def fileBrowse():

##    root = Tkinter.Tk()
##    root.withdraw()# Close the root window
##    root.overrideredirect(True)
##    root.geometry('0x0+0+0')#make tkinter window invisible
##
##    # Show window again and lift it to top so it can get focus,
##    # otherwise dialogs will end up behind the terminal.
##    root.deiconify()
##    root.lift()
##    root.focus_force()
##    
##    file_path = ''
##    file_path = tkFileDialog.askopenfilename(initialdir=(os.path.expanduser('~/')),parent=root)
##    root.destroy()
    file_path=''
    if os.name=='posix':
        file_path = subprocess.check_output('./MacBrowse3', shell=True)
        file_path = file_path[7:]
        file_path = file_path.replace("%20"," ")
    else:
        file_path = subprocess.check_output('BrowseDialog.exe', shell=True)

    return file_path


"""
Function takes filepath to a csv file on disk and adds it to the DB.
TODO: Check if file exists.
"""
@app.route("/import-direct",methods=['POST'])
def importFileDirect():
    try:
        if isLoggedIn() == False:
            return redirect(url_for(loginFunction))

        file_path = request.form['file']

        if str(os.path.splitext(file_path)[1]) != ".csv":
            return "Incorrect File Format.", 200
        
        importedFile = open(file_path,'r')
        reader = csv.DictReader(importedFile)
        i = 1
        for lineDict in reader:

            if not (lineDict.has_key('uuid') and lineDict.has_key('group') and lineDict.has_key('title') and lineDict.has_key('url') and lineDict.has_key('user')):
                importedFile.close()
                return "Incorrect Data Format",200
            if len(lineDict) > 7:
                importedFile.close()
                return "Incorrect Data Format. Too Many Items On Line " + str(i),200
            if len(lineDict.get('uuid','')) != 36:
                importedFile.close()
                return "Incorrect UUID On Line " + str(i),200


            entry = Vault.Record.create()
            #if doesUuidExit(lineDict.get('uuid',default=''))==False:
            #   entry._set_uuid(uuid.UUID(lineDict.get('uuid',default='')))
                
            if lineDict.get('group','') not in getGroups():#Add new groups to the session group list
                session['groups'].append(lineDict.get('group',''))
            entry._set_group(lineDict.get('group',''))
            entry._set_title(lineDict.get('title',''))
            entry._set_url(lineDict.get('url',''))
            entry._set_user(lineDict.get('user',''))
            entry._set_passwd(lineDict.get('password',''))
            entry._set_notes(lineDict.get('notes',''))
            sessionVault.getVault().records.append(entry)
            i += 1
            
        if i <= 1:
            importedFile.close()
            return "File Is Empty", 200
        saveDB()
        importedFile.close()
            
        return "",304


        
    except Exception,e:
        return str(e),500


"""
Function tests if a uuid already exists in the vault Database.
Return True if it does exist.
"""
def doesUuidExit(uuid):
    for record in sessionVault.getVault().records:
        if record._get_uuid() == uuid:
            return True
    return False

"""
Function returns a vault record with the given uuid string.
Else return None
"""
def getByUuid(uuid):
    for record in sessionVault.getVault().records:
        if record._get_uuid() == uuid:
            return record
    return None

"""
#Function creates a csv reprisentation of the DB and sends to front-end as csv file to download.
#Example CSV:
    uuid,group,title,url,user,password,notes
    cd1c32cc-0a51-4ca1-6186-d9b631abfd00,Infrastructure.Datacentre.Employees,Anna,,ID: 000002,,
    8032f145-6906-4a73-473d-b39d8d9edb0b,Infrastructure.Datacentre,PIN,,Rack F39,1234,This is the PIN code for the cage in the data centre.
    26a234e7-97c0-4c16-5e96-de0f34ec78ee,Sites,Facebook,facebook.com,test,1234,
"""
@app.route("/export")
def exportFile():
    
    try:
        if isLoggedIn() == False:
            return redirect(url_for(loginFunction))
        
        data = [["uuid","group","title","url","user","password","notes"]]
        for record in sessionVault.getVault().records:
            data.append([str(record._get_uuid()),str(record._get_group()),str(record._get_title()),str(record._get_url()),str(record._get_user()),str(record._get_passwd()),str(record._get_notes())])

        output = StringIO.StringIO()
        writer = csv.writer(output, delimiter=',')
        for line in data:
            writer.writerow(line)

        response = make_response(output.getvalue())
        response.headers["Content-Disposition"] = "attachment; filename=Exported_Password_Database.csv"
        return response
    except Exception,e:
        return str(e),500
    
"""
Function tests if the file is on an allowed extension type. i.e. '.csv'
"""
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS



    

"""
Funciton returns a list of all Titles in the database.
"""
def getAllTitles():
    titleList = []
    for rec in sessionVault.getVault().records:
        if rec._get_title() not in titleList:
            titleList.append(rec._get_title())
    return titleList

"""
Funciton returns a list of all Groups in the database.
"""
def getAllGroups():
    groupList = []
    for rec in sessionVault.getVault().records:
        if rec._get_group() not in groupList:
            groupList.append(rec._get_group())
    return groupList

"""
Funciton tests if a directory exists and if not, creates it.
"""
def assure_path_exists(path):
        direc = os.path.dirname(path)
        if not os.path.exists(direc):
                os.makedirs(direc)




"""
Function copies specified value from specified login account to clipboard.
uuid: UUID of account that needs value copied
attribute: the attribute that is to be copied.
    e.g. 'url','username','password'
"""
@app.route("/copy",methods=['POST'])
def copy():
    try:
        if isLoggedIn() == False:
                return "User Not Logged In.",200
        out = ""
        uuid = request.form['uuid']
        attribute = request.form['attribute']
        account = None

        for record in sessionVault.getVault().records:
                if str(record._get_uuid()) == str(uuid):
                    account = record
                    break
        
        if account is None:
            return "No Account Found With That UUID.", 200

        if attribute == "username":
            out = str(account._get_user())
        elif attribute == "password":
            out = str(account._get_passwd())
        elif attribute == "url":
            out = str(account._get_url())
        else:
            return "Invalid attribute.", 200
        
        pyperclip.copy(out)
        return str(out)
    except Exception,e:
        return str(e),500

"""
Function initiates configuration file.
"""
def initConfig():

##    if not os.path.isfile(confPath):
##        file(confPath, 'w').close()
    configDir = os.path.dirname(confPath)
    if not os.path.exists(configDir):
        os.makedirs(configDir)
    confParser.read(confPath)
    if not confParser.has_section("general"):
        confParser.add_section('general')
    if not confParser.has_section("passwords"):
        confParser.add_section('passwords')

    if not confParser.has_option("general", "sessionTimeOut"):
        confParser.set('general', 'sessionTimeOut', '300')

    if not confParser.has_option("passwords", "passwrdMinLenth"):
        confParser.set('passwords', 'passwrdMinLenth', '8')
    if not confParser.has_option("passwords", "isLowercase"):
        confParser.set('passwords', 'isLowercase', '1')
    if not confParser.has_option("passwords", "isUppercase"):
        confParser.set('passwords', 'isUppercase', '1')
    if not confParser.has_option("passwords", "isDigit"):
        confParser.set('passwords', 'isDigit', '1')
    if not confParser.has_option("passwords", "isSymbol"):
        confParser.set('passwords', 'isSymbol', '0')

    saveConfig()
    return

"""
Function saves conficuration to file.
"""
def saveConfig():
    configDir = os.path.dirname(confPath)
    if not os.path.exists(configDir):
        os.makedirs(configDir)
    if not os.path.isfile(confPath):
        file(confPath, 'w').close()
    cfgFile = open(confPath,'w')
    confParser.write(cfgFile)
    cfgFile.close()
    return

"""
Function sets configuration file to default settings
"""
def confSetToDefault():

    confParser.set('general', 'sessionTimeOut', '300')
    confParser.set('passwords', 'passwrdMinLenth', '8')
    confParser.set('passwords', 'isLowercase', '1')
    confParser.set('passwords', 'isUppercase', '1')
    confParser.set('passwords', 'isDigit', '1')
    confParser.set('passwords', 'isSymbol', '0')
    saveConfig()
    return



@app.route("/config-get")
def getConfig():
    try:
        data = {}

        
        data["sessionTimeOut"] = int(int(confParser.getint("general",'sessionTimeOut')) / 60)
        data["passwrdMinLenth"] = confParser.getint("passwords",'passwrdMinLenth')
        getConfCheckboxes(data,"passwords","isLowercase")
        getConfCheckboxes(data,"passwords","isUppercase")
        getConfCheckboxes(data,"passwords","isDigit")
        getConfCheckboxes(data,"passwords","isSymbol")
      

        return json.dumps(data)
    except Exception,e:
            return str(e),500

"""
Helper fuction for getConfig() to help with checkbox wierdness.
"""
def getConfCheckboxes(dataDict, cfgSection, cfgOption):
    if confParser.getint(cfgSection,cfgOption) == 1:
        dataDict[cfgOption] = "on"
        
    return

@app.route("/config-set",methods=['POST'])
def setConfig():
    try:#request.form.get('test1', default=False, type=bool)
        if (request.form.get('sessionTimeOut', False) != False) and int(request.form.get('sessionTimeOut')) > 0:
            confParser.set("general",'sessiontimeout',str(int(request.values.get('sessionTimeOut')) * 60))
        else:
            return "No sessionTimeOut set",200
        if request.form.get('passwrdMinLenth', False) and int(request.form.get('passwrdMinLenth')) >= 0:
            confParser.set("passwords",'passwrdminlenth',str(request.values.get('passwrdMinLenth')))
        else:
            return "No passwrdminlenth set",200
        setCheckBoxConfig(request,'isLowercase',"passwords")
        setCheckBoxConfig(request,'isUppercase',"passwords")
        setCheckBoxConfig(request,'isDigit',"passwords")
        setCheckBoxConfig(request,'isSymbol',"passwords")

        saveConfig()
        return ""
    except Exception,e:
            return str(e),500

    return

"""
Function tests if a checkbox value exists or not and sets the approperiate value to disk.
"""
def setCheckBoxConfig(request,cfgOption,cfgSection):
    if request.values.get(cfgOption,False):
        confParser.set(cfgSection,cfgOption,str(1))
    else:
        confParser.set(cfgSection,cfgOption,str(0))
    
    return

"""
Function returns a Json tree datastructure representation of password database
e.g.: {groupName:"",children:[{uuid:"79873249827346",title:"hello",user:"username",passwd:"1234",notes:"this is a note",last_mod:0,url:"google.com"}],groups:[{groupName:"Sites",children:[{uuid:"79873249827346",title:"hello",user:"username",passwd:"1234",notes:"this is a note",last_mod:0,url:"google.com"}],groups:[]},{groupName:"",children:[],groups:[]}]}
"""
@app.route("/get-db-json")
def getDbJson():
    if isLoggedIn() == False:
            return "User Not Logged In.",200
    try:
        dbDict = {}
        #dbDict= {"groupName":"","children":[],"groups":[]}
        dbDict = getChildren("")


        return json.dumps(dbDict)
    except Exception,e:
        return str(e),500

"""
Helper function for getDbJson(). Uses recursion to find an collect passwords and groups recursively.
single.
"""
def getChildren(groupName):
    returnDict = {"groupName":"","children":[],"groups":[]}
    if groupName != "":
        returnDict["groupName"] = splitGroups(groupName)[-1]
    else:
        returnDict["groupName"] = ""
    groupList = []
    for record in sessionVault.getVault().records:
        if record._get_group() == groupName:
            returnDict["children"].append(getChild(record))


    for record in getGroups():
        if groupName == "":
            if splitGroups(record)[0] not in groupList:
                groupList.append(splitGroups(record)[0])
        elif splitGroups(record)[:-1] == splitGroups(groupName):
            if '.'.join(splitGroups(record)[:len(splitGroups(groupName)) + 1]) not in groupList:
                groupList.append('.'.join(splitGroups(record)[:len(splitGroups(groupName)) + 1]))

                
    for group in groupList:        
        returnDict["groups"].append(getChildren(group))

    return returnDict

"""
Helper function for getChildren().
Returns a single dict representation of a child.
"""
def getChild(record):
    data = {
            "uuid" : "",
            "title" : "",
            "user" : "",
            #"passwd" : "",
            "notes" : "",
            "last_mod" : 0,
            "url" : ""
            }
    data["uuid"] = str(record._get_uuid())
    data["title"] = str(record._get_title())
    data["user"] = str(record._get_user())
    #data["passwd"] = str(record._get_passwd())
    data["notes"] = str(record._get_notes())
    data["last_mod"] = str(time.strftime("%H:%M %d-%m-%Y", time.localtime(record._get_last_mod())))
    data["url"] = str(record._get_url())
    return data

"""
Function is a helper for getChildren.
Returns a list of groups split up by the delimiter '.'
"""
def splitGroups(groups):
    if groups == "":
        return []
    groupList = csv.reader(cStringIO.StringIO(groups), delimiter='.', escapechar='\\').next()
    return groupList


"""
Function safely closes the backend server.
"""
@app.route('/shutdown')
def shutdown():
    try:
        t = threading.Thread(target=shutdownDelay)
        t.start()
        #shutdown_server()    
        return "",304
    except Exception,e:
        return str(e),500


def shutdownDelay():
    try:
        time.sleep(shutdown_delay)
        response = urllib2.urlopen('http://localhost:'+server_port_number+"/force-shutdown")
        return
    except Exception,e:
        return#We expect a http 500 error here.

"""

"""
@app.route('/force-shutdown')
def shutdown_server():
    if isLoggedIn():#redirects if already logged in
            sessionVault.removeVault()
            session.clear()
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()
    return




#Code below is equivilent to a "Main" function in Java or C
if __name__ == "__main__":

    #Prevent Py2exe making a .log file
    sys.stderr = sys.stdout

    #Open users browser to allow access to the frontend.
    webbrowser.open_new_tab('http://localhost:'+server_port_number)
    
    #Close Program if an instance of Password Primate is already running.
    me = singleton.SingleInstance()
    
    #initiate server config
    initConfig()
    
    #initiate object that will store the databases.
    global sessionVault
    sessionVault = SessionVault()


    #This key is used to encrypt the session cookies for security.
    app.secret_key = os.urandom(24)

    #This is how long the session will remain active untill it times-out.
    app.permanent_session_lifetime = timedelta(seconds=600)
    
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER # Placeholder for where files should be stored if files are uploaded via HTML
                                                # form.
    app.debug = False #Disable this for demonstrations to prevent the double loading problem.
    #app.threaded = True #Change if the server handles multiple requests at
                        #once.
    app.run()#Start the webserver.
