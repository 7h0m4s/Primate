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

#Configuration to handle HTML file uploads if implemented later.
UPLOAD_FOLDER = 'uploads/'
ALLOWED_EXTENSIONS = set(['csv'])

app = Flask(__name__)


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
        self.vaults[session['id']]=vault
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
    # to make the sessions permanent. It's false by default
    # +INFO: http://flask.pocoo.org/docs/api/#flask.session.permanent
    session.permanent = True

    #Test if session is initiated.
    try:
        session['groups']==[]
    except KeyError:
        session['groups'] = []

    #Test if the session is logged in.
    try:
        if session['loggedIn']==True:
            return redirect(url_for('dashboard'))
        
    except KeyError:
        #Key error assumes false
        return render_template('index.html')
    #if session is not logged in \/
    return render_template('index.html')


"""
Function returns the main dashboard.
If user is not logged in they will be redirected to index().
"""
@app.route("/dashboard")
def dashboard():

    #Test if the session is NOT logged in.
    try:
        if session['loggedIn']==False:
            return redirect(url_for('index'))
        
    except KeyError:
        #Key error assumes false
        return redirect(url_for('index'))
    
    #If session IS logged in \/
    getGroups() #important, it populates the group list
    return render_template('dashboard.html', records=sessionVault.getVault().records)


"""
Function returns if user is logged in yet or not.
Returns True if logged in.
"""
def isLoggedIn():
#Test if the session is logged in.
    try:
        if session['loggedIn']==True:
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
        return redirect(url_for('dashboard'))
    
    session['id']=uuid.uuid4()
    session['username']=request.form['Username']
    session['password']=request.form['Password'].encode('ascii','ignore')
    session['dbFile']=request.form['DatabaseFile']
    if (os.path.isfile(session['dbFile'])==False):
        return render_template('index.html', error="Database file does not exist.")
    
    try:
        sessionVault.addVault(Vault(session['password'],session['dbFile']))
    except 'BadPasswordError':
        return render_template('index.html', error="Incorrect Password.")
    except Exception,e:
        return render_template('index.html', error=str(e))

    session['loggedIn']=True
    getGroups() #Important, it populates the group list
    return redirect(url_for('dashboard'))


"""
Function redirects user to the New Database template page.
"""
@app.route("/NewDatabase")
def newDatabase():
    if isLoggedIn():#redirects if already logged in
        return redirect(url_for('dashboard'))
    return render_template('newDB.html')

"""
Function that handles the creation of a new DB file and logging the user in.
If success then redirect to dashboard.
If fail redirect to newDB page with error message.
"""
@app.route("/newDB", methods=['POST', 'GET'])
def newDB():
    if isLoggedIn():#Redirects if already logged in
        return redirect(url_for('dashboard'))
    if (request.form['Password'].encode('ascii','ignore') != request.form['ConfirmPassword'].encode('ascii','ignore')):
        return render_template('newDB.html', error="Passwords do not match.")
    session['id']=uuid.uuid4()
    session['username']=request.form['Username']
    session['password']=request.form['Password'].encode('ascii','ignore')
    assert type(session['password']) != unicode
    session['dbFile']=request.form['DatabaseFile']
    
    try:
        sessionVault.addVault(Vault(session['password'].encode('ascii','ignore')))
        sessionVault.getVault().write_to_file(session['password'].encode('ascii','ignore'),session['dbFile'])
    except 'BadPasswordError':
        return render_template('newDB.html', error="Incorrect Password.")

    session['loggedIn']=True
    getGroups() #Important, it populates the group list
    return redirect(url_for('dashboard'))


"""
Function closes the user session and logs them out
"""
@app.route("/logout")
def logoff():
    if isLoggedIn():#redirects if already logged in
        sessionVault.removeVault()
        session.clear()
        return redirect(url_for('dashboard'))
    return redirect(url_for('index'))


