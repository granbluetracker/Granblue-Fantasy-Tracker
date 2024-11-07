import '../types/typedefs.js';
class trackerInstanceBuilder {
    /**
     * Public method to build the template of a tracker matching the parameter trackerType
     * @param {string} trackerType ID for the type of stage being constructed
     * @returns {trackerElements};
     */
    static newTracker(trackerType = "0"){
        switch(trackerType) {
            case "0": // General raids or stages
                return this.buildDefaultTracker();
            case "1": // Sephira sandbox chests
                return this.buildSephiraBoxTracker();
            case "2":
                return this.buildXenoBoxTracker();
            case "3":
                return this.buildGuildWarTracker();
            case "4":
                return this.buildGuildWarTracker();
            default:
                console.log("ERROR: trackerInstanceBuilder recieved invalid trackerType input: " + type);
                return undefined;
        }
    }

    /* Build full tracker methods */
    /**
     * Builder method for a raid tracker's HTML
     * @returns {trackerElements}
     */
    static buildDefaultTracker(){
        let headElement = this.buildElement("div", "tracker");
        headElement.appendChild(this.buildStageTitle());
        headElement.appendChild(this.buildStageInfo());
        headElement.appendChild(this.buildDivider());
        headElement.appendChild(this.buildStageLoot());
        headElement.appendChild(this.buildElement("div", "tracker-remove-clickbox"));
        return this.linkAllElements(headElement);
    }

    /**
     * Builder method for a Sephira Box tracker's HTML
     * @returns {trackerElements}
     */
    static buildSephiraBoxTracker(){
        let headElement = this.buildElement("div", "tracker");
        headElement.appendChild(this.buildStageTitle());
        headElement.appendChild(this.buildSephiraBoxInfo());
        headElement.appendChild(this.buildDivider());
        headElement.appendChild(this.buildStageLoot());
        headElement.appendChild(this.buildElement("div", "tracker-remove-clickbox"));
        return this.linkAllElements(headElement);
    }
    /**
     * Builder method for a Sephira Box tracker's HTML
     * @returns {trackerElements}
     */
    static buildXenoBoxTracker(){
        let headElement = this.buildElement("div", "tracker");
        headElement.appendChild(this.buildStageTitle());
        headElement.appendChild(this.buildXenoBoxInfo());
        headElement.appendChild(this.buildElement("div", "tracker-remove-clickbox"));
        return this.linkAllElements(headElement);
    }

    static buildGuildWarTracker(){
        let headElement = this.buildElement("div", "tracker");
        headElement.appendChild(this.buildStageTitle());
        headElement.appendChild(this.buildEventInfo("4"));
        headElement.appendChild(this.buildGuildWarInfo());
        headElement.appendChild(this.buildStageLoot());
        headElement.appendChild(this.buildElement("div", "tracker-remove-clickbox"));
        return this.linkAllElements(headElement);
    }

    /**
     * Builder method for the title element of a tracker.\
     * - Goes on all trackers
     * @returns {HTMLDivElement}
     */
    static buildStageTitle(){
        // Constructs HTML for a default stage title element
        let stageTitle = this.buildElement("div", "tracker-stage-title");
        let stageTitleText = this.buildElement("span", "tracker-stage-title-text");
        stageTitle.appendChild(stageTitleText);
        return stageTitle;
    }

    /**
     * Builder method for the stats block of a tracker.\
     * - Goes on all enemy battle trackers trackers
     * - Doesn't go on any trackers where kills aren't tracked
     * @returns {HTMLDivElement}
     */
    static buildStageInfo(){
        let rowInfo = [
            {"rowText": "Kills:", "defaultHidden": false}, 
            {"rowText": "Blue Chests:", "defaultHidden": true}, 
            {"rowText": "Red Chests:", "defaultHidden": true}, 
            {"rowText": "Extra Chests:", "defaultHidden": true},
        ];
        // Constructs HTML for a default stage info element
        let trackerInfo = this.buildElement("div", "tracker-info");
        let trackerInfoPortrait = this.buildElement("div", "tracker-info-portrait");
        trackerInfo.appendChild(trackerInfoPortrait);
        
        let trackerInfoStats = this.buildElement("div", "tracker-info-stats");
        trackerInfo.appendChild(trackerInfoStats);

        // Builds default info stats row
        let infoStatsRow = this.buildElement("div", "tracker-info-stats-row");
        let infoStatsItem = this.buildElement("div", "tracker-info-stats-item");
        // console.log(infoStatsRow, infoStatsItem);
        infoStatsRow.appendChild(infoStatsItem.cloneNode(true));
        infoStatsRow.appendChild(infoStatsItem.cloneNode(true));
        infoStatsRow.lastChild.innerHTML = "0";

        for (let row of rowInfo){
            let rowElement = infoStatsRow.cloneNode(true);
            rowElement.firstChild.innerHTML = row.rowText;
            if (row.defaultHidden){rowElement.classList.add("hidden")}
            trackerInfoStats.appendChild(rowElement);
        }
        return trackerInfo;
    }

