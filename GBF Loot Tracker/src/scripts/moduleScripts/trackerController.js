import { trackerInstance } from './trackerInstance.js';
import { stageSelectorBuilder, lootBoxBuilder } from './builder.js';
import config from './config.js';
import storageManager from './storageManager.js';

class trackerController {
    /** @type {trackerInstance[]} */
    trackers = [];
    /** @type {trackerInstance} */
    unlockedTracker = undefined
    dataPeriod = undefined;
    timerStart = 0;
    /** @type {ControllerElements} */
    elements = {
        controllerHead: undefined,
        addTrackerButton: undefined,
        removeTrackerButton: undefined,
        clearTrackersButton: undefined,
        controllerBody: undefined,
        backgroundShadow: undefined,
        stageSelectMenu: undefined,
        stageSelectGroups: undefined,
        dataPeriodButton: undefined,
        dataPeriodText: undefined,
        dataPeriodSelector: undefined,
        timerText: undefined,
        resetTimerButton: undefined,
        lastDrop: undefined,
        lastDropName: undefined,
        lastDropItemsContainer: undefined,
        lastDropItems: undefined,
    }
    timerInterval = null;
    // lastDrop = {
    //     scrollAmount: 0,
    //     scrollDirection: 1,
    //     scrollScalar: 0.5,
    // }
    
    constructor() {
        this.init();
    }

    async init(){
        await storageManager.init();
        this.initializeController();
        this.loadInitialStages();
        console.log("Tracker Controller has been started");
    }

    /**
     * Links all HTML elements that are referenced by the controller and adds required event listeners to those elements
     */
    initializeController(){
        this.elements.controllerHead = document.getElementById("trackerControllerHead");
        this.elements.addTrackerButton = document.getElementById("addTrackerButton");
        this.elements.removeTrackerButton = document.getElementById("removeTrackerButton");
        this.elements.clearTrackersButton = document.getElementById("clearTrackersButton");
        this.elements.controllerBody = document.getElementById("trackerControllerBody");
        this.elements.backgroundShadow = document.getElementById("bg");
        this.elements.dataPeriodButton = document.getElementById("dataPeriodButton");
        this.elements.dataPeriodText = document.getElementById("dataPeriodText");
        this.elements.dataPeriodSelector = document.getElementById("dataPeriodSelector");
        this.elements.timerText = document.getElementById("timer");
        this.elements.resetTimerButton = document.getElementById("periodResetTimerButton");
        this.elements.lastDrop = document.getElementById("trackerLastDrop");
        this.elements.lastDropName = document.getElementById("trackerLastDropName");
        this.elements.lastDropItemsContainer = document.getElementById("c-trackerLastDropItems");
        this.elements.lastDropItems = document.getElementById("trackerLastDropItems");

        this.elements.addTrackerButton.addEventListener("click", () => this.showStageSelector(true));
        this.elements.removeTrackerButton.addEventListener("click", () => this.showStageDeselector(true));
        this.elements.clearTrackersButton.addEventListener("click", () => this.clearTrackers());
        this.elements.dataPeriodButton.addEventListener("click", () => this.showDataPeriodSelector(true));
        this.elements.backgroundShadow.addEventListener("click", () => this.closeAllMenus());
        this.elements.resetTimerButton.addEventListener("click", () => this.resetTimer());

        // Adds event listeners to data period selector buttons
        var dataPeriodSelectorButtons = this.elements.dataPeriodSelector.getElementsByClassName("period-selector-button");
        for (let element of dataPeriodSelectorButtons){
            element.addEventListener("click", (e) => {this.selectDataPeriod(e.target)});
        }

        window.addEventListener("NewStageClear", (e) => {this.newDrop(e)});

        this.elements.stageSelectMenu = stageSelectorBuilder.newStageSelector(config, storageManager.eventList);
        this.elements.stageSelectGroups = this.elements.stageSelectMenu.getElementsByClassName("stage-selector-group");
        // console.log(this.elements.stageSelectMenu);
        let stageSelectElement = document.querySelector(".stage-selector");
        stageSelectElement.replaceWith(this.elements.stageSelectMenu);

        // Adds event listeners to the stage selector menu elements
        let tabButtons = this.elements.stageSelectMenu.getElementsByClassName("stage-selector-tab-button");
        for (let tabButton of tabButtons){
            tabButton.addEventListener("click", () => {this.switchTab(tabButton.dataset.selection)});
        }

        let stageSelectButtons = this.elements.stageSelectMenu.getElementsByClassName("stage-selector-button");
        for (let stageSelectButton of stageSelectButtons){
            stageSelectButton.addEventListener("click", () => {this.selectStage(stageSelectButton.dataset.selection)});
        }

        let stageSelectSearchbox = this.elements.stageSelectMenu.querySelector(".stage-selector-searchbox");
        stageSelectSearchbox.addEventListener("input", () => {this.updateDisplayedStages(stageSelectSearchbox.value)});
        // Switches the stage selector to the raids tabs
        this.switchTab("Raids");
        // Adds the autoscrolling functionality to the lastDrop item box
        this.scrollLastDrop();
    }

