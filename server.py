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

UPLOAD_FOLDER = '/uploads'
ALLOWED_EXTENSIONS = set(['csv'])
app = Flask(__name__)
#something happened

class SessionVault:
    """A class to hold all session data in."""
    
    def __init__(self):
        self.vaults = {}
        return

    def addVault(self,vault):
        if session['id'] in self.vaults:######################################need to check if Vault already exists in this dictionary
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


#Root function that is activated when a user first visits the website
@app.route("/")
def index():
    # For the timeout/session lifetime config to work we need
    # to make the sessions permanent. It's false by default
    # +INFO: http://flask.pocoo.org/docs/api/#flask.session.permanent
    session.permanent = True
    # On each page load we are going to increment a counter
    # stored on the session data

    
    try:
        session['groups']==[]
    except KeyError:
        session['groups'] = []

    #test if the session is logged in.
    try:
        if session['loggedIn']==True:
            return redirect(url_for('dashboard'))
        
    except KeyError:
        #Key error assumes false
        return render_template('index.html')
    #if session is not logged in \/
    return render_template('index.html')


#MAIN DISPLAY
@app.route("/dashboard")
def dashboard():

    #test if the session is NOT logged in.
    try:
        if session['loggedIn']==False:
            return redirect(url_for('index'))
        
    except KeyError:
        #Key error assumes false
        return redirect(url_for('index'))
    
    #if session IS logged in \/
    getGroups() #important, it populates the group list
    return render_template('dashboard.html', records=sessionVault.getVault().records)


#Please comment if you have abetter name
#Function will check if user has logged in already
def isLoggedIn():
#test if the session is logged in.
    try:
        if session['loggedIn']==True:
            return True
        
    except KeyError:
        #Key error assumes false
        return False
    #if session is not logged in \/
    return False
    


#Function that handled the logic of checking if the Login was successful or not.
#If success then redirect to dashboard.
#If fail redirect to login page with error message.
@app.route("/login", methods=['POST', 'GET'])
def login():
    if isLoggedIn():#redirects if already logged in
        return redirect(url_for('dashboard'))
    
    session['id']=uuid.uuid4()
    session['username']=request.form['Username']
    session['password']=request.form['Password'].encode('ascii','ignore')
    session['dbFile']=request.form['DatabaseFile']
    if (os.path.isfile(session['dbFile'])==False):
        return render_template('index.html', error="Database file does not exist.")
    #global vault #A temporary mesure, will later replace with a kind of "Session Class Object" that store all session information and we can pass to all functions.
    try:
        sessionVault.addVault(Vault(session['password'],session['dbFile']))
    except 'BadPasswordError':
        return render_template('index.html', error="Incorrect Password.")
    except Exception,e:
        return render_template('index.html', error=str(e))

    session['loggedIn']=True
    getGroups() #important, it populates the group list
    return redirect(url_for('dashboard'))


#Takes user to the new database page 
@app.route("/NewDatabase")
def newDatabase():
    if isLoggedIn():#redirects if already logged in
        return redirect(url_for('dashboard'))
    return render_template('newDB.html')


#Function that handles the creation of a new DB file and logging the user in.
#If success then redirect to dashboard.
#If fail redirect to newDB page with error message.
@app.route("/newDB", methods=['POST', 'GET'])
def newDB():
    if isLoggedIn():#redirects if already logged in
        return redirect(url_for('dashboard'))
    if (request.form['Password'].encode('ascii','ignore') != request.form['ConfirmPassword'].encode('ascii','ignore')):
        return render_template('newDB.html', error="Passwords do not match.")
    session['username']=request.form['Username']
    session['password']=request.form['Password'].encode('ascii','ignore')
    assert type(session['password']) != unicode
    session['dbFile']=request.form['DatabaseFile']
    
    try:
        sessionVault.addVault(Vault(session['password'].encode('ascii','ignore')))
        sessionVault.getVault().write_to_file(session['password'].encode('ascii','ignore'),session['dbFile'])
    except 'BadPasswordError':
        return render_template('newDB.html', error="Incorrect Password.")
    #except Exception,e:
    #    return render_template('newDB.html', error="Error:"+str(e))

    getGroups() #important, it populates the group list
    return redirect(url_for('dashboard'))