    static buildEventInfo(trackerType){
        //return this.buildElement("div", "tracker-event-info");
        const eventInfoAll = [
            "Very Hard (solo):", // 0
            "Very Hard+ (solo)", // 1
            "Extreme (solo):", // 2
            "Extreme+ (solo):", // 3
            "Maniac (solo)", // 4
            "Maniac+ (solo)", // 5
            "Nightmare:", // 6
            "Very Hard:", // 7
            "Extreme:", // 8
            "Extreme+:", // 9
            "Impossible:", // 10
            "Nightmare 90:", // 11
            "Nightmare 95:", // 12
            "Nightmare 100:", // 13
            "Nightmare 150:", // 14
            "Nightmare 200:", // 15
            "Nightmare 250:", // 16
        ];
        let eventInfoHeadElement = this.buildElement("div", "tracker-event-info");
        eventInfoAll.forEach((value) => {
            let itemContainer = this.buildElement("div", "c-tracker-event-item");
            let itemElement = this.buildElement("div", "tracker-event-item");
            let textElement = this.buildElement("div", "tracker-event-text");
            textElement.innerHTML = value;
            let countElement = this.buildElement("div", "tracker-event-count");
            countElement.innerHTML = "0";
            itemElement.appendChild(textElement);
            itemElement.appendChild(countElement);
            itemContainer.appendChild(itemElement);
            eventInfoHeadElement.appendChild(itemContainer);
        });
        return eventInfoHeadElement;
    }

    static buildGuildWarInfo(){
        let guildWarHeadElement = this.buildElement("div", "tracker-guild-war");
        let rowElement = this.buildElement("div", "tracker-guild-war-row");
        const guildWarItems = {
            "Chests": {src: "url(./img/icon/event/Chests.jpg)"},
            "EventTokens": {src: "url(./img/icon/event/EventTokens.jpg)"},
            "EventItem1": {src: "url(./img/icon/event/EventItem1.jpg)"},
            "EventItem2": {src: "url(./img/icon/event/EventItem2.jpg)"},
            "EventItem3": {src: "url(./img/icon/event/EventItem3.jpg)"},
            "GoldMedals": {src: "url(./img/icon/event/GoldMedals.jpg)"},
            "SilverMedals": {src: "url(./img/icon/event/SilverMedals.jpg)"},
            "BaitChunks": {src: "url(./img/icon/event/BaitChunks.jpg)"},
            "MaliciousClumps": {src: "url(./img/icon/event/MaliciousClumps.jpg)"},
            "Honors": {src: "url(./img/icon/event/Honors.jpg)"},
            "TotalHonors": {src: "url(./img/icon/event/TotalHonors.jpg)"},
            "DailyHonors": {src: "url(./img/icon/event/DailyHonors.jpg)"},
            "CrewHonors": {src: "url(./img/icon/event/Honors.jpg)"},
            "EnemyHonors": {src: "url(./img/icon/event/Honors.jpg)"},
        }
        for (let key in guildWarItems){
            let itemElement = this.buildElement("div", "tracker-guild-war-item");
            let imageElement = this.buildElement("div", "tracker-guild-war-image");
            let itemCount = this.buildElement("div", "tracker-guild-war-count");
            imageElement.style.backgroundImage = guildWarItems[key].src;
            itemCount.innerHTML = "0";
            itemElement.appendChild(imageElement);
            itemElement.appendChild(itemCount);
            rowElement.appendChild(itemElement);
        }
        guildWarHeadElement.appendChild(rowElement);
        return guildWarHeadElement;
    }

