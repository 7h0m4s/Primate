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
