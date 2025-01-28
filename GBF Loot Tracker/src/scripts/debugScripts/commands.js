import storageManager from '../moduleScripts/storageManager.js';
import { getObjectFromLocalStorage, saveObjectInLocalStorage, removeObjectFromLocalStorage }  from '../moduleScripts/chrome-local-storage-api.js';
class CommandManager {
    static async init(){
        await storageManager.init();
        var checkboxes = document.querySelectorAll("input[type=checkbox]");
        checkboxes.forEach(function (checkbox) {
            if (!storageManager.settings.hasOwnProperty(checkbox.value)){
                console.log("Error, storage settings did not have the setting " + checkbox.value);
            }
            if (storageManager.settings[checkbox.value] != false){checkbox.checked=true}
            checkbox.addEventListener("change", (e) => {
                storageManager.updateSettings(e.target.value, e.target.checked)
                console.log(e.target.value, e.target.checked);
            });
        });
    }

    static async logSettings(){
        let settings = await getObjectFromLocalStorage("Settings");
        console.log("COMMANDMANAGER", settings);
    }
    
    static resetSettings(){
        storageManager.buildSettings()
    }
    
    static recalculateData(){
        storageManager.recalculateAllStageData();
    }
    
    /** Requests a variable managed by service worker */
    static async requestVar(varName){
        let request = {
            message: {
                action: "getVar",
                params: {
                    data: varName
                }
            }
        }
        chrome.runtime.sendMessage(request, function (message) {
            var lastError = chrome.runtime.lastError;
            if (lastError){throw new Error(lastError.message);}
            console.log(message.response);
        });
    }

    /** Entry point to fix known errors that I have made in storage, such as a typo in ater, or a rouge sephira chest ID */
    static async dataNorm(){
        let sephiraData = await getObjectFromLocalStorage("Sephira Boxes");
        const fixedSephiraData = CommandManager.removeKeyFromLoot(sephiraData, "boxIdundefined");
        console.log(fixedSephiraData);
        await saveObjectInLocalStorage({["Sephira Boxes"]: fixedSephiraData})
        const stage1Key = "Celeste Ater Omega";
        var stage1 = await chrome.storage.local.get(stage1Key);
        const stage2Key = "Celeste Alter Omega";
        let stage2 = await chrome.storage.local.get(stage2Key);
        CommandManager.mergeStageData(stage1, stage2, stage1Key);
    }
    
    static removeKeyFromLoot(stageData, key){
        // console.log(stageData);
        const initialSize = stageData.length;
        var markedForDeletion = [];
        var deletedEntries = 0;
        for (let row in stageData){
            if(stageData[row].itemList.hasOwnProperty(key)){
                delete stageData[row].itemList[key];
                deletedEntries++
                // console.log(stageData[row].itemList);
                if (Object.keys(stageData[row].itemList).length == 0){
                    markedForDeletion.push(row);
                }
            }
        }
        console.log(
            "Number of occurrences of " + key + " that were deleted: " + deletedEntries, 
            "\nNumber of entries that are now empty and marked for deletion: " + markedForDeletion.length);
        while (markedForDeletion.length > 0){
            let selectedRow = markedForDeletion.pop();
            console.log("Deleting empty row: " + selectedRow);
            stageData.splice(selectedRow, 1);
        }
        const finalSize = stageData.length;
        console.log("Rows deleted: " + (initialSize - finalSize));
        for (let row in stageData){
            if (stageData[row].itemList.hasOwnProperty(key)){
                console.log("ERROR, key was not properly removed: ", stageData[row].itemList);
                throw new Error("ERROR, key was not properly removed");
            }
        }
        return stageData;
    }
    