#Closes the user session and loggs them out
@app.route("/logout")
def logoff():
    if isLoggedIn():#redirects if already logged in
        sessionVault.removeVault()
        session.clear()
        return redirect(url_for('dashboard'))
    return redirect(url_for('index'))



#Function returns a JSON of details about requested account.
@app.route("/get-user", methods=['POST', 'GET'])
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

#Returns data to populate the Group-Edit menu on the dashboard
@app.route("/getGroup", methods=['POST', 'GET'])
def getGroup():
    group=request.form['group']
    for record in sessionVault.getVault().records:
        outString= "uuid: "+ str(record._get_uuid()) + "\n"
        
    return "No Record Found"


@app.route("/refresh")
def refresh():

    return redirect(url_for('dashboard'))



@app.route("/create-group", methods=['POST', 'GET'])
def createGroup():
    groupParent=request.form['groupParent']
    groupName=request.form['groupName']
    if len(groupParent) == 0:
        addGroup(groupName)
    else:
        if groupParent not in getGroups():
            return "Group Parent Not Found", 500
        session['groups'].addGroup(groupParent +"."+ groupName)#

    return "Group Added Successfully"



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
        return "Group edited Successfully, list=" + str(session['groups'])+"  group="+ str(group)
    except Exception,e:
        return str(e),500


@app.route("/delete-group", methods=['POST'])
def deleteGroup():
    try:
        #sessionData.logger.error("stuff")
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
        return "Group deleted Successfully"
    except Exception,e:
        return str(e),500



@app.route("/create-user", methods=['POST'])
def createUser():
    try:
        #sessionData.logger.error("stuff")
        group=request.form['group']
        usr=request.form['usr']
        pwd=request.form['pwd']
        userTitle=request.form['userTitle']
        userUrl=request.form['userUrl']
        notes=request.form['notes']
        #sessionData.logger.error("UserGroup:"+str(len(group)))
        if len(group)<= 0:
            #sessionData.logger.error("UserGroup:"+group)
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
        return "Group Added Successfully"
    except Exception,e:
        return str(e),500



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
                return "Account Edited Successfully"
            
        return "Account was not found.", 500
    except Exception,e:
        return str(e),500

@app.route("/delete-user", methods=['POST', 'GET'])
def deleteUser():
    try:
        uuid = request.form['uuid']
        for record in sessionVault.getVault().records:
            if str(record._get_uuid()) == uuid:
                sessionVault.getVault().records.remove(record)
                saveDB()
                return "Account Deleted Successfully"
        return "Cannot find account tobe deleted.", 500
    except Exception,e:
        return str(e),500
    return


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



#Returns data to populate the Group-Edit menu on the dashboard
@app.route("/save", methods=['POST', 'GET'])
def saveDB():
    sessionVault.getVault().write_to_file(session['dbFile'], session['password'])
    
    return "Database was saved to "+session['dbFile']



#Takes a html form uplaoded csv file and adds it to the DB
#Current Bugs: Cannot handle if commas are a part of the csv content
@app.route("/import")
def importFile():
    try:
