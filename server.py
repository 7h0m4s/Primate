from flask import Flask
from flask import request
from flask import render_template
from vault import *
import os.path
import webbrowser
app = Flask(__name__)

#C:\Users\thoma_000\Dropbox\UQ Semester 2-2014\DECO3801\python\flaskr\static\testfile.csv

@app.route("/")
def hello():
    linestring = open('passwords.html', 'r').read()
    return linestring

@app.route("/login", methods=['POST', 'GET'])
def login():
    username=request.form['Username']
    password=request.form['Password']
    dbFile=request.form['DatabaseFile']
    global vault
    vault = Vault(password.encode('ascii','ignore'),dbFile)

##    outString=""
##    for rec in vault.records:
##        outString += str(rec._get_uuid()) + "<br>"
##        outString += str(rec._get_title()) + "<br>"
##        outString += str(rec._get_group()) + "<br>"
##        outString += str(rec._get_user()) + "<br>"
##        outString += str(rec._get_passwd()) + "<br>"
##        outString += str(rec._get_notes()) + "<br>" + "<br>"

    output = render_template('passwords.html', vaultRecords = vault.records, groupList=getAllGroups(), titleList=getAllTitles())
    
    return output


@app.route("/getRecordData", methods=['POST', 'GET'])
def getRecordData():
    uuid=request.form['uuid']
    for record in vault.records:
        #print record._get_uuid()+":"+uuid
        if str(record._get_uuid()) == uuid:
            outString= "uuid: "+ str(record._get_uuid()) + "\n"
            outString+="title: "+ str(record._get_title()) + "\n"
            outString+="user: "+ str(record._get_user()) + "\n"
            outString+="password :"+ str(record._get_passwd()) + "\n"
            outString+="url: "+ str(record._get_url()) + "\n"
            return outString
        
    return "No Record Found"

def getAllTitles():
    titleList=[]
    for rec in vault.records:
        if rec._get_title() not in titleList:
            titleList.append(rec._get_title())
    return titleList

def getAllGroups():
    groupList=[]
    for rec in vault.records:
        if rec._get_group() not in groupList:
            groupList.append(rec._get_group())
    return groupList


if __name__ == "__main__":
    webbrowser.open_new_tab('http://localhost:5000/static/index.html')
    app.debug = True
    app.run()