"""
Function returns a JSON of details about requested login account.
Form Parameter: -String uuid
"""
@app.route("/get-user", methods=['POST'])
def getUser():
    uuid=request.form['uuid']
    for record in sessionVault.getRecords():
        if str(record._get_uuid()) == uuid:
            data={}
            data["uuid"]=str(record._get_uuid())
            data["usr"]=str(record._get_user())
            data["userTitle"]=str(record._get_title())
            data["userUrl"]=str(record._get_url())
            data["notes"]=str(record._get_notes())

            return json.dumps(data)
        
    return "No Record Found", 500

"""
Returns data to populate the Group-Edit menu on the dashboard
Form Parameter: -String group
"""
@app.route("/getGroup", methods=['POST'])
def getGroup():
    group=request.form['group']
    for record in sessionVault.getVault().records:
        outString= "uuid: "+ str(record._get_uuid()) + "\n"
        
    return "No Record Found"

"""
Function returns the dashboard page
"""
@app.route("/refresh")
def refresh():

    return redirect(url_for('dashboard'))


"""
Function creates group.
Form Parameters:    String groupParent
                    String groupName
NOTE: The created group does not save to the database
unless there is a user under that group.
"""
@app.route("/create-group", methods=['POST', 'GET'])
def createGroup():
    groupParent=request.form['groupParent']
    groupName=request.form['groupName']
    if len(groupParent) == 0:
        addGroup(groupName)
    else:
        if groupParent not in getGroups():
            return "Group Parent Not Found", 500
        session['groups'].append(groupParent +"."+ groupName)#

    return "Group Added Successfully", 304


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
        group=request.form['group']
        groupParent=request.form['groupParent']
        groupName=request.form['groupName']
        outstring=[]
        if len(groupParent)>0:
            groupName = groupParent + "." + groupName
        
        #update group list
        if groupName in session['groups']:
            session['groups'].remove(group)
            
        for name in session['groups']:
            if name == group:
                session['groups'].remove(name)
                session['groups'].append(groupName)
                break

            
        #update related records
        for record in sessionVault.getVault().records:
            if record._get_group() == group:
                record._set_group(groupName)

        saveDB()
        return "Group edited Successfully, list=" + str(session['groups'])+"  group="+ str(group), 304
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
        group=request.form['group']
        groupParent=request.form['groupParent']
        groupName=request.form['groupName']
       
        if len(groupParent)>0:
            groupName = groupParent + "." + groupName

        #delete from group list
        for name in session['groups']:
            if name == group:
                session['groups'].remove(name)
                break
            
        #delete related records
        for record in sessionVault.getVault().records:
            if record._get_group() == group:
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
        group=request.form['group']
        usr=request.form['usr']
        pwd=request.form['pwd']
        userTitle=request.form['userTitle']
        userUrl=request.form['userUrl']
        notes=request.form['notes']
        if len(group)<= 0:
            return "Cannot create user. No group name given.", 500
        entry = Vault.Record.create()
        entry._set_group(group)
        entry._set_user(usr)
        entry._set_passwd(pwd)
        entry._set_title(userTitle)
        entry._set_url(userUrl)
        entry._set_notes(notes)
        sessionVault.getVault().records.append(entry)

        saveDB()
        return "Group Added Successfully", 304
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
        usr=request.form['usr']
        pwd=request.form['pwd']
        userTitle=request.form['userTitle']
        userUrl=request.form['userUrl']
        notes=request.form['notes']

        if len(userTitle)<= 0:
            return "Account must have a title.", 500
        for record in sessionVault.getVault().records:
            if str(record._get_uuid()) == uuid:
                record._set_user(usr)
                record._set_passwd(pwd)
                record._set_title(userTitle)
                record._set_url(userUrl)
                record._set_notes(notes)
            
                saveDB()
                return "Account Edited Successfully", 304
            
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
        return "Cannot find account tobe deleted.", 500
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
            for record in sessionVault.getVault().records:
                if str(record._get_group()) not in session['groups']:
                    session['groups'].append(str(record._get_group()))
    except KeyError:#yes I know this is repeated code. I was lazy tonight :P
            session['groups'] = []
            for record in sessionVault.getVault().records:
                if str(record._get_group()) not in session['groups']:
                    session['groups'].append(str(record._get_group()))
                    
    return session['groups']



