RMDIR /S /Q dist\
RMDIR /S /Q build\
python exeSetup.py py2exe
pause
XCOPY static dist\static\ /E
ren dist\server.exe PasswordPrimate.exe
pause