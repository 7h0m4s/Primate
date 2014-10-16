import os

from ConfigParser import SafeConfigParser
import appdirs

global appName
global appAuthor
appName = "PasswordPrimate"
appAuthor = "AsterixSolutions"

global loginFunction
global dashboardFunction
global newdbFunction
loginFunction = 'index'
dashboardFunction = 'dashboard'
newdbFunction='newDatabase'

global confParser
global confPath

confPath = 'config.ini'
#appdirs.user_data_dir(appName, appAuthor)
print os.path.join(appdirs.user_data_dir(appName, appAuthor),"config.ini")