    // Adds the stage loot to the bottom of the tracker
    /**
     * Builder method for the loot section of a tracker.\
     * - Goes on all tracker where loot or items are tracked
     * @returns {HTMLDivElement}
     */
    static buildStageLoot(){
        let lootInfo = [
            {"titleText": "Lucky Loot", "defaultHidden": true}, 
            {"titleText": "Common Loot", "defaultHidden": false}, 
        ]
        // Creates elements
        let lootContainer = this.buildElement("div", "c-tracker-loot");
        for (let infoItem of lootInfo){
            let lootTypeContainer = this.buildElement("div", "tracker-loot");
            let titleBody = this.buildElement("div", "tracker-loot-title");
            let titleText = this.buildElement("span", "tracker-loot-title-text");
            titleText.innerHTML = infoItem.titleText;
            let lootDrops = this.buildElement("div", "tracker-loot-drops");

            titleBody.appendChild(titleText);
            lootTypeContainer.appendChild(titleBody);
            lootTypeContainer.appendChild(lootDrops);
            if (infoItem.defaultHidden){lootTypeContainer.classList.add("hidden")}
            lootContainer.appendChild(lootTypeContainer);
        }
        return lootContainer;
    }
    
    /**
     * Builder method for the Sephira Box UI of a tracker.\
     * - Exclusively used to show what Sephira Boxes were oppened on trackers with a type of "1"
     * @returns {HTMLDivElement}
     */
    static buildSephiraBoxInfo(){
        let chestImageIds = [null, 
            "15", "19", "17", "11", "18", "13",
            "12", "16", "13", "14", "20", "17",
            "101", "105", "102", "106",
            "103", "106", "104", "105",
            "101", "102", "103", "104", "105", "106",
        ]
        let sephiraBoxInfo = this.buildElement("div", "tracker-sephira-info");
        // Creates titles
        let sephiraTitle1 = this.buildElement("img", "tracker-sephira-title-img");
        sephiraTitle1.src = "./img/icon/sephira/sephTitle1.png";
        let sephiraTitle2 = this.buildElement("img", "tracker-sephira-title-img");
        sephiraTitle2.src = "./img/icon/sephira/sephTitle2.png";
        let sephiraTitle3 = this.buildElement("img", "tracker-sephira-title-img");
        sephiraTitle3.src = "./img/icon/sephira/sephTitle3.png";

        // Creates chest rows, images, and their counts
        // Zone E-F
        let sephiraRow1 = this.buildElement("div", "tracker-sephira-chest-row");
        for (let i = 1; i <= 6; i++){
            sephiraRow1.appendChild(this.buildSephiraBox(chestImageIds[i], i));
        }
        // Zone G-H
        let sephiraRow2 = this.buildElement("div", "tracker-sephira-chest-row");
        for (let i = 7; i <= 12; i++){
            sephiraRow2.appendChild(this.buildSephiraBox(chestImageIds[i], i));
        }
        // Zone I-J
        let sephiraRow3 = this.buildElement("div", "tracker-sephira-chest-row");
        for (let i = 13; i <= 16; i++){
            sephiraRow3.appendChild(this.buildSephiraBox(chestImageIds[i], i));
        }
        // Zone K-L
        let sephiraRow4 = this.buildElement("div", "tracker-sephira-chest-row");
        for (let i = 17; i <= 20; i++){
            sephiraRow4.appendChild(this.buildSephiraBox(chestImageIds[i], i));
        }
        // Zone M
        let sephiraRow5 = this.buildElement("div", "tracker-sephira-chest-row");
        for (let i = 21; i <= 26; i++){
            sephiraRow5.appendChild(this.buildSephiraBox(chestImageIds[i], i));
        }

        // Assembles pieces into the sephiraBoxInfo div
        sephiraBoxInfo.appendChild(sephiraTitle1);
        sephiraBoxInfo.appendChild(sephiraRow1);
        sephiraBoxInfo.appendChild(sephiraRow2);

        sephiraBoxInfo.appendChild(sephiraTitle2);
        sephiraBoxInfo.appendChild(sephiraRow3);
        sephiraBoxInfo.appendChild(sephiraRow4);

        sephiraBoxInfo.appendChild(sephiraTitle3);
        sephiraBoxInfo.appendChild(sephiraRow5);
        return sephiraBoxInfo;
    }

