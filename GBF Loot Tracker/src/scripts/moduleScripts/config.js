let instance;

class config {
    dataPeriods = ["All", "Month", "Week", "Day", "Timer"];
    dataPeriodLengths = [0, 2592000000, 604800000, 86400000];
    validStageInfo = {
        "Raids": {
            "Pre Bar Grind": {
                "Proto Bahamut": {
                    "element": "5",
                    "lucky": "0"
                },
                "Ultimate Bahamut": {
                    "alius": "ub",
                    "element": "6",
                    "lucky": "0"
                },
                "Grand Order": {
                    "element": "4",
                    "lucky": "0"
                }
            },
            "Bar Grind": {
                "Ultimate Bahamut HL": {
                    "alius": "ubhl",
                    "element": "6",
                    "lucky": "1"
                },
                "Akasha": {
                    "element": "4",
                    "lucky": "1"
                },
                "Grand Order HL": {
                    "element": "6",
                    "lucky": "1"
                },
                "Proto Bahamut HL": {
                    "alius": "pbhl",
                    "element": "6",
                    "lucky": "1"
                }
            },
            "The Beasts": {
                "alius": "rotb",
                "Huanglong": {
                    "element": "4",
                    "lucky": "1"
                },
                "Qilin": {
                    "element": "5",
                    "lucky": "1"
                },
                "Huanglong and Qilin": {
                    "element": "7",
                    "lucky": "1"
                }
            },
            "Uncap Grind": {
                "Lindwurm": {
                    "element": "6",
                    "lucky": "0"
                },
                "The Four Primarchs": {
                    "element": "9",
                    "lucky": "0"
                },
                "Lucilius": {
                    "alius": "faa",
                    "element": "6",
                    "lucky": "0"
                },
                "Lucilius (Hard)": {
                    "alius": "faa",
                    "element": "6",
                    "lucky": "0"
                },
                "Beelzebub": {
                    "element": "6",
                    "lucky": "0"
                },
                "Belial": {
                    "element": "6",
                    "lucky": "0"
                },
                "The World": {
                    "element": "6",
                    "lucky": "2"
                }
            },
            "Ennead Raids": {
                "Atum": {
                    "element": "0",
                    "lucky": "2"
                },
                "Tefnut": {
                    "element": "1",
                    "lucky": "2"
                },
                "Bennu": {
                    "element": "2",
                    "lucky": "2"
                },
                "Ra": {
                    "element": "3",
                    "lucky": "2"
                },
                "Horus": {
                    "element": "4",
                    "lucky": "2"
                },
                "Osiris": {
                    "element": "5",
                    "lucky": "2"
                },
            },
            "Six Dragons": {
                "Wilnas": {
                    "element": "0",
                    "lucky": "2"
                },
                "Wamdus": {
                    "element": "1",
                    "lucky": "2"
                },
                "Galleon": {
                    "element": "2",
                    "lucky": "2"
                },
                "Ewiyar": {
                    "element": "3",
                    "lucky": "2"
                },
                "Lu Woh": {
                    "element": "4",
                    "lucky": "2"
                },
                "Fediel": {
                    "element": "5",
                    "lucky": "2"
                }
            },
            "Magna 3": {
                "Colossus Ira Omega": {
                    "element": "0",
                    "lucky": "2"
                },
                "Leviathan Mare Omega": {
                    "element": "0",
                    "lucky": "2"
                },
                "Yggdrasil Arbos Omega": {
                    "element": "0",
                    "lucky": "2"
                },
                "Tiamat Aura Omega": {
                    "element": "3",
                    "lucky": "2"
                },
                "Luminiera Credo Omega": {
                    "element": "4",
                    "lucky": "2"
                },
                "Celeste Ater Omega": {
                    "element": "5",
                    "lucky": "2"
                },
            },
            "Revans": {
                "Mugen": {
                    "element": "0",
                    "lucky": "2"
                },
                "Diaspora": {
                    "element": "1",
                    "lucky": "2"
                },
                "Siegfried": {
                    "element": "2",
                    "lucky": "2"
                },
                "Seofon": {
                    "element": "3",
                    "lucky": "2"
                },
                "Cosmos": {
                    "element": "4",
                    "lucky": "2"
                },
                "Agastia": {
                    "element": "5",
                    "lucky": "2"
                }
            },
            "High Difficulty": {
                "Super Ultimate Bahamut": {
                    "alius": "subhl",
                    "element": "6",
                    "lucky": "2"
                },
                "Hexachromatic Hierarch": {
                    "element": "8",
                    "lucky": "2"
                },
                "Dark Rapture Zero": {
                    "alius": "faa0",
                    "element": "6",
                    "lucky": "2"
                }
            }
        },
        "Arcarum": {
            "Replicard Sandbox E-H": {
                "Zone Eletio": {
                    "element": "0",
                    "lucky": "0"
                },
                "Zone Faym": {
                    "element": "1",
                    "lucky": "0"
                },
                "Zone Goliath": {
                    "element": "2",
                    "lucky": "0"
                },
                "Zone Harbinger": {
                    "element": "3",
                    "lucky": "0"
                }
            },
            "Replicard Sandbox I-L": {
                "Zone Invidia Fire": {
                    "element": "0",
                    "lucky": "0"
                },
                "Zone Invidia Light": {
                    "element": "4",
                    "lucky": "0"
                },
                "Zone Joculator Water": {
                    "element": "1",
                    "lucky": "0"
                },
                "Zone Joculator Dark": {
                    "element": "5",
                    "lucky": "0"
                },
                "Zone Kalendae Earth": {
                    "element": "2",
                    "lucky": "0"
                },
                "Zone Kalendae Dark": {
                    "element": "5",
                    "lucky": "0"
                },
                "Zone Liber Wind": {
                    "element": "3",
                    "lucky": "0"
                },
                "Zone Liber Light": {
                    "element": "4",
                    "lucky": "0"
                },
            },
            "Replicard Sandbox I-L Bosses": {
                "Athena Militis": {
                    "element": "0",
                    "lucky": "0"
                },
                "Grani Militis": {
                    "element": "1",
                    "lucky": "0"
                },
                "Baal Militis": {
                    "element": "2",
                    "lucky": "0"
                },
                "Garuda Militis": {
                    "element": "3",
                    "lucky": "0"
                }
            },
            "Replicard Sandbox Sextant Bosses": {
                "Xeno Ifrit Militis": {
                    "element": "0",
                    "lucky": "1"
                },
                "Xeno Cocytus Militis": {
                    "element": "1",
                    "lucky": "3"
                },
                "Xeno Vohu Manah Militis": {
                    "element": "2",
                    "lucky": "3"
                },
                "Xeno Sagittarius Militis": {
                    "element": "3",
                    "lucky": "1"
                },
            },
            "Replicard Sandbox M": {
                "Zone Mundus Fire": {
                    "element": "0",
                    "lucky": "0"
                },
                "Zone Mundus Water": {
                    "element": "1",
                    "lucky": "0"
                },
                "Zone Mundus Earth": {
                    "element": "2",
                    "lucky": "0"
                },
                "Zone Mundus Wind": {
                    "element": "3",
                    "lucky": "0"
                },
                "Zone Mundus Light": {
                    "element": "4",
                    "lucky": "0"
                },
                "Zone Mundus Dark": {
                    "element": "5",
                    "lucky": "0"
                }
            },
            "Replicard Sandbox M Bosses": {
                "Prometheus Militis": {
                    "element": "0",
                    "lucky": "0"
                },
                "Ca Ong Militis": {
                    "element": "1",
                    "lucky": "0"
                },
                "Gilgamesh Militis": {
                    "element": "2",
                    "lucky": "0"
                },
                "Morrigna Militis": {
                    "element": "3",
                    "lucky": "0"
                },
                "The World (Solo)": {
                    "element": "6",
                    "lucky": "0"
                }
            },
            "Miscellaneous Trackers": {
                "Sephira Boxes": {
                    "element": "6",
                    "lucky": "0",
                    "type": "1"
                },
                "Xeno Militis Boxes": {
                    "element": "6",
                    "lucky": "0",
                    "type": "2"
                }
            }
        },
        "Repeating Events": {
            "Rise of the Beasts": {
                "alius": "rotb",
                "Zhuque": {
                    "element": "0",
                    "lucky": "0"
                },
                "Agni": {
                    "element": "0",
                    "lucky": "0"
                },
                "Xuanwu": {
                    "element": "1",
                    "lucky": "0"
                },
                "Neptune": {
                    "element": "1",
                    "lucky": "0"
                },
                "Baihu": {
                    "element": "2",
                    "lucky": "0"
                },
                "Titan": {
                    "element": "2",
                    "lucky": "0"
                },
                "Qinglong": {
                    "element": "3",
                    "lucky": "0"
                },
                "Zephyrus": {
                    "element": "3",
                    "lucky": "0"
                },
                "Shenxian": {
                    "element": "6",
                    "lucky": "0"
                },
            },
            "Exo Crucibles": {
                "Exo Ifrit Crucible": {
                    "element": "0",
                    "lucky": "0"
                },
                "Exo Cocytus Crucible": {
                    "element": "1",
                    "lucky": "0"
                },
                "Exo Vohu Manah Crucible": {
                    "element": "2",
                    "lucky": "0"
                },
                "Exo Sagittarius Crucible": {
                    "element": "3",
                    "lucky": "0"
                },
                "Exo Corow Crucible": {
                    "element": "4",
                    "lucky": "0"
                },
                "Exo Diablo Crucible": {
                    "element": "5",
                    "lucky": "0"
                },
            }
        },
        "Story Events": {

        },
        "Skip Battles": {

        },
    }
    validStageNames = [];
    elementColors = [
        "#bf371a", "#357ed4", "#855327", "#4b962a", "#d4b62b", "#7b49ca", "#696969",
        "linear-gradient(135deg, rgba(212,182,43,1) 0%, rgba(123,73,202,1) 100%)", // Huanglong and Qilin
        "linear-gradient(135deg, #bf371a, #357ed4, #855327, #4b962a, #d4b62b, #7b49ca)", // Hexachromatic Hierarch
        "linear-gradient(135deg, #bf371a, #357ed4, #855327, #4b962a)", // Four primarchs
    ];
    defaultAssetUrls = {
        lootPath : "url(./img/loot/",
        defaultLootImage : "url(./img/loot/default.jpg)",
        bossPath : "url(./img/portrait/",
        defaultBossImage : "url(./img/portrait/Default.png)",
        bossIconPath : "url(./img/icon/boss/",
        defaultBossIconImage : "url(./img/icon/boss/Default.jpg)",
    }
    itemIds = {
        "luckyLootIds" : [
            /*Red ring + Sand + Gold Bar + Evolite*/"emp3", "215", "20004", "25036",
            /*Gifts+Coffers*/"box2", "box3", "box4", "box5",
            /*Revans Weapons Fire-Earth*/"1040023500", "1040712900", "1040913800", "1040617900", "1040116400", "1040316600",
            /*Revans Weapons Wind-Dark*/"1040024300", "1040316800", "1040915200", "1040117500", "1040421300", "1040816000",
            /*Vintage Fire */"1040900000", "1040500200", "1040600200", "1040700000", 
            /*Vintage Water */"1040000100", "1040300200", "1040416100", "1040700200", "1040900200", 
            /*Vintage Earth */"1040101000", "1040300400", "1040500000", "1040700300", "1040613900", 
            /*Vintage Wind */"1040001300", "1040700100", "1040902000", "1040212200", 
            /*Vintage Light+Dark*/"1040112200", "1040400300", "1040600000", "1040100300", "1040200700", 
            /*ROTB weapons*/"1040404000", "1040206900", "1040004800", "1040802300", 
            /*Longdong and Qilin Summons + Omega anima*/"529", "2040157000", "531", "2040158000",
            /*Rev Weapons*/"1040201600", "1040700500", "1040301300", "1040101700", "1040401800",
            "1040600800", "1040001800", "1040900500", "1040800300", "1040500800",
            /*Malice Weapons*/"1040314000", "1040414600", "1040112300", "1040416300", "1040111000", "1040711000",
            /*Menace Weapons*/"1040711100", "1040704800", "1040615000", "1040408100", "1040905500", "1040305600",
            /*6D Weapons*/"1040912400", "1040020300", "1040513400", "1040313000", "1040215100", "1040613800",
            /*Proven Weapons*/"1040213800", "1040514500", "1040511200", "1040215000", "1040813900", "1040416500",
            "1040617100", "1040614500", "1040016100", "1040016500", "1040612200",
            /*Militis Weapons*/"1040022600", "1040216800", "1040914300", "1040615700", "1040711400", "1040421200",
            "1040515000", "1040314600", "1040814900", "1040115400", "1040711500", "1040616900",
            "1040814000", "1040515100", "1040024100", "1040314700", "1040419600", "1040218000",
            /*Magna3 Weapons*/"1040119200", "1040516800", "1040713400", "1040219100", "1040516900", "1040916200",
            /*Exo Weapons */ "1040118000", "1040516300", "1040218500", "1040119900",
            "1040712400", "1040618400", "1040423200"
        ],
        "skillItemIds" : ["1029900000", "1039900000"],
        "angelWeaponIds": [
            "1020399000", "1020799000", "1020699000", "1020599000", "1020899000", // Angel
            "1020999000", "1020199000", "1020299000", "1020099000", "1020499000",
            "1030399000", "1030799000", "1030699000", "1030599000", "1030899000", //Archangel
            "1030999000", "1030199000", "1030299000", "1030099000", "1030499000",
        ],
        "xenoBoxIds" : ["xeno1", "xeno2", "xeno3", "xeno4"],
    };
    defaultSettings = {
        "darkmode": false,
        "dataPeriod": "0",
        "timeCheckedLastVersion": 0,
        "timerStart": 0,
        "useUnlockedStage": true,
        "useLastDrop": true,
        "latestVersion": "1.0.0",
        "selectedBoss": [],
    };
    defaultStageDataRow = {
        blueChest: 0,
        extraChest: 0,
        itemList: {},
        kills: 0,
        lastIndex: 5,
        redChest: 0,
    }
    defaultStageDataTable = [
        {blueChest: 0, extraChest: 0, itemList: {}, kills: 0, lastIndex: 5, redChest: 0,},
        {blueChest: 0, extraChest: 0, itemList: {}, kills: 0, lastIndex: 5, redChest: 0,},
        {blueChest: 0, extraChest: 0, itemList: {}, kills: 0, lastIndex: 5, redChest: 0,},
        {blueChest: 0, extraChest: 0, itemList: {}, kills: 0, lastIndex: 5, redChest: 0,},
        {blueChest: 0, extraChest: 0, itemList: {}, kills: 0, lastIndex: 5, redChest: 0,},
    ];
    newItemAnimation = {
        keyframes: [
            {filter: "brightness(1)"}, 
            {filter: "brightness(0.5)"}, 
            {filter: "brightness(1)"}
        ],
        timing: 750
    }