    /**
     * Fetches the last known tracked stages and adds them to the controller
     */
    async loadInitialStages(){
        this.dataPeriod = storageManager.settings.dataPeriod;
        this.timerStart = storageManager.settings.timerStart;
        this.timerInterval = setInterval(this.updateTimer.bind(this), 1000);
        this.elements.dataPeriodText.innerHTML = config.dataPeriods[this.dataPeriod];
        var targetButtonClass = ".period-" + this.dataPeriod;
        var targetButton = this.elements.dataPeriodSelector.querySelector(targetButtonClass);
        targetButton.classList.add("period-selected-button");
        let initialStages = storageManager.settings.selectedBoss;
        for (let index in initialStages){
            this.addTracker(initialStages[index].stage);
        }
    }

    /**
     * Switches the tab in the Stage Selector menu
     * @param {string} tabName Switches to the tab that matches this string
     */
    switchTab(tabName){
        // Hides all groups except for the one who's tab was clicked
        for (let stageSelectGroup of this.elements.stageSelectGroups){
            stageSelectGroup.style.display = "none";
            if (stageSelectGroup.dataset.groupid == tabName){
                stageSelectGroup.style.display = "flex";
            }
        }
    }

    /**
     * Itterates through the stage selection menu elements to hide and show stages if they match the search string
     * @param {string} searchString String used to filter stages that match it
     */
    updateDisplayedStages(searchString){
        searchString = searchString.toLowerCase(); // Not case sensitive
        const groups = this.elements.stageSelectGroups;
        const numStageGroups = groups.length;
        // Itterates through each group of stages
        for (let groupIndex = 0; groupIndex < numStageGroups; groupIndex++) {
            let groupIsHidden = true; // If no stages in this group match the searchString, the group will be hidden
            let groupIsMatched = false; // If a group title matches search string, shows all items in that group
            let group = this.elements.stageSelectGroups[groupIndex];

            let groupName = group.dataset.groupid.toLowerCase();
            if (groupName.includes(searchString) 
                || (group.hasAttribute("data-alius") && group.dataset.alius.includes(searchString)))
                {groupIsMatched = true;}

            let subgroups = group.childNodes;
            // Itterates through the subgroups of a group
            for (let subgroupIndex = 1; subgroupIndex < subgroups.length; subgroupIndex++){
                let subgroupIsHidden = true; // If no stages in this subgroup match, the subgroup will be hidden
                let subgroup = subgroups[subgroupIndex];

                let subgroupIsMatched = groupIsMatched;
                let subgroupName = subgroup.dataset.subgroupid.toLowerCase();
                if (subgroupName.includes(searchString) || (subgroup.hasAttribute("data-alius") && subgroup.dataset.alius.includes(searchString)))
                    {subgroupIsMatched = true;}

                let stages = subgroup.childNodes;
                // Itterates through the stages of a subgroup
                for (let stageIndex = 1; stageIndex < stages.length; stageIndex++){
                    let stage = stages[stageIndex];
                    let stageName = stage.dataset.selection.toLowerCase();
                    if (stageName.includes(searchString) || subgroupIsMatched || (stage.hasAttribute("data-alius") && stage.dataset.alius.includes(searchString))){
                        stage.style.display = "block";
                        subgroupIsHidden = false;
                    }
                    else {stage.style.display = "none";}
                }
                // Hides or shows subgroup depending on if a matching element is within
                if (subgroupIsHidden){
                    subgroup.style.display = "none";
                }
                else{
                    subgroup.style.display = "flex"
                    groupIsHidden = false;
                }
            }
            // Hides or shows group depending on if a matching element is within
            if (groupIsHidden){
                group.style.display = "none";
            }
            else{group.style.display = "flex";}
        }
    }

