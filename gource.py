#A quick cross platform script to create a gource visualisation of the git repository.
#example: https://www.youtube.com/watch?v=zRjTyRly5WA
#To run it you will need to download and install gource
#Get it from here: https://code.google.com/p/gource/
import os
os.system('gource --auto-skip-seconds 1 --file-idle-time 0 --key --title "Password Primate Development"')