def addGroup(group):
    if group not in session['groups']:
                session['groups'].append(group)

    return


"""
Function saves changes to the database to the database file.
"""
@app.route("/save", methods=['POST'])
def saveDB():
    sessionVault.getVault().write_to_file(session['dbFile'], session['password'])
    
    return "Database was saved to "+session['dbFile']




"""
Function opens file broswer dialog window for user to select file with.
Returns the selected filepath as a string.
"""
@app.route("/import-browse")
def importBrowser():
    root = Tkinter.Tk()
    root.withdraw()# Close the root window
    root.overrideredirect(True)
    root.geometry('0x0+0+0')#make tkinter window invisible

    # Show window again and lift it to top so it can get focus,
    # otherwise dialogs will end up behind the terminal.
    root.deiconify()
    root.lift()
    root.focus_force()
    
    file_path = tkFileDialog.askopenfilename(initialdir=(os.path.expanduser('~/')),parent=root)
    root.destroy()
    return file_path

"""
Function takes filepath to a csv file on disk and adds it to the DB.
TODO: Check if file exists.
"""
@app.route("/import-direct",methods=['POST'])
def importFileDirect():
    try:
        if isLoggedIn() == False:
            return redirect(url_for('index'))

        file_path = request.form['file']

        if str(os.path.splitext(file_path)[1])!=".csv":
            return "Incorrect file format.", 500
        
        importedFile = open(file_path,'r')
        reader = csv.reader(importedFile)
        i = 0
        for lineList in reader:
            
            #Example of first line:['uuid', 'group', 'title', 'url', 'user', 'password', 'notes']
            if i == 0 and str(lineList)!=str(['uuid', 'group', 'title', 'url', 'user', 'password', 'notes']):
                return "Incorrect data format on line " + str(i)+" :"+ str(lineList), 500
            if i == 0:
                i += 1
                continue
            if len(lineList)>7:
                return "Incorrect data format on line " + str(i) +" :"+ str(lineList), 500
            if len(lineList)<7:
                return "Incorrect data format on line " + str(i) +" :"+ str(lineList), 500
            if len(lineList[0])!=36:
                return "Incorrect UUID on line " + str(i),500

            entry = Vault.Record.create()
            if doesUuidExit(lineList[0])==False:
                entry._set_uuid(uuid.UUID(lineList[0]))
                
            if lineList[1] not in getGroups():#Add new groups to the session group list 
                session['groups'].append(lineList[1])
            entry._set_group(lineList[1])
            entry._set_title(lineList[2])
            entry._set_url(lineList[3])
            entry._set_user(lineList[4])
            entry._set_passwd(lineList[5])
            entry._set_notes(lineList[6])
            if doesUuidExit(lineList[0])==False:
                sessionVault.getVault().records.append(entry)
            i += 1
            
        if i <=1:
            return "No accounts found in file", 500
        saveDB()
        importedFile.close()
        
            
        return "Sucessfuly imported."


        return "An Error Occured.", 500
    except Exception,e:
        return str(e),500


"""
Function tests if a uuid already exists in the vault Database.
Return True if it does exist.
"""
def doesUuidExit(uuid):
    for record in sessionVault.getVault().records:
        if record._get_uuid()==uuid:
            return True
    return False

"""
Function returns a vault record with the given uuid string.
Else return None
"""
def getByUuid(uuid):
    for record in sessionVault.getVault().records:
        if record._get_uuid()==uuid:
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
    #Error checking disabled for debuging (counterintuative right? It just means we are using the Flask Debug system instead.)
    #try:
        if isLoggedIn() == False:
            return redirect(url_for('index'))
        
        data = [["uuid","group","title","url","user","password","notes"]]
        for record in sessionVault.getVault().records:
            data.append([str(record._get_uuid()),str(record._get_group()),str(record._get_title()),str(record._get_url()),str(record._get_user()),str(record._get_passwd()),str(record._get_notes())])

        output = StringIO.StringIO()
        writer = csv.writer(output, delimiter=',')
        for line in data:
            writer.writerow(line)

        response = make_response(output.getvalue())
        response.headers["Content-Disposition"] = "attachment; filename=books.csv"
        return response
    #except Exception,e:
        #return str(e),500
    