    constructor() {
        if (instance){
            throw new Error("Instance of config already exists");
        }
        // Extracts the valid stage names from this.validStageInfo for use in the method isValidStage(stageName)
        for (let category in this.validStageInfo) {
            category = this.validStageInfo[category];
            for (let subcategory in category) {
                subcategory = category[subcategory];
                for (let stageName in subcategory) {
                    this.validStageNames.push(stageName);
                }
            }
        }
        console.log("Config was initialized at: " + Date.now());
        return this;
    }

    // Checks if passed loot is lucky or not
    isLucky(items) {
        switch(typeof items){
            // isLucky was passed a json of itemIds with their amounts as values
            case "object":
                let itemListIds = Object.keys(items);
                if (itemListIds.some(r => this.itemIds.luckyLootIds.includes(r))) { return true; }
                return false;
            // isLucky was passed a string containing the ID that will be checked
            case "string":
                return this.itemIds.luckyLootIds.includes(items);
            default:
                console.log("ERROR: Config method \"isLucky()\" was passed invalid input: ", items);
                console.log("ERROR: This input was of type: " + typeof items);
                return undefined;
        }
        
    }

    isValidStage(stageName) {
        if (this.validStageNames.length == 0){
            console.log("validStageNames wasn't populated correctly: ", this.validStageNames);
        }
        return this.validStageNames.includes(stageName);
    }

