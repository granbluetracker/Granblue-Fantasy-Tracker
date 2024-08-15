# Granblue Fantasy Loot Tracker
## Table of contents
[Intro](#intro)\
[New with latest release](#new-with-latest-release)\
[Notice](#notice)\
[Installation](#installation)\
[How to update](#how-to-update)\
[Removing the ("GBF Loot Tracker" started debugging this browser) notification](#removing-the-gbf-loot-tracker-started-debugging-this-browser-notification)\
[How does the extension work?](#how-does-the-extension-work)\
[Privacy Policy](#privacy-policy)\
[Contact me](#how-to-report-a-bug-ask-a-question-or-suggest-a-change)

# Intro
This is an extension that can automatically track the loot you obtain while playing Granblue Fantasy. 

This extension runs within an isolated world in chrome and does not interact with the game in any way. This means that it is safe to use and impossible to detect by the game. This is done by using the chrome debugger library to scan traffic coming from the game and reading a copy of this data if it may contain information about loot obtained. This copy is provided by the browser and there is no way for the game to see it happening.

This extension is also open source so anyone can look inside and see exactly how it works.

# How to use it
This extension works in the background and is always active, so you don't have to turn anything on, or click a start tracking button. To view your tracked loot, simply wait for a drop to be obtained, or click the "Add Tracker" button and select which stage you want to see your tracked loot for

# New with latest major release
With version 1.1.0, the extension was completely rewritten. With the rewrite, many things were changed and added. This rewrite will make it a lot easier to develop for, as well as eliminate the possibility of several bugs occurring. Here is an example of some of the changes made!

### New User Interface

![user interface](https://github.com/granbluetracker/Granblue-Fantasy-Tracker/blob/main/README_IMG/UserInterface.PNG)\
With the new UI, it is now possible to track many stages at the same time. No longer do you need to switch between several stages to keep on top of your drops.

You can also now track the number of extra chests you get as drops. These would include the sky blue chests obtained from Magna 3 enemies, as well as the purple chests from extra drops events. This update also expands the number of enemies that the extension can detect.

![stage select interface](https://github.com/granbluetracker/Granblue-Fantasy-Tracker/blob/main/README_IMG/stageSelectInterface.PNG)\
With the new update came a new stage selector. Each stage is displayed along with any special loot you may obtain from it. There is also now a search bar you can use to find the stage even faster. The search bar can filter stages by name, alias, element, or special drop. Stages are grouped into tabs that should make it easier to find what you are looking for. 

![data period UI](https://github.com/granbluetracker/Granblue-Fantasy-Tracker/blob/main/README_IMG/dataPeriodUI.PNG)\
You can use a data period filter to only see drops that occurred within a period of time. With this, you can choose when the data you want to see is from.

![settings](https://github.com/granbluetracker/Granblue-Fantasy-Tracker/blob/main/README_IMG/settings.PNG)\
Update 1.1.0 also added a settings page where you can change some of the settings for the extension. This is also where you can import and export data from the extension if you choose to back up your data.

# Installation

1) download "GBF Loot Tracker.zip" and unpack it in a location of your choice.
2) In your chrome browser, visit "chrome://extensions/" and enable developer mode.
3) Drag the "GBF Loot Tracker" folder that you unpacked onto the tab that has "chrome://extensions/" open which will automatically install it
4) Enjoy using the extension!

![installation gif](https://github.com/granbluetracker/Granblue-Fantasy-Tracker/blob/main/README_IMG/Install.gif?raw=true)

# How to update
You have 2 options for updating the extension. You can either use the updater tool or replace the files manually. With version 1.1.0, a GUI tool was added to make updating easier
### 1. Using the "GBFLootTrackerUpdater.exe" tool
![updater](https://github.com/granbluetracker/Granblue-Fantasy-Tracker/blob/main/README_IMG/Updater.PNG)\
1. [Download the LootTrackerUpdater.exe app from the updater Github repository here.](https://github.com/granbluetracker/Granblue-Fantasy-Tracker-Updater/releases/latest)
2. Run the application and select the manifest.json file that is in the extension folder. This should be in the same place where you installed the extension from. If you can't find the file, you can check it's location by:
-   Navigating to chrome://extensions/
-   Clicking on the "Details" button below the GBF Loot Tracker extension
-   Scrolling down on the page until you see the section labeled "Source"
-   Clicking the file path after "Loaded from:" will open the folder with the manifest.json file
3. Select the version you would like to install. This will be the latest version by default.
4. Clicking the update button.
5. Navigating to chrome://extensions/ and clicking the reload button on the bottom left of the GBF Loot Tracker extension.

The "LootTrackerUpdater.exe" program is written in C# (using net8.0-windows and wpf). You can see the source code for this in the repository if you're curious. The program doesn't need to be installed and should just work. 

The command line program and python script that does this is no longer supported as that was just a band aid solution until the GUI application was created.
### 2. Replacing the files manually
1. Download the version you would like to change to
2. Place the zipped file in the same directory that holds the "GBF Loot Tracker" folder, so they are beside each other
3. Extract the zipped file and select replace all files with the same name
4. Visit "chrome://extensions/" and click the refresh icon below the extension
5. (Optional) Delete the zipped file as it isn't needed anymore

![Manual update gif](https://github.com/granbluetracker/Granblue-Fantasy-Tracker/blob/main/README_IMG/UpdateManual.gif?raw=true)

# Removing the ("GBF Loot Tracker" started debugging this browser) notification
![debug notification banner](https://github.com/granbluetracker/Granblue-Fantasy-Tracker/blob/main/README_IMG/Banner.png?raw=true)\
As a security measure, Chrome will display this banner whenever an extension uses the debugger library. This extension uses this library to read data sent to your game whenever it sees you at the URL of a battle results page. To disable it, do the following:
1) Right click your Google Chrome icon on your home screen and select "Properties"
2) Click on the "Shortcut" tab
3) Click on the "Target" field and add the flag "--silent-debugger-extension-api" after the location of the .exe file. Do not copy the quotes.
4) Click on "Apply" at the bottom and close all active tabs
After you do this, you should no longer see any notifications.

![Adding silent debug flag png](https://github.com/granbluetracker/Granblue-Fantasy-Tracker/blob/main/README_IMG/DisableBanner.png?raw=true)

# How does the extension work
The extension runs in the background as you use chrome by using a service worker script. This script checks traffic coming from game.granbluefantasy.jp for any files that have a url that could contain loot data. The extension uses the chrome debugger library to read a copy of this data and see if it contains any loot data.

If loot data is found, the extension extracts it and stores the data locally in a table. When you look at the loot you obtained, this is the table that is read from.

This all happens in a separate context than what the game runs in. This means that we cannot directly inspect the memory of the game. The downside of this is that it requires a lot more code to interpret information about loot obtained from the game. The upside though, is that it becomes impossible for the game to detect you using this extension. 

# Privacy Policy
The extension will never collect any data about the user beyond what is required to make this extension function. This extension does not collect or report any analytics about the data collected by the extension.

The only data collected by the extension are stage clears. When you clear a stage in Granblue Fantasy, information about the event such as the time it occured, what items were obtained, and the types of chests obtained (red/blue/purple). This data is stored in local storage and will never be sent remotely.

The only remote connection made by the extension is a simple GET request to this github page. The purpose of this is so the extension can see if a new version was released, and display that information to you. There is no way for me to see any information about this request.

# How to report a bug, ask a question, or suggest a change
Please send all of that to granbluetracker@gmail.com and I should see it. I'm always happy to answer any questions and respond to any feedback/suggestions. I hope you enjoy the extension!