    /**
     * Processes a selection from the Stage Selector menu
     * @param {string} stageName Contains the name of the stage selected
     */
    selectStage(stageName){
        for (let tracker of this.trackers){
            if (tracker.settings.selectedStage == stageName){
                console.log(stageName + " was already selected...");
                return;
            }
        }
        this.addTracker(stageName);
        storageManager.updateViewedStages(stageName);
    }

    /**
     * Opens or closes the stage selector menu
     * @param {boolean} willShow true opens menu and false closes menu
     */
    showStageSelector(willShow){
        switch (willShow){
            case true:
                this.elements.backgroundShadow.style.display = "block";
                this.elements.backgroundShadow.style.zIndex = "3";
                this.elements.stageSelectMenu.style.display = "flex";

                // Allows the user to type into the searchbox when the stage selector is opened
                let stageSelectSearchbox = this.elements.stageSelectMenu.querySelector(".stage-selector-searchbox");
                stageSelectSearchbox.focus();
                break;
            case false:
                this.elements.backgroundShadow.style.display = "none";
                this.elements.stageSelectMenu.style.display = "none";
                break;
            default:
                console.log("Error: Invalid state given to showStageSelector. Expected true or false. Instead recieved: ", willShow);
        }
    }

    selectDataPeriod(element){
        if (element.dataset.period == this.dataPeriod){return};
        // First, unselects any selected buttons
        var selectedButton = this.elements.dataPeriodSelector.querySelector(".period-selected-button");
        selectedButton.classList.remove("period-selected-button");
        // Adds selected class to clicked element
        element.classList.add("period-selected-button");
        this.dataPeriod = element.dataset.period;
        storageManager.updateSettings("dataPeriod", this.dataPeriod);
        this.elements.dataPeriodText.innerHTML = config.dataPeriods[this.dataPeriod]; 
        this.refreshAllLoot();
    }

    // restarts the timer
    resetTimer(){
        let newTime = Date.now();
        storageManager.updateSettings("timerStart", newTime);
        this.timerStart = newTime;
    }

    // Updates the timer once a second when active
    updateTimer(){
        let deltaTime = Date.now() - this.timerStart;
        let seconds = Math.floor(deltaTime/1000) % 60;
        let minutes = Math.floor(deltaTime/60000) % 60;
        let hours = Math.floor(deltaTime/3600000) % 24;
        let days = Math.floor(deltaTime/86400000);
        let displayArr = [days, hours, minutes, seconds];
        let startDisplay = false;
        let display = "";
        for (let i in displayArr){
        if (displayArr[i] != 0 || startDisplay){
            // Add leading 0
            if (i != 0 && displayArr[i] < 10 && startDisplay == true){display += "0"}
            display += displayArr[i] + ":"
            startDisplay = true;
        }
        }
        display = display.slice(0,-1);
        this.elements.timerText.innerHTML = display;
  }

    async refreshAllLoot(){
        for (let tracker of this.trackers){
            let stageData = await storageManager.fetchStageData(tracker.settings.selectedStage);
            stageData = stageData[this.dataPeriod];
            tracker.setLoot(stageData);
        }
        if (this.unlockedTracker != undefined){
            let stageData = await storageManager.fetchStageData(this.unlockedTracker.settings.selectedStage);
            stageData = stageData[this.dataPeriod];
            this.unlockedTracker.setLoot(stageData);
        }
    }

    showDataPeriodSelector(willShow){
        switch(willShow){
            case true:
                this.elements.backgroundShadow.style.display = "block";
                this.elements.backgroundShadow.style.zIndex = "3";
                this.elements.dataPeriodSelector.style.display = "flex";
                break;
            case false:
                this.elements.backgroundShadow.style.display = "none";
                this.elements.dataPeriodSelector.style.display = "none";
                break;
            default:
                console.log("Error: Invalid state given to showDataPeriodSelector. Expected true or false. Instead recieved: ", willShow);
        }
    }