    /**
     * Builds a sephira box element used in the buildSephiraBoxInfo element.
     * Sephira boxes sometimes share images for boxes with different IDs. This method builds an element with the correct image and ID
     * - Exclusively used for trackers with a type of "1"
     * @param {string} imageId String representing the name of the image file used for this sephira box
     * @param {int} chestId An int identifying which sephira box this actually is.
     * @returns {HTMLDivElement}
     */
    static buildSephiraBox(imageId, chestId){
        chestId = "boxId" + chestId
        let sephiraChest = this.buildElement("div", "tracker-sephira-chest-box");
        let chestImageContainer = this.buildElement("div", "c-tracker-sephira-chest-img");
        let chestImage = this.buildElement("img", "tracker-sephira-chest-img");
        chestImage.src = "./img/icon/sephira/sep"+imageId+".png"
        chestImageContainer.appendChild(chestImage);
        sephiraChest.appendChild(chestImageContainer);

        let chestCount = this.buildElement("div", "tracker-sephira-chest-count");
        chestCount.setAttribute("data-sephira-chest-id", chestId);
        chestCount.innerHTML = "0";
        sephiraChest.appendChild(chestCount);
        return sephiraChest;
    }

    static buildXenoBoxInfo(){
        let stageLoot = this.buildStageLoot()
        let boxInfo = this.buildElement("div", "tracker-xeno-boxes");
        let divider = this.buildDivider();
        stageLoot.insertBefore(divider, stageLoot.firstChild);
        stageLoot.insertBefore(boxInfo, stageLoot.firstChild);
        return stageLoot;
    }

    /**
     * A simple div holding an image of a divider. It is used on some of the trackers
     * @returns {HTMLDivElement}
     */
    static buildDivider(){
        return this.buildElement("div", "divider");
    }

    /**
     * Builds an element and adds 1 or more classes to it. This only uses one line of code and saves time reading and writing code.
     * @param {string} elementType The type of html element being created
     * @param {string | string[]} elementClasses The classes to apply to that html element
     * @returns {HTMLElement}
     */
    static buildElement(elementType, elementClasses = "") {
        let element = document.createElement(elementType);
        if (elementClasses == undefined || elementClasses.length == 0){return element;}
        if (typeof elementClasses == "string"){element.classList.add(elementClasses);}
        else if (typeof elementClasses == "object"){element.classList.add(...elementClasses);}
        return element;
    }

   /**
    * Stores all tracked HTML elements in a JSON if they are detected and returns the constructed JSON
    * @param {HTMLDivElement} headElement 
    * @returns {trackerElements}
    */
    static linkAllElements(headElement){
        var elements = {};
        elements.tracker = headElement; 
        // Links tracker-stage-title
        if (elements.tracker.querySelector(".tracker-stage-title-text") != null)
            {elements.stageTitleText = elements.tracker.querySelector(".tracker-stage-title-text");}
        
        // Links tracker-info
        // tracker portrait
        if (elements.tracker.querySelector(".tracker-info-portrait") != null)
            {elements.trackerInfoPortrait = elements.tracker.querySelector(".tracker-info-portrait");}

        // tracker stats
        if (elements.tracker.querySelectorAll(".tracker-info-stats-row").length == 4){
            let target = elements.tracker.querySelectorAll(".tracker-info-stats-row");
            elements.killsRow = target[0];
            elements.killsText = elements.killsRow.lastChild;
            elements.blueChestRow = target[1];
            elements.blueChestText = elements.blueChestRow.lastChild;
            elements.redChestRow = target[2];
            elements.redChestText = elements.redChestRow.lastChild;
            elements.extraChestRow = target[3];
            elements.extraChestText = elements.extraChestRow.lastChild;
        }

        // Links tracker-info
        // c-tracker-loot and their tracker-loot children
        if (elements.tracker.querySelector(".c-tracker-loot") != null){
            elements.lootContainer = elements.tracker.querySelector(".c-tracker-loot")
            let lootSections = elements.lootContainer.querySelectorAll(".tracker-loot");
            elements.luckyLoot = lootSections[0];
            elements.luckyLootDrops = elements.luckyLoot.querySelector(".tracker-loot-drops");
            elements.commonLoot = lootSections[1];
            elements.commonLootDrops = elements.commonLoot.querySelector(".tracker-loot-drops");
        }

        if (elements.tracker.querySelector(".tracker-xeno-boxes") != null)
            {elements.xenoBoxes = elements.tracker.querySelector(".tracker-xeno-boxes")}

        /* 
        * Creates a nodelist of the 26 elements that hold the counts for each sephira box
        * It then adds each element to a json with that sephira box ID as the key
        */
        if (elements.tracker.querySelectorAll(".tracker-sephira-chest-count") != null){
            let sephiraBoxCounts = {};
            Array.from(elements.tracker.querySelectorAll(".tracker-sephira-chest-count"), 
                e => sephiraBoxCounts[e.dataset.sephiraChestId] = e);
            elements.sephiraBoxes = sephiraBoxCounts;
        }

        if (elements.tracker.querySelector(".tracker-event-info")){
            const eventInfo = elements.tracker.querySelector(".tracker-event-info");
            elements.bossCounts = eventInfo.querySelectorAll(".tracker-event-count");
        }

        if (elements.tracker.querySelector(".tracker-guild-war")){
            const guildWarHead = elements.tracker.querySelector(".tracker-guild-war");
            const itemList = guildWarHead.querySelectorAll(".tracker-guild-war-count");
            if (itemList != null && itemList.length > 0){
                var guildWar = {
                    Chests: itemList[0],
                    EventTokens: itemList[1],
                    EventItem1: itemList[2],
                    EventItem2: itemList[3],
                    EventItem3: itemList[4],
                    GoldMedals: itemList[5],
                    SilverMedals: itemList[6],
                    BaitChunks: itemList[7],
                    MaliciousClumps: itemList[8],
                    Honors: itemList[9],
                    TotalHonors: itemList[10],
                    DailyHonors: itemList[11],
                    CrewHonors: itemList[12],
                    EnemyHonors: itemList[13],
                }
                elements.guildWar = guildWar;
            }
        }

        // Links tracker-remove-clickbox
        if (elements.tracker.querySelector(".tracker-remove-clickbox") != null)
            {elements.trackerRemoveClickbox = elements.tracker.querySelector(".tracker-remove-clickbox")}
        return elements;
    }
}

