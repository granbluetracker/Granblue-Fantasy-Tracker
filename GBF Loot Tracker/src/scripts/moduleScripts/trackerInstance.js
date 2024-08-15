import config from './config.js';
import '../types/typedefs.js'
import {trackerInstanceBuilder, lootBoxBuilder} from './builder.js';


class trackerInstance{
    // Stores info about the tracker instance
    /** @type {trackerSettings} */
    settings;
    /** @type {trackerElements} */
    elements;
    /** Animation that plays on an item box when it is updated */
    newItemAnimation = undefined;
    /**
     * Constructs a new tracker instance
     * @param {string} selectedStage The name of the data being tracked
     * @param {string} periodString 
     * @param {TableEntry} lootData Stage data header row for the data period being tracked
     * @param {string} stageType The id for the type of tracker.
     * - 0 => Standard Raid,
     * - 1 => Sephira Boxes, 
     * - 2 => Xeno Boxes
     * - ... 
     * @returns 
     */
    constructor(selectedStage, lootData, stageType = "0") {
        console.log("Building tracker with params: selectedStage: " + selectedStage + " stageType: " + stageType + " lootData: ", lootData);
        /** @type {trackerSettings} */
        var settings = {};
        settings.stageType = stageType;
        settings.selectedStage = selectedStage;
        this.settings = settings;
        this.newItemAnimation = config.newItemAnimation;
        // console.log("tracker instance settings set", this.settings);
        // Builds a default tracker of the stageType
        this.elements = trackerInstanceBuilder.newTracker(this.settings.stageType);
        // console.log("FACTORY ELEMENTS:", this.elements);
        this.init(lootData);
        return this; 
    }

    /**
     * Initializes the tracker using the stage data. Only run once per instance at the time of construction
     * @param {TableEntry} lootData Stage data header row for the data period being tracked
     */
    init(lootData){
        this.elements.stageTitleText.innerHTML = this.settings.selectedStage;
        // Sets portrait image if it exists
        if (this.elements.trackerInfoPortrait != undefined){
            this.elements.trackerInfoPortrait.style.backgroundImage = config.getFullPortraitUrl(this.settings.selectedStage);
        }
        if (this.elements.lootContainer != undefined){
            this.setLoot(lootData);
        }
    }

