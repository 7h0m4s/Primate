RMDIR /S /Q dist\
RMDIR /S /Q build\
python exeSetup.py py2exe
pause
XCOPY static dist\static\ /E
COPY BrowseDialog.exe dist\BrowseDialog.exe
COPY SaveFileDialog.exe dist\SaveFileDialog.exe
ren dist\server.exe PasswordPrimate.exe
pause