class stageSelectorBuilder {
    static newStageSelector(config, eventStageInfo){
        let staticStageInfo = config.getAllStageInfo();
        let mainElement = this.buildElement("div", "stage-selector");
        let stageSelectorHead = this.buildStageSelectorHead(staticStageInfo);
        mainElement.appendChild(stageSelectorHead);
        var tokenSubgroup, guildwarSubgroup, solotreasureSubgroup;
        for (let groupTitle in staticStageInfo){
            let groupElement = this.buildGroup(groupTitle, staticStageInfo[groupTitle], config)
            switch (groupTitle){ // Stores these elements for later use
                case "Event Stages":
                    tokenSubgroup = this.buildElement("div", ["stage-selector-subgroup","l-subgroup","hidden"]);
                    tokenSubgroup.appendChild(this.buildSubgroupTitle("Token Events"));
                    solotreasureSubgroup = this.buildElement("div", ["stage-selector-subgroup","l-subgroup","hidden"]);
                    solotreasureSubgroup.appendChild(this.buildSubgroupTitle("Solo Treasure Events"));
                    groupElement.appendChild(tokenSubgroup);
                    groupElement.appendChild(solotreasureSubgroup);  
                    break;
                case "Guild War":
                    guildwarSubgroup = this.buildElement("div", ["stage-selector-subgroup","l-subgroup","hidden"]);
                    guildwarSubgroup.appendChild(this.buildSubgroupTitle("Guild Wars"));
                    groupElement.appendChild(guildwarSubgroup);
                    break;
            }
            mainElement.appendChild(groupElement);
        };
        // console.log(mainElement);
        if (!tokenSubgroup || !guildwarSubgroup || !solotreasureSubgroup){console.log("Error, event tabs in stageSelectorBuilder were improperly linked..."); return mainElement}
        // Adds any event stages to the stage selector
        for (let eventId in eventStageInfo){
            if (!eventStageInfo[eventId]?.EventTitle){continue;}
            let stageName = eventStageInfo[eventId]?.EventTitle;
            let eventButton = this.buildElement("div", "stage-selector-button");
            eventButton.setAttribute("data-selection", stageName);
            let eventButtonInner = this.buildElement("div", "stage-selector-button-event");
            eventButtonInner.innerHTML = stageName;
            eventButton.appendChild(eventButtonInner);
            // let buttonPortrait = this.buildElement("div", "stage-selector-portrait");
            // eventButton.appendChild(buttonPortrait);
            // let buttonTextElement = this.buildElement("span", "stage-selector-button-text");
            // buttonTextElement.innerHTML = stageName;
            // eventButton.appendChild(buttonTextElement);
            if (eventId.length < 4){console.log(`Error, eventId ${eventId} was shorter than 4 characters in newStageSelector`); continue;}
            let eventType = eventId.substring(0, eventId.length - 3);
            // console.log("EVENT TYPE: " + eventType + " typeof event type: " + typeof eventType)
            switch (eventType){
                case "1": 
                    eventButton.setAttribute("data-type", "3");
                    eventButton.setAttribute("data-alius", "token");
                    tokenSubgroup.appendChild(eventButton);
                    tokenSubgroup.classList.remove("hidden");
                    break;
                case "3":
                    eventButton.setAttribute("data-type", "4");
                    eventButton.setAttribute("data-alius", "guild war guildwar");
                    guildwarSubgroup.appendChild(eventButton);
                    guildwarSubgroup.classList.remove("hidden");
                    break;
                case "11":
                    eventButton.setAttribute("data-type", "3");
                    eventButton.setAttribute("data-alius", "solo treasure solotreasure");
                    solotreasureSubgroup.appendChild(eventButton);
                    solotreasureSubgroup.classList.remove("hidden");
                    break;
            }
        }
        return mainElement;
    }