    /**
     * Writes the lootData to the tracker
     * @param {TableEntry} lootData Stage data header row for the data period being tracked
     */
    setLoot(lootData){
        /** Checks if tracker has a loot section to update */
        if (this.elements.lootContainer == undefined){
            console.log("Error, loot container was not found in tracker instance with settings: ", this.settings);
            return;
        }
        this.setStats(lootData);
        // Extracts itemlist from lootData
        let itemList = lootData.itemList;
        // Unhides lucky loot section if any loot is lucky
        if (config.isLucky(itemList)){this.elements.luckyLoot.classList.remove("hidden")}
        else {this.elements.luckyLoot.classList.add("hidden")}
        // Removes all loot boxes not contained within lootData
        var lootTextAll = this.elements.lootContainer.querySelectorAll(".tracker-loot-count");
        lootTextAll.forEach((lootText) => {
            let wasFound = false;
            lootText.classList.forEach(className => {
                let match = className.match("^text-(.*)$")
                if(match){
                    var textKey = match[1]
                    if(itemList.hasOwnProperty(textKey)){
                        wasFound = true;
                    }
                }
            });
            // Deletes lootBox if it did not exist in the itemList
            if (wasFound == false){
                let lootBoxElement = lootText.parentElement.parentElement;
                lootBoxElement.remove();
            }
        });
        // Updates xeno box display if it exists
        if (this.elements.xenoBoxes != undefined){
            for (let xenoId of config.itemIds.xenoBoxIds){
                if (!itemList.hasOwnProperty(xenoId)){continue;}
                let itemBoxText = this.elements.xenoBoxes.querySelector(".text-" + xenoId);
                if (itemBoxText == undefined){
                    let itemBox = lootBoxBuilder.buildLootBox(xenoId, itemList[xenoId], config.getFullLootUrl(xenoId));
                    this.elements.xenoBoxes.appendChild(itemBox);
                    itemBox.animate(this.newItemAnimation.keyframes, this.newItemAnimation.timing);
                }
                else if (itemBoxText.innerHTML != itemList[xenoId]){
                    itemBoxText.innerHTML = itemList[xenoId];
                    let itemBox = itemBoxText.parentElement.parentElement;
                    itemBox.animate(this.newItemAnimation.keyframes, this.newItemAnimation.timing);
                }
                delete itemList[xenoId];
            }
        }
        // Updates sephira box display if it exists
        if (this.elements.sephiraBoxes != undefined){
            /** Array containing the ids for every possible sephira box */
            let boxIdList = Object.keys(this.elements.sephiraBoxes);
            for (let boxId of boxIdList){
                let boxIdTextElement = this.elements.sephiraBoxes[boxId];
                // boxId is in itemList
                if (itemList.hasOwnProperty(boxId)){
                    boxIdTextElement.innerHTML = itemList[boxId];
                    // Removes sephira box from itemList so it isn't counted as an item added to the common loot section
                    delete itemList[boxId];
                }
                else{
                    boxIdTextElement.innerHTML = 0;
                }
            }
        }
        
        // Updates loot sections
        for (let item in itemList){
            // Checks if loot box already exists on the tracker
            let itemBoxText = this.elements.lootContainer.querySelector(".text-" + item);
            // If the item box doesn't exist, creates a new one and adds it
            if (itemBoxText == null) {
                let itemBox = lootBoxBuilder.buildLootBox(item, itemList[item], config.getFullLootUrl(item));
                if (config.isLucky(item)){this.elements.luckyLootDrops.appendChild(itemBox);}
                else {this.elements.commonLootDrops.appendChild(itemBox);}
                itemBox.animate(this.newItemAnimation.keyframes, this.newItemAnimation.timing);
            }
            // Updates the item box count if it does exist
            else if (itemBoxText.innerHTML != itemList[item]){
                itemBoxText.innerHTML = itemList[item];
                let itemBox = itemBoxText.parentElement.parentElement;
                itemBox.animate(this.newItemAnimation.keyframes, this.newItemAnimation.timing);
            }
        }
    }
    setStats(lootData){
        if (this.elements.killsRow == undefined){
            // console.log("Error, killsRow was not found in tracker with settings: ", this.settings);
            return;
        }
        // Sets stage info
        if (lootData.hasOwnProperty("kills")){this.elements.killsText.innerHTML = lootData.kills;}
        else {this.elements.killsText.innerHTML = 1;}
        
        if (lootData.hasOwnProperty("redChest") && lootData.redChest > 0){
            this.elements.redChestText.innerHTML = lootData.redChest;
            this.elements.redChestRow.classList.remove("hidden");
        }
        else{this.elements.redChestRow.classList.add("hidden");}
        if (lootData.hasOwnProperty("blueChest") && lootData.blueChest > 0){
            this.elements.blueChestText.innerHTML = lootData.blueChest;
            this.elements.blueChestRow.classList.remove("hidden");
        }
        else{this.elements.blueChestRow.classList.add("hidden");}
        if (lootData.hasOwnProperty("extraChest") && lootData.extraChest > 0){
            this.elements.extraChestText.innerHTML = lootData.extraChest;
            this.elements.extraChestRow.classList.remove("hidden");
        }
        else{this.elements.extraChestRow.classList.add("hidden");}
    }
    clearLoot(lootData){throw new Error('Abstract method called')}
    /**
     * Fetches the div element containing the tracker
     * @returns {HTMLDivElement} div element containing the tracker
     */
    getTracker(){
        return this.elements.tracker;
    };
}

export {trackerInstance};