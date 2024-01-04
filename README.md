# Granblue-Fantasy-Tracker
## Table of contents
[Intro](#intro)\
[New with latest release](#new-with-latest-release)\
[Notice](#notice)\
[Installation](#installation)\
[How to update](#how-to-update)\
[Removing the ("GBF Loot Tracker" started debugging this browser) notification](#removing-the-gbf-loot-tracker-started-debugging-this-browser-notification)\
[How does the extension work?](#how-does-the-extension-work)


# Intro
This is an extension that can automatically track the loot you receive from raids. 

This extension does not interact directly with the game, so it won't be detected. Use of third-party tools is still against the terms of service so use at your own risk. This extension will always run in the background and track any loot you receive. You will never have to manually track your drops again!

# How to use it
This extension works in the background and is always active, so you don't have to turn anything on or click a start tracking button. To view your tracked loot, navigate to the module.html page, click the gear icon in the top right of the module, and select the boss you want to see stats of from the dropdown. It is that simple!

# New with latest release
It is time to start tracking your Arcarum Sandbox progress! With release 1.0.5, it is now possible to track your Sandbox loot, Sandbox enemy kills, and Replicard Box drops + contents! You may notice the addition of several new enemies on the enemy dropdown:\
![sandbox enemies](https://github.com/granbluetracker/Granblue-Fantasy-Tracker/blob/main/README_IMG/SephiraEnemiesRaidlist.png?raw=true)\

There is now a new tracker for each sandbox goal you would go for. Viewing your Sephira Box stats are easy! Simply click on the gold bar on the top left of the module to open the Loot Settings Menu, and click the Sephira Box Button.

![sandbox enemies](https://github.com/granbluetracker/Granblue-Fantasy-Tracker/blob/main/README_IMG/SephiraStats1.png?raw=true)\
![sandbox enemies](https://github.com/granbluetracker/Granblue-Fantasy-Tracker/blob/main/README_IMG/SephiraStats2.png?raw=true)\
![sandbox enemies](https://github.com/granbluetracker/Granblue-Fantasy-Tracker/blob/main/README_IMG/SephiraData.png?raw=true)\
Now you can see every Sephira box you received, as well as every piece of loot that dropped from a box

# Installation

1) download "GBF Loot Tracker.zip" and unpack it in a location of your choice.
2) In your chrome browser, visit "chrome://extensions/" and enable developer mode.
3) Drag the "GBF Loot Tracker" folder that you unpacked onto the tab that has "chrome://extensions/" open which will automatically install it
4) Enjoy using the extension!

![installation gif](https://github.com/granbluetracker/Granblue-Fantasy-Tracker/blob/main/README_IMG/Install.gif?raw=true)

# How to update
You have 2 options for updating the extension. You can either use the updater tool or replace the files manually.
### 1. Using the "GBFLootTrackerUpdater.exe" tool
1. Download GBFLootTrackerUpdater.exe from the repository
2. Place GBFLootTrackerUpdater.exe in the folder holding the "GBF Loot Tracker" folder. (Make sure you don't put the updater inside the "GBF Loot Tracker" folder, but beside it)
3. Run "GBFLootTrackerUpdater.exe" and enter "yes" when prompted to begin the upgrade.

The "GBFLootTrackerUpdater.exe" is written in C# (using .NET 8.0). You can see the source code for this in the repository if you're curious. I also included a python script that does the same thing. I may create a GUI based updater in the future to replace this one so be sure to look out for that.
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
The extension runs in the background as you use chrome by using a service worker script. It works by capturing data in 3 distinct stages:

[1. Detect when a tab is playing Granblue Fantasy](#detect-when-a-tab-is-playing-granblue-fantasy)\
[2. Capture any data containing loot that was dropped in the game](#capture-any-data-containing-loot-that-was-dropped-in-the-game)\
[3. Process the captured data in a format that is easy to read and display](#process-the-captured-data-in-a-format-that-is-easy-to-read-and-display)

### Detect when a tab is playing Granblue Fantasy
This is the easiest stage. When a tab visits a new URL, an event listener in the extension sees it. If the game visits Granblue Fantasy, a debugger is attached and network events are activated, allowing the extension to see chrome's communications with the Cygames servers. When a chrome tab has a debugger attached and visits a URL other than Granblue Fantasy, that debugger is removed which stops the extension from seeing any network traffic from that tab.

### Capture any data containing loot that was dropped in the game
A useful feature with debuggers are that they allow you to communicate with Chrome tabs out of the view of any websites you are on. This is perfect if you want to capture data from Granblue Fantasy without the game detecting it. The only way that Granblue Fantasy can detect that an extension is active on the page is if that extension changes elements on it, such as adding an extra menu to the game. Because the loot tracker doesn't do this, it won't be detected by the game.

When the Granblue Fantasy servers send Chrome information about the game, the debugger relays this same information to the extension. If the Granblue Fantasy servers send Chrome a file with a source URL starting with: [https://game.granbluefantasy.jp/resultmulti/content/index/###########], it means that that file contained the results of a battle. The extension records the requestId associated with that file download and waits for a Network.loadingFinished event that matches the recorded requestId. 

When the extension sees that the download finished, it asks Chrome to give a copy of the contents of that request to the extension. The game will never see this since Chrome is asked for the version it has stored locally, not the game servers.

### Process the captured data in a format that is easy to read and display
When the extension captures new data, it goes through several processing steps to make it usable by other parts of the extension. For this example, lets look at what happens to the results of a fight against Seofon. When you kill him, the extension captures this json file containing the results. The file is first converted into json format so that it can be read more easily.\
![Response Body](https://github.com/granbluetracker/Granblue-Fantasy-Tracker/blob/main/README_IMG/ResponseBody.png?raw=true)\
The display_list holds the info about the loot you have favorited and are displaying at the bottom of your screen. The info we need is located under option.result_data. The extension then discards any data that isn't under option.result_data which leaves us with this:\
![result data](https://github.com/granbluetracker/Granblue-Fantasy-Tracker/blob/main/README_IMG/OptionResult.png?raw=true)\
The important data here is quest type (A quest type of "1" means that this result data is from a raid) and the data under rewards.reward_list. This is where you find the info about which items dropped and how many. In our case, we received these items:\
![reward list](https://github.com/granbluetracker/Granblue-Fantasy-Tracker/blob/main/README_IMG/RewardList.png?raw=true)\
Any drops that are stored under number 3 are contained in gold chests. Drops under number 4 are contained in blue chests. Drops under number 11 are contained in red chests which can either be an MVP chest, Vice MVP chest, or Host chest. If you look at the drops from the game, you can see this holds true.\
![loot collected](https://github.com/granbluetracker/Granblue-Fantasy-Tracker/blob/main/README_IMG/LootCollected.png?raw=true)\
The item IDs, quantity, and number of each type of chest are extracted and used to create a new json which looks like this:\
![table row](https://github.com/granbluetracker/Granblue-Fantasy-Tracker/blob/main/README_IMG/tableRow.png?raw=true)\
epochTime is the time when the drop occurred, this allows us to view only loot we received during a certain period, like the last day/week/month. The item list is then used with the battle type (1) to determine which battle this data came from. Unfortunately, the game doesn't store where the loot came from, only the loot you received. Because the battle type is 1, we know that this is from a raid, so we compare the loot against all known raid bosses. We see that the reward list contains (ID: 589) which is the item "Remnants of the Star-Sea's Edge". This item can only be obtained from the raid "Seofon", so we now know which enemy dropped the loot. The json we made in the last step is then stored in Seofon's loot table which can be read by the json whenever we want to see our loot from Seofon. 

# How to report a bug, ask a question, or suggest a change
Please send all of that to granbluetracker@gmail.com and I should see it. I'm always happy to answer any questions and respond to any feedback/suggestions. I hope you enjoy the extension!