    static buildStageSelectorHead(allStageInfo){
        let headElement = this.buildElement("div", "stage-selector-head");
        let searchboxElement = this.buildElement("input", "stage-selector-searchbox");
        headElement.appendChild(searchboxElement);
        let tabButtonBoxElement = this.buildElement("div", "stage-selector-tab-button-box");
        let tabsText = Object.keys(allStageInfo);
        for (let tabText of tabsText){
            let tabElement = this.buildElement("div", "stage-selector-tab-button");
            tabElement.setAttribute("data-selection", tabText);
            tabElement.innerHTML = tabText;
            tabButtonBoxElement.appendChild(tabElement);
        }
        headElement.appendChild(tabButtonBoxElement);
        return headElement;
    }

    static buildGroup(groupTitle, groupInfo, config){
        let groupElement = this.buildElement("div", "stage-selector-group");
        groupElement.setAttribute("data-groupid", groupTitle);
        let groupTitleElement = this.buildGroupTitle(groupTitle);
        groupElement.appendChild(groupTitleElement);
        for (let subgroupTitle in groupInfo){
            if (subgroupTitle == "alius"){
                groupElement.setAttribute("data-alius", groupInfo.alius);
                continue;
            }
            groupElement.appendChild(this.buildSubgroup(subgroupTitle, groupInfo[subgroupTitle], config));
        }
        return groupElement;
    }

    static buildGroupTitle(titleText){
        let titleElement = this.buildElement("div", "stage-selector-title");
        let textElement = this.buildElement("div", "title-text");
        textElement.innerHTML = titleText;
        titleElement.appendChild(textElement);
        return titleElement;
    }

    static buildSubgroup(subgroupTitle, subgroupInfo, config){
        let subgroupElement = this.buildElement("div", "stage-selector-subgroup");
        subgroupElement.setAttribute("data-subgroupid", subgroupTitle);
        let subgroupTitleElement = this.buildSubgroupTitle(subgroupTitle);
        subgroupElement.appendChild(subgroupTitleElement);
        let numElementsInSubgroup = 0
        for (let stageName in subgroupInfo){
            if (stageName == "alius"){
                subgroupElement.setAttribute("data-alius", subgroupInfo.alius);
                continue;
            }
            subgroupElement.appendChild(this.buildStageButton(stageName, subgroupInfo[stageName], config));
            numElementsInSubgroup++;
        }
        // console.log("Subgroup had " + numElementsInSubgroup + " elements.")
        switch (numElementsInSubgroup){
            case 1:
                subgroupElement.classList.add("s-subgroup");
                break;
            case 2:
            case 3:
            case 4:
                subgroupElement.classList.add("m-subgroup");
                break;
            default:
                subgroupElement.classList.add("l-subgroup");
                break;
        }
        return subgroupElement;
    }

    static buildSubgroupTitle(titleText){
        let titleElement = this.buildElement("div", "stage-selector-subtitle");
        let textElement = this.buildElement("span", "subtitle-text");
        textElement.innerHTML = titleText;
        titleElement.appendChild(textElement);
        return titleElement;
    }

