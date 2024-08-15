import { getObjectFromLocalStorage, saveObjectInLocalStorage, rebalanceStageInLocalStorage, removeObjectFromLocalStorage }  from './chrome-local-storage-api.js';
import config from './config.js';

class storageManager{
    /** @type {extensionSettings | undefined} */
    settings;

    constructor(){
        chrome.storage.onChanged.addListener((changes, areaname) => {this.processStorageUpdate(changes, areaname)});
        console.log("Storage manager was loaded");
        return this;
    }

    async init(){
        this.settings = await getObjectFromLocalStorage("Settings");
        if (this.settings == undefined){this.buildSettings()}
        let body = document.querySelector("body");
        if (this.settings.darkmode){body.classList.add("dark");}
        else {body.classList.remove("dark");}
    }

    processStorageUpdate(changes, areaname){
        console.log(changes, areaname);
        const storageKey = Object.keys(changes)[0];
        if (storageKey == "Settings"){
            this.settings = changes.Settings.newValue;
            let body = document.querySelector("body");
            if (this.settings.darkmode){body.classList.add("dark");}
            else {body.classList.remove("dark");}
            return;
        }
        if (!config.isValidStage(storageKey)){return;} // Storage update was not for a valid stage
        /** If oldValue isn't defined, it is the first stage drop of a new stage clear
         * but if oldValue is defined and oldValue and newValue is the same size, there is no new data to display
         */
        if (changes[storageKey].hasOwnProperty("oldValue") && changes[storageKey].newValue.length - changes[storageKey].oldValue.length != 1){return;}
        this.processNewStageClear(storageKey, changes[storageKey].newValue)
    }

    processNewStageClear(stageName, stageData){
        let event = new CustomEvent("NewStageClear", {detail : {"stageName": stageName, "stageData": stageData}});
        console.log("Firing event newStageClear: ", event);
        window.dispatchEvent(event);
    }

    async fetchStageData(stageName){
        let stageData = await getObjectFromLocalStorage(stageName, true);
        return stageData;
    }

    buildSettings(){
        console.log("Initializing settings for the first time");
        saveObjectInLocalStorage({["Settings"]: config.defaultSettings});
        this.settings = config.defaultSettings;
    }

    updateSettings(key, value){
        this.settings[key] = value;
        saveObjectInLocalStorage({["Settings"]: this.settings});
    }

    async recalculateAllStageData(){
        console.log(await rebalanceStageInLocalStorage(config.validStageNames));
    }

    updateViewedStages(stageName, isAdded = true){
        let selectedStages = this.settings.selectedBoss;
        console.log(selectedStages);
        var stageInfo = config.getStageInfo(stageName);
        if (stageInfo == undefined){
            console.log("ERROR: updateViewedStages() recieved an invalid stageName as input: " + stageName);
            return;
        }
        if (!stageInfo.hasOwnProperty("type")){stageInfo.type = 0}
        switch(isAdded){ // Adds stage to tracked list
            case true:
                let newSelectedBossEntry = {
                    "isLocked": true,
                    "stage": stageName,
                    "type": stageInfo.type
                }
                selectedStages.push(newSelectedBossEntry);
                this.updateSettings("selectedBoss", selectedStages);
                return true;
            case false: // Removes stage from tracked list
                Array.from(selectedStages, (stageData) => {
                    if (stageData.stage == stageName){
                        let index = selectedStages.indexOf(stageData);
                        selectedStages.splice(index, 1);
                        console.log("Updated storage to remove: " + stageName + " from tracked stages");
                        this.updateSettings("selectedBoss", selectedStages);
                    }
                });
                break;
            default:
                console.log("Error, isAdded wasn't true or false: " + isAdded);
        }    
    }
}

let storageManagerInstance = new storageManager();

export default storageManagerInstance;