    /**
     * Enters or leaves stage deselector mode
     * @param {boolean} willShow defines if stage deselecter mode is opened or closed
     */
    showStageDeselector(willShow){
        switch (willShow){
            case true:
                this.elements.backgroundShadow.style.display = "block";
                this.elements.backgroundShadow.style.zIndex = "1";
                Array.from(this.trackers, (tracker) => {
                    // console.log(tracker, tracker.elements.trackerRemoveClickbox);
                    // enables clickbox and adds event listeners
                    tracker.elements.trackerRemoveClickbox.style.display = "block";
                    tracker.elements.trackerRemoveClickbox.addEventListener("click", () => this.removeTracker(tracker));
                });
                if (this.unlockedTracker != undefined){ // Deals with the case of a free tracker
                    let freeTracker = this.unlockedTracker;
                    freeTracker.elements.trackerRemoveClickbox.style.display = "block";
                    freeTracker.elements.trackerRemoveClickbox.addEventListener("click", () => this.removeFreeTracker(freeTracker));
                }
                break;
            case false:
                this.elements.backgroundShadow.style.display = "none";
                Array.from(this.trackers, (tracker) => {
                    // Removes event listeners on the clickbox and disables it
                    tracker.elements.trackerRemoveClickbox.style.display = "none";
                    let oldElement = tracker.elements.trackerRemoveClickbox;
                    let newElement = oldElement.cloneNode(true);
                    //console.log(oldElement, newElement, oldElement.parentNode);
                    oldElement.parentNode.replaceChild(newElement, oldElement);
                    tracker.elements.trackerRemoveClickbox = newElement;
                });
                if (this.unlockedTracker != undefined){ // Deals with the case of a free tracker
                    let freeTracker = this.unlockedTracker;
                    // Removes event listeners on the clickbox and disables it
                    freeTracker.elements.trackerRemoveClickbox.style.display = "none";
                    let oldElement = freeTracker.elements.trackerRemoveClickbox;
                    let newElement = oldElement.cloneNode(true);
                    //console.log(oldElement, newElement, oldElement.parentNode);
                    oldElement.parentNode.replaceChild(newElement, oldElement);
                    freeTracker.elements.trackerRemoveClickbox = newElement;
                }
                break;
            default:
                console.log("Error: Invalid state given to showStageDeselector. Expected true or false. Instead recieved: ", willShow);
        }
    }

    closeAllMenus(){
        if (this.elements.stageSelectMenu.style.display != "none"){this.showStageSelector(false);}
        if (this.elements.backgroundShadow.style.display != "none"){this.showStageDeselector(false);}
        if (this.elements.dataPeriodSelector.style.display != "none"){this.showDataPeriodSelector(false);}
    }

    /**
     * Creates and adds a tracker for the stage "stageName"
     * @param {string} stageName Name of the stage to be added
     * @param {TableData} [stageData = undefined] Optional table data for the stage. If not provided, will be retrieved from local storage
     * @param {boolean} [isStageLocked = true] **Default = true**\
     * If the stage is locked or not.\
     * If set to false, the tracker will be placed in this.unlockedTracker instead of pushed to this.trackers
     */
    async addTracker(stageName, stageData = undefined, isStageLocked = true){
        let stageInfo = config.getStageInfo(stageName);
        if (stageInfo == undefined){ // could be an event stage
            let trackerType = storageManager.checkEventType(stageName);
            console.log(`trackerType for event stage: ${trackerType}`);
            if (trackerType == undefined){console.log(stageName + " is not a valid stage..."); return;}
            stageInfo = {"type": trackerType}
            console.log("StageInfo:",stageInfo);
        }
        if (!stageInfo.hasOwnProperty("type")){stageInfo.type = "0";}
        // Fetches stageData if it was not passed as a param
        if (stageData == undefined){
            stageData = await storageManager.fetchStageData(stageName);
            if (stageName == "Xeno Militis Boxes"){console.log(stageData)}
            if (stageData == undefined){
                console.log("No recorded data for " + stageName + ". Using default stage data to build...");
                stageData = config.defaultStageDataRow;
            }
            else {stageData = stageData[this.dataPeriod];}
        }
        else {stageData = stageData[this.dataPeriod];}

        console.log("Tracking data for the stage: " + stageName);
        let newTracker = new trackerInstance(stageName, stageData, stageInfo.type);
        this.elements.controllerBody.appendChild(newTracker.getTracker());
        if (isStageLocked){
            this.trackers.push(newTracker);
            this.showStageSelector(false);
        }
        else {
            this.unlockedTracker = newTracker;
        }
        if (this.unlockedTracker == undefined || !isStageLocked) {return;} // Only continues if the unlocked tracker needs to be moved to the end of the controller
        if (this.unlockedTracker.settings.selectedStage == stageName){// If stage selected was the same as the unlocked stage, deletes unlocked stage
            this.removeFreeTracker();
            return;
        } 
        let freeTrackerElement = this.unlockedTracker.getTracker();
        freeTrackerElement.parentNode.appendChild(freeTrackerElement);
    }