    static buildStageButton(stageName, stageInfo, config){
        // console.log("Stage name and info: ", stageName, stageInfo);
        // Main button element
        let buttonElement = this.buildElement("div", "stage-selector-button");
        buttonElement.setAttribute("data-selection", stageName);
        if (stageInfo.hasOwnProperty("type")){
            buttonElement.setAttribute("data-type", stageInfo.type);
        }
        else {buttonElement.setAttribute("data-type", "0");}
        
        // Sets aliuses that the stage can be found by searching
        let stageAlius = "";
        if (stageInfo.hasOwnProperty("element")){
            switch (stageInfo.element){
                case "0":
                    stageAlius += "fire ";
                    break;
                case "1":
                    stageAlius += "water ";
                    break;
                case "2":
                    stageAlius += "earth dirt ";
                    break;
                case "3":
                    stageAlius += "wind air ";
                    break;
                case "4":
                    stageAlius += "light ";
                    break;
                case "5":
                    stageAlius += "dark ";
                    break;
                case "6":
                    stageAlius += "null white ";
                    break;
                default:
                    stageAlius += "multi chroma ";
                    break;
            }
        }
        if (stageInfo.hasOwnProperty("lucky")){
            switch (stageInfo.lucky){
                case "1":
                    stageAlius += "gold bar gb ";
                    break;
                case "2":
                    stageAlius += "sands hourglass ";
                    break;
                case "3":
                    stageAlius += "sephira evolite ";
                    break;
                default:
            }
        }
        if (stageInfo.hasOwnProperty("alius")){
            stageAlius += stageInfo.alius;
        }

        buttonElement.setAttribute("data-alius", stageAlius);

        // Element that stores all stage images
        let portraitElement = this.buildElement("div", "stage-selector-portrait");
        portraitElement.style.backgroundImage = config.getFullPortraitUrl(stageName);

        // Element that holds the icons showing info about the stage
        let itemBoxContainerElement = this.buildElement("div", "stage-selector-item-box");
        if (stageInfo.lucky != "0"){
            let luckyBox = this.buildElement("div", "stage-selector-item");
            luckyBox.style.backgroundImage = config.getFullBossIconUrl(stageInfo.lucky);
            itemBoxContainerElement.appendChild(luckyBox);
        }
        // NOTE: This code adds an icon showing the main unique drop for that stage. Disabled for now since it looks bad. Uncomment to re-enable this feature
        // let bossItem = this.buildElement("div", "stage-selector-item");
        // bossItem.style.backgroundImage = config.getFullBossIconUrl(stageName);
        // itemBoxContainerElement.appendChild(bossItem);

        // Places the div containing the icons onto the stage portrait
        portraitElement.appendChild(itemBoxContainerElement);

        // Creates the text for the button
        let buttonTextElement = this.buildElement("span", "stage-selector-button-text");
        buttonTextElement.innerHTML = stageName;

        // Combines the image and text box to create one complete button
        buttonElement.appendChild(portraitElement);
        buttonElement.appendChild(buttonTextElement);
        return buttonElement;
    }

    // Creates an html element with one or more classes in one method
    static buildElement(elementType, elementClasses = "") {
        let element = document.createElement(elementType);
        if (typeof elementClasses == "string"){element.classList.add(elementClasses);}
        else if (typeof elementClasses == "object"){element.classList.add(...elementClasses);}
        return element;
    }
}

class lootBoxBuilder{
    static buildLootBox(id, value = 0, imageURL) {
        // Builds loot box
        let element = this.buildElement("div", "tracker-loot-box");
        let tag = this.buildElement("div", "tracker-loot-tag");
        let multi = this.buildElement("span", "tracker-loot-multi");
        multi.innerHTML = "x";
        let count = this.buildElement("span", ["tracker-loot-count", "text-" + id]);
        count.innerHTML = value;
        tag.appendChild(multi);
        tag.appendChild(count);
        element.appendChild(tag);

        // Adds image to box
        element.style.backgroundImage = imageURL;

        return element;
    }

    static buildElement(elementType, elementClasses = "") {
        let element = document.createElement(elementType);
        if (typeof elementClasses == "string"){element.classList.add(elementClasses);}
        else if (typeof elementClasses == "object"){element.classList.add(...elementClasses);}
        return element;
    }
}

export {trackerInstanceBuilder, stageSelectorBuilder, lootBoxBuilder};