    /**
    * Merges all rows from stage1 and stage2, then stores the new table in local storage under the key newKey
    * @param {JSON} stage1 JSON containing a stageName as a key and stageData array as a value
    * @param {JSON} stage2 JSON containing a stageName as a key and stageData array as a value
    * @param {string} newKey The key that the merged stage data will be stored under
    */
    static mergeStageData(stage1, stage2, newKey){
        var newStageData;
        const stage1Key = Object.keys(stage1)[0];
        const stage1Data = stage1[stage1Key];
        const stage2Key = Object.keys(stage2)[0];
        const stage2Data = stage2[stage2Key];
        if (stage1Key == stage2Key){
            console.log("Error, the keys for stage1 and stage2 in mergeStageData were identical");
            return undefined;
        }
    
        // Checks if stage data passes verification
        const stage1Valid = CommandManager.validateStageData(stage1Data);
        const stage2Valid = CommandManager.validateStageData(stage2Data)
        
        // Decides if merging is necessary depending on the verification of stage data
        if (!stage1Valid && !stage2Valid){
            console.log("Both stage1 and stage2 data were invalid!");
            return;
        }
        else if (!stage1Valid && stage2Valid){
            console.log("stage1Data was not valid but stage2Data was");
            newStageData = stage2Data;}
        else if (!stage2Valid){
            console.log("stage2Data was not valid but stage1Data was");
            newStageData = stage1Data;}
        else {
            console.log("stage1Data and stage2Data are valid. Merging tables...");
            newStageData = CommandManager.mergeStageDataOpperation(stage1Data, stage2Data);}
        console.log(newStageData);
        chrome.storage.local.set({[newKey]: newStageData});
    }

    /**
     * Performs the opperation of merging stage data
     * @param {Array} stage1Data An array containing the data from a stage
     * @param {Array} stage2Data An array containing the data from a stage
     * @returns {Array} An array containing the table built from merging the data in stage1Data and stage2Data
     */
    static mergeStageDataOpperation(stage1Data, stage2Data){
        var newStageData = config.defaultStageDataTable;
        var index1 = 5;
        var index2 = 5;
        var compareResult = 1; // 1 => stage1Data row is earlier, -1 => stage2Data row is earlier
        while (index1 < stage1Data.length && index2 < stage2Data.length){
            if (index1 >= stage1Data.length){compareResult = -1;} // stage1Data is fully merged
            else if (index2 >= stage2Data.length){compareResult = 1;} // stage2Data is fully merged
            else if (stage1Data[index1].epochTime < stage2Data[index2].epochTime){compareResult = 1;} // stage1Data row came first
            else {compareResult = -1} // stage2Data row came first
            switch (compareResult){
                case 1:
                    newStageData.push(stage1Data[index1]);
                    index1++;
                    break;
                case -1:
                    newStageData.push(stage2Data[index2]);
                    index2++;
                    break;
            }
        }
        return newStageData;
    }

    /**
    * Checks the integrity of a stageData table
    * @param {Array} stageData JSON containing a stageName as a key and stageData array as a value
    * @returns {boolean} true if data passed check, false if it did not
    */
    static validateStageData(stageData){
        // console.log(stageData);
        try{
            if (stageData == undefined){
                console.log("Stage Data was undefined and invalid: ", stageData);
                return false;
            }
            if (stageData.length <= 5){
                console.log("Stage Data had no non-header rows and was invalid: ", stageData);
                return false;
            }
        }
        catch (e){
            console.log("validateStageData ran into an exception with input: ", stageData);
            console.log("Exception: ", e);
            return false;
        }
        return true;
    }

    // This is the code used to import or export data in local storage
    static ExportStorage() {
        chrome.storage.local.get(null, function (allDataJson) {
            console.log("Downloading all data from local storage", allDataJson);
            const allDataString = JSON.stringify(allDataJson);
            const dataBlob = new Blob([allDataString], { type: "application/json" });
            const dataUrl = URL.createObjectURL(dataBlob);
            const dl = document.createElement("a");
            dl.href = dataUrl;
            dl.download = "GBF_Loot_Tracker_Localdata.json";
            dl.click();
        });
    }
    
    
    // ChangeEvent is an event of type change on an input element with type file
    static ImportStorage(changeEvent) {
        const allDataFile = changeEvent.target.files[0];
        console.log("Writing file to local storage");
        // File isn't empty
        if (allDataFile) {
            const fileReader = new FileReader();
            fileReader.onload = function (e) {
                var allDataJson = JSON.parse(e.target.result);
                chrome.storage.local.set(allDataJson, function () {
                    if (chrome.runtime.lastError) {
                        console.log("Runtime Error importing data: ", chrome.runtime.lastError)
                    }
                    else { console.log("Import was successful") }
                })
            }
            fileReader.readAsText(allDataFile);
        }
    }
}

export default CommandManager;