"""
Function tests if the file is on an allowed extension type. i.e. '.csv'
"""
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS



    

"""
Funciton returns a list of all Titles in the database.
"""
def getAllTitles():
    titleList=[]
    for rec in sessionVault.getVault().records:
        if rec._get_title() not in titleList:
            titleList.append(rec._get_title())
    return titleList

"""
Funciton returns a list of all Groups in the database.
"""
def getAllGroups():
    groupList=[]
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
Function is used in the index.html template JS code.
Will open a file selection dialog window for user to select the database they want to use.
Returns selected filepath as a string.
"""
@app.route("/get-filepath")
def getFilepath():
    root = Tkinter.Tk()
    root.withdraw()
    root.overrideredirect(True)
    root.geometry('0x0+0+0')#make tkinter window invisible
    #Tkinter.Tk().withdraw() # Close the root window

    # Show window again and lift it to top so it can get focus,
    # otherwise dialogs will end up behind the terminal.
    root.deiconify()
    root.lift()
    root.focus_force()
    
    in_path = tkFileDialog.askopenfilename(initialdir=(os.path.expanduser('~/')),parent=root)
    root.destroy()
    return in_path




"""
Function copies specified value from specified login account to clipboard.
uuid: UUID of account that needs value copied
attribute: the attribute that is to be copied.
    e.g. 'url','username','password'
"""
@app.route("/copy",methods=['POST'])
def copy():
    out = ""
    uuid = request.form['uuid']
    attribute = request.form['attribute']
    account = None

    for record in sessionVault.getVault().records:
            if str(record._get_uuid())== str(uuid):
                account = record
                break
    
    if account is None:
        return "No Account Found With That UUID.", 500

    if attribute=="username":
        out = str(account._get_user())
    elif attribute=="password":
        out = str(account._get_passwd())
    elif attribute=="url":
        out = str(account._get_url())
    else:
        return "Invalid attribute.", 500
    
    pyperclip.copy(out)
    return "Copied to clipboard!"

"""
Function initiates configuration file.
"""
def initConfig():
    global confParser
    confParser = SafeConfigParser()
    confPath = 'config.ini'
    if not os.path.isfile(confPath):
        file(confPath, 'w').close()
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
    
    return

##sessionTimeOut:
## 1
## passwrdMinLenth:
## 1
## isLowercase:
## on
## isUppercase:
## on
## isDigit:
## on
## isSymbol:
## on

## sessionTimeOut:
## 1
## passwrdMinLenth:
## 1
## isLowercase:
## on
## isUppercase:
## on
## isDigit:
## on
## isSymbol:
## on
@app.route("/config-get")
def getConfig():
    try:
        data={}

        data["time_to_timeout"]=confParser.getint("general",'sessionTimeOut')
        data["password_length"]=confParser.getint("passwords",'passwrdMinLenth')
        data["lowercase_letters"]=confParser.getint("passwords",'isLowercase')
        data["uppercase_letters"]=confParser.getint("passwords",'isUppercase')
        data["digits"]=confParser.getint("passwords",'isDigit')
        data["symbols"]=confParser.getint("passwords",'isSymbol')
        

        return json.dumps(data)
    except Exception,e:
            return str(e),500
        

@app.route("/config-set",methods=['POST'])
def setConfig():
    try:#request.form.get('test1', default=False, type=bool)
        confParser.set("general",'time_to_timeout',request.form.get('sessionTimeOut'))
        confParser.set("passwords",'password_length',request.form.get('passwrdMinLenth'))
        setCheckBoxConfig(request,'isLowercase',"passwords")
        setCheckBoxConfig(request,'isUppercase',"passwords")
        setCheckBoxConfig(request,'isDigit',"passwords")
        setCheckBoxConfig(request,'isSymbol',"passwords")

        return
    except Exception,e:
            return str(e),500

    return

"""
Function tests if a checkbox value exists or not and sets the approperiate value to disk.
"""
def setCheckBoxConfig(request,cfgOption,cfgSection):
    if request.form.get(cfgOption,False):
        confParser.set(cfgSection,cfgOption,1)
    else:
        confParser.set(cfgSection,cfgOption,0)
    
    return

"""
Function returns a Json tree datastructure representation of password database
e.g.: {groupName:"",children:[{uuid:"79873249827346",title:"hello",user:"username",passwd:"1234",notes:"this is a note",last_mod:0,url:"google.com"}],groups:[{groupName:"Sites",children:[{uuid:"79873249827346",title:"hello",user:"username",passwd:"1234",notes:"this is a note",last_mod:0,url:"google.com"}],groups:[]},{groupName:"",children:[],groups:[]}]}
"""
@app.route("/get-db-json")
def getDbJson():
    dbDict={}
    #dbDict= {"groupName":"","children":[],"groups":[]}
    dbDict = getChildren("")


    return json.dumps(dbDict)

"""
Helper function for getDbJson(). Uses recursion to find an collect passwords and groups recursively.
single.
"""
def getChildren(groupName):
    returnDict={"groupName":"","children":[],"groups":[]}
    if groupName!="":
        returnDict["groupName"] = splitGroups(groupName)[-1]
    else:
        returnDict["groupName"]= ""
    groupList=[]
    for record in sessionVault.getVault().records:
        if record._get_group() == groupName:
            returnDict["children"].append(getChild(record))


    for record in sessionVault.getVault().records:
        if groupName=="":
            if splitGroups(record._get_group())[0] not in groupList:
                groupList.append(splitGroups(record._get_group())[0])
        elif splitGroups(record._get_group())[:-1] == splitGroups(groupName):
            if '.'.join(splitGroups(record._get_group())[:len(splitGroups(groupName))+1]) not in groupList:
                groupList.append('.'.join(splitGroups(record._get_group())[:len(splitGroups(groupName))+1]))

                
    for group in groupList:        
        returnDict["groups"].append(getChildren(group))

    return returnDict

"""
Helper function for getChildren().
Returns a single dict representation of a child.
"""
def getChild(record):
    data={
            "uuid" : "",
            "title" : "",
            "user" : "",
            "passwd" : "",
            "notes" : "",
            "last_mod" : 0,
            "url" : ""
            }
    data["uuid"]=str(record._get_uuid())
    data["title"]=str(record._get_title())
    data["user"]=str(record._get_user())
    data["passwd"]=str(record._get_passwd())
    data["notes"]=str(record._get_notes())
    data["last_mod"]=str(time.strftime("%H:%M %d-%m-%Y", time.localtime(record._get_last_mod())))
    data["url"]=str(record._get_url())
    return data

"""
Function is a helper for getChildren.
Returns a list of groups split up by the delimiter '.'
"""
def splitGroups(groups):
    if groups == "":
        return []
    groupList= csv.reader(cStringIO.StringIO(groups), delimiter='.', escapechar='\\').next()
    return groupList


#Code below is equivilent to a "Main" function in Java or C
if __name__ == "__main__":
    #initiate object that will store the databases.
    global sessionVault
    sessionVault = SessionVault()

    #Open users browser to allow access to the frontend.
    webbrowser.open_new_tab('http://localhost:5000')


    #This key is used to encrypt the session cookies for security.
    app.secret_key = os.urandom(24)

    #This is how long the session will remain active untill it times-out. 
    app.permanent_session_lifetime = timedelta(seconds=600)
    
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER # Placeholder for where files should be stored if files are uploaded via HTML form.
    app.debug = True #Disable this for demonstrations to prevent the double loading problem.
    #app.threaded = True #Change if the server handles multiple requests at once.
    app.run()#Start the webserver.