    /**
     * Removes the trackerInstance in "tracker" from the controller so that the tracker is no longer shown
     * @param {trackerInstance} tracker
     */
    removeTracker(tracker){
        storageManager.updateViewedStages(tracker.settings.selectedStage, false);
        let element = tracker.getTracker();
        let index = this.trackers.indexOf(tracker);
        element.remove(); // Deletes the DOM object
        this.trackers.splice(index, 1); // Removes the tracker from the array of trackers
        console.log("Removed tracker successfully");
    }

    removeFreeTracker(){
        if (this.unlockedTracker == undefined){
            console.log("Error: Attempted to remove a free tracker but no such tracker exists...")
            return;
        }
        let currentFreeTracker = this.unlockedTracker.getTracker();
        currentFreeTracker.remove();
    }

    /**
     * Removes all trackers from the controller and clears active trackers from storage
     */
    clearTrackers(){
        this.elements.controllerBody.innerHTML = "";
        this.trackers = [];
        storageManager.updateSettings("selectedBoss", []);
        console.log("All active trackers cleared!");
    }

    scrollLastDrop(){
        const itemsContainer = this.elements.lastDropItemsContainer;
        const itemsContent = this.elements.lastDropItems;
        let scrollAmount = config.autoScrollValues.scrollAmount;
        let scrollDirection = config.autoScrollValues.scrollDirection;
        const scrollScalar = config.autoScrollValues.scrollScalar;
        const pauseDuration = 5000;
        function scrollContent(){
            const maxScroll = itemsContent.scrollWidth - itemsContainer.clientWidth;
            scrollAmount += scrollDirection * scrollScalar;
            if (scrollAmount >= maxScroll || scrollAmount <= 0){
                scrollDirection *= -1;
                setTimeout(() => { // Pauses scrolling before switching directions
                    requestAnimationFrame(scrollContent);
                }, pauseDuration);
                return;
            }
            itemsContainer.scrollLeft = scrollAmount;
            requestAnimationFrame(scrollContent);
        }
        scrollContent();
    }

    /**
     * Processes a new stage drop event when detected
     * @param {JSON} e event for the new 
     */
    newDrop(e){
        console.log("New drop was detected: ", e);
        /** @type {string} */
        let stageName = e.detail.stageName;
        /** @type {TableData} */
        let stageData = e.detail.stageData;

        // Sets last drop if it is enabled
        if (storageManager.settings.useLastDrop){ // Grabs last stageData row and adds it to the lastDrop section
            // console.log("useLastDrop in settings was true, adding last drop to tracker controller");
            this.elements.lastDrop.style.display = "flex";
            this.elements.lastDropName.innerHTML = stageName;
            let lastDrop = stageData[stageData.length - 1];
            let itemList = lastDrop.itemList;
            this.elements.lastDropItems.innerHTML = "";
            // console.log("Cleared lastDropItems and is now adding itemList: ", itemList)
            for (let item in itemList){
                this.elements.lastDropItems.appendChild(lootBoxBuilder.buildLootBox(item, itemList[item], config.getFullLootUrl(item)))
            }
        }

        for (let tracker of this.trackers){
            if (stageName != tracker.settings.selectedStage){continue;}
            tracker.setLoot(stageData[this.dataPeriod]);
            return;
        }

        if (!storageManager.settings.useUnlockedStage){return;}
        /** No unlocked tracker was built yet */
        if (this.unlockedTracker == undefined){ 
            this.addTracker(stageName, stageData, false);
        }
        /** Unlocked tracker is built but it is for a different stage */
        else if (this.unlockedTracker.settings.selectedStage != stageName){
            this.removeFreeTracker();
            this.addTracker(stageName, stageData, false);
        }
        /** Unlocked tracker is built and it is tracking the newDrop */
        else {
            this.unlockedTracker.setLoot(stageData[this.dataPeriod]);
        }
    }
}

let instance = new trackerController();