##        if isLoggedIn() == False:
##            return redirect(url_for('index'))
##        
##        f = request.files['file']
##        if f and allowed_file(f.filename):
##            filename = secure_filename(f.filename)
##            f.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
##            importedFile = open(str(os.path.join(app.config['UPLOAD_FOLDER'], filename)),'r')
            importedFile = open("uploads/test.csv",'r')
            content = importedFile.readlines()
            if len(content) <=1:
                return "No accounts found in file", 500
            for i, line in enumerate(content):
                if i == 0 and content[0]!="uuid,group,title,url,user,password,notes\n":
                    return "Incorrect data format on line " + str(i)+" :"+content[0], 500
                if i == 0:
                    continue
                lineList = line.replace("\n","").split(",")
                if len(lineList)>7:
                    return "Unhandled comma in CSV data on line " + str(i), 500
                if len(lineList)<7:
                    return "Incorrect data format on line " + str(i), 500
                if len(lineList[0])!=36:
                    return "Incorrect UUID on line " + str(i),500

                entry = Vault.Record.create()
                if doesUuidExit(lineList[0])==False:
                    entry._set_uuid(uuid.UUID(lineList[0]))
                    

                entry._set_group(lineList[1])
                entry._set_title(lineList[2])
                entry._set_url(lineList[3])
                entry._set_user(lineList[4])
                entry._set_passwd(lineList[5])
                entry._set_notes(lineList[6])
                if doesUuidExit(lineList[0])==False:
                    sessionVault.getVault().records.append(entry)

            saveDB()
            importedFile.close()
            
                
            return "Successfuly Imported."


        #return "An Error Occured.", 500
    except Exception,e:
        return str(e),500



#Tests if a uuid already exists inthe vault DC
def doesUuidExit(uuid):
    for record in sessionVault.getVault().records:
        if record._get_uuid()==uuid:
            return True
    return False

#returns a vault record with the given uuid string. Else return None
def getByUuid(uuid):
    for record in sessionVault.getVault().records:
        if record._get_uuid()==uuid:
            return record
    return None


#Function creates a csv reprisentation of the DB and sends to browser as csv file to download.
#Example CSV
    #uuid,group,title,url,user,password,notes
    #cd1c32cc-0a51-4ca1-6186-d9b631abfd00,Infrastructure.Datacentre.Employees,Anna,,ID: 000002,,
    #8032f145-6906-4a73-473d-b39d8d9edb0b,Infrastructure.Datacentre,PIN,,Rack F39,1234,This is the PIN code for the cage in the data centre.
    #26a234e7-97c0-4c16-5e96-de0f34ec78ee,Sites,Facebook,facebook.com,test,1234,
@app.route("/export")
def exportFile():

    try:
        if isLoggedIn() == False:
            return redirect(url_for('index'))
        csv = "uuid,group,title,url,user,password,notes\n"
        tmpStr = ""
        for record in sessionVault.getVault().records:
            tmpStr =("%s,%s,%s,%s,%s,%s,%s")%(str(record._get_uuid()),str(record._get_group()),str(record._get_title()),str(record._get_url()),str(record._get_user()),str(record._get_passwd()),str(record._get_notes()))

            #clean string of newlines
            tmpStr = tmpStr.replace("\n", "\\n").replace("\r", "\\r")

            csv+= tmpStr + "\n"
            tmpStr=""
        
        # We need to modify the response, so the first thing we 
        # need to do is create a response out of the CSV string
        response = make_response(csv)
        # This is the key: Set the right header for the response
        # to be downloaded, instead of just printed on the browser
        response.headers["Content-Disposition"] = "attachment; filename=books.csv"

        return response
    except Exception,e:
        return str(e),500
    

#Function tests if the file is on an allowed extension type
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS



    


#Returns a list of all Titles in the database.
def getAllTitles():
    titleList=[]
    for rec in sessionVault.getVault().records:
        if rec._get_title() not in titleList:
            titleList.append(rec._get_title())
    return titleList

#Returns a list of all Groups in the database
def getAllGroups():
    groupList=[]
    for rec in sessionVault.getVault().records:
        if rec._get_group() not in groupList:
            groupList.append(rec._get_group())
    return groupList


#Code below is equivilent to a "Main" function in Java or C
if __name__ == "__main__":
    global sessionVault
    sessionVault = SessionVault()
    webbrowser.open_new_tab('http://localhost:5000')

    #app.logger = logging.getLogger('Primate')
    #handler = logging.FileHandler('access.log')

    #app.logger.addHandler(handler)
    
    #sessionData.logger.error("herror")
    #app.logger.addHandler(handler)

    #This key is used to encrypt the sessions
    app.secret_key = os.urandom(24)

    #This is how long the session will remain active
    app.permanent_session_lifetime = timedelta(seconds=600)
    
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.debug = True
    app.run()