    getAllStageInfo(){
        return this.validStageInfo;
    }
    getStageInfo(testName){
        for (let groupName in this.validStageInfo){
            let groupJSON = this.validStageInfo[groupName];
            for (let subgroupName in groupJSON){
                let subgroupJSON = groupJSON[subgroupName];
                for (let stageName in subgroupJSON){
                    if (testName == stageName){return subgroupJSON[stageName];}
                }
            }
        }
        return undefined;
    }

    getDefaultLootImage(){return this.defaultAssetUrls.defaultLootImage;}

    getFullLootUrl(lootId){
        if (typeof lootId != "string"){
            console.log("ERROR: stageName passed to getFullLootUrl was not of type \"string\" but of type " + typeof lootId, lootId);
            return "";
        }
        let lootImagePath = this.defaultAssetUrls.lootPath + lootId + ".jpg)";
        let fullLootImagePath = lootImagePath + ", " + this.getDefaultLootImage();
        return fullLootImagePath;
    }

    getDefaultBossUrl(){return this.defaultAssetUrls.defaultBossImage;}

    getFullPortraitUrl(stageName){
        if (typeof stageName != "string"){
            console.log("ERROR: stageName passed to getFullPortraitUrl was not of type \"string\" but of type " + typeof stageName);
            return "";
        }
        let stageNameEscaped = stageName.replace(/ /g, "%20").replace(/\(/g, "%28").replace(/\)/g, "%29");
        let stageImagePath = this.defaultAssetUrls.bossPath + stageNameEscaped + ".png)";
        let fullStageImagePath = stageImagePath + ", " + this.getDefaultBossUrl();
        return fullStageImagePath;
    }

