# Granblue-Fantasy-Tracker
This is an extension that can automatically track the loot you receive from raids. 

This extension does not interact directly with the game so it won't be detected. Use of third party tools is still against the terms of service so use at your own risk. This extension will always run in the background and capture data whenever you visit a results page. You will never have to manually track your drops again!

# Notice

With yesterday's update, the reward data is sometimes loaded before the extension can capture it which means it only works sometimes. An update will soon be comming to fix this issue so please bear with me while I fix this. Stay tuned for version 1.0.2!

# Installation

1) download "GBF Loot Tracker.zip" and unpack it in a location of your choice.
2) In your chrome browser, visit "chrome://extensions/" and enable developer mode.
3) Drag the "GBF Loot Tracker" folder that you unpacked onto the tab that has "chrome://extensions/" open which will automatically install it
4) Enjoy using the extension!

# How to update

Simply drag the contents of the folder extracted from the updated version into the folder you are storing the extension and click replace all. Go to "chrome://extensions/" and click the refresh button on the extension to reload it.

# Removing the ("GBF Loot Tracker" started debugging this browser) notification
As a security measure, chrome will display this banner whenever an extension uses the debugger library. This extension uses this library to read data sent to your game whenever it sees you at the URL of a battle results page. To disable it, do the following:
1) Right click your Google Chrome icon on your home screen and select "Properties"
2) Click on the "Shortcut" tab
3) Click on the "Target" field and add the flag "--silent-debugger-extension-api" after the location of the .exe file. Do not copy the quotes.
4) Click on "Apply" at the bottom and close all active tabs
After you do this, you should no longer see any notifications.

# How to report a bug, ask a question, or suggest a change
Please send all of that to granbluetracker@gmail.com and I should see it. I hope you enjoy the extension.

# How does the extension work
I included information on how the extension works in the design.html page of the extension. I recommend reading this as well as the help.html page if you are curious.
