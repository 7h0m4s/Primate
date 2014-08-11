from vault import *
import os.path

#C:\Users\thoma_000\Dropbox\UQ Semester 2-2014\DECO3801\python\flaskr\static\testfile.psafe3
username=""
password="test"
dbFile="C:/Users/thoma_000/Dropbox/UQ Semester 2-2014/DECO3801/python/flaskr/static/testfile.psafe3"
vault = Vault(password,dbFile)

for rec in vault.records:
    print str(rec._get_uuid())
    print str(rec._get_title())
    print str(rec._get_group())
    print str(rec._get_user())
    print str(rec._get_passwd())
    print str(rec._get_notes())