    getDefaultBossIconUrl(){return this.defaultAssetUrls.defaultBossIconImage}

    getFullBossIconUrl(stageName){
        if (typeof stageName != "string"){
            console.log("ERROR: stageName passed to getFullBossIconUrl was not of type \"string\" but of type " + typeof stageName);
            return "";
        }
        let stageNameEscaped = stageName.replace(/ /g, "%20").replace(/\(/g, "%28").replace(/\)/g, "%29");
        let lootIconPath = this.defaultAssetUrls.bossIconPath + stageNameEscaped + ".jpg)";
        let fullBossIconPath = lootIconPath + ", " + this.getDefaultBossIconUrl();
        return fullBossIconPath;
    }

    /**
     * add 2 JSONs together combining like values
     * @param {JSON} item1
     * @param {JSON} item2 
     */
    addItemList(item1, item2){
        for(let key in item2){
            if (item1.hasOwnProperty(key)){
                item1[key] += item2[key];
            }
            else {
                item1[key] = item2[key];
            }
        }
        return item1;
    }
    
    /**
     * Subtracts like values of a JSON from another
     * @param {JSON} item1
     * @param {JSON} item2 
     */
    subtractItemList(item1, item2){
        for(let key in item2){
            if (item1.hasOwnProperty(key)){
                item1[key] -= item2[key];
                if (item1[key] == 0){
                    delete item1[key];
                }
            }
            else{
                console.log("Error, tried subtracting an item from a json that didn't exist...", key, item1, item2);
            }
        }
        return item1;
    }
}

let configInstance = Object.freeze(new config());

export default configInstance;