import './types/typedefs';
var requestLog = [];
var requestLogAll = [];

/** @type {UrlRegexJson} */
const urlRegex = {
    gameUrlRegex: new RegExp("^https:\/\/game.granbluefantasy.jp"),
    extensionUrlRegex: new RegExp("^chrome:\/\/extensions\/|^chrome-extension:\/\/"),

    // Stage results landing page URL
    soloResultUrlRegex: new RegExp("^https:\/\/game.granbluefantasy.jp\/#result\/\\d{10}"),
    raidResultUrlRegex: new RegExp("^https:\/\/game.granbluefantasy.jp\/#result_multi\/\\d{11}"),
    resultUrlRegex: undefined,

    // Results file URL
    soloRewardUrlRegex: new RegExp("^https:\/\/game.granbluefantasy.jp\/result\/content\/index\/\\d{10}"),
    raidRewardUrlRegex: new RegExp("^https:\/\/game.granbluefantasy.jp\/resultmulti\/content\/index\/\\d{11}"),
    rewardUrlRegex: undefined,

    // Sandbox URLs
    sandboxStavesRegex: new RegExp("^replicard\/stage\/[2-5]"),
    sandboxSwordsRegex: new RegExp("^replicard\/stage\/[6-9]"),
    sandboxGenesisRegex: new RegExp("^replicard\/stage\/10"),

    // Sandbox specific file URLs
    sephiraStockRegex: new RegExp("^https:\/\/game.granbluefantasy.jp\/rest\/replicard\/sephirabok_stock_list\\?_="),
    sephiraOpenRegex: new RegExp("^https:\/\/game.granbluefantasy.jp\/rest\/replicard\/open_sephirabox\\?_="),
    xenoboxUrlRegex: new RegExp("^https:\/\/game.granbluefantasy.jp\/rest\/replicard\/stage\\?_=\\d{10}"),
    whitelist: undefined,
};
// Defines any compound regex that are made of other smaller regex
urlRegex.resultUrlRegex = new RegExp(urlRegex.soloResultUrlRegex.source + "|" + urlRegex.raidResultUrlRegex.source);
urlRegex.rewardUrlRegex = new RegExp(urlRegex.soloRewardUrlRegex.source + "|" + urlRegex.raidRewardUrlRegex.source);

urlRegex.whitelist = new RegExp(urlRegex.rewardUrlRegex.source + "|" + urlRegex.sephiraOpenRegex.source + "|" + urlRegex.xenoboxUrlRegex.source);


Object.freeze(urlRegex);

/** 
 * A JSON that contains the information needed to classify stages.
 * Stages are sorted with their quest_type as the key.
 * After selecting the quest type, each stage is stored with their stageName as the key.
 * Stage info is stored as a 2d array with 4 rows under **StageSignature[quest_type][stageName][index]** 
 * You can change the row by changing index from 0->3
 * - index = 0: if any keys match, this stage is the correct one. Only this stage drops this loot
 * - index = 1: if this array is populated, you must have all keys from it. This stage always drops all loot in this row
 * - index = 2: if this array is populated, at least one key must match for this stage to be correct. The stage always drops at least one of these items
 * - index = 3: if this array is populated, none of your keys may match any items in this array. This stage never drops these items
 */
const StageSignature = {
    /** Stages with quest type 1 or 3*/
    raidSignature: {
        /** QUEST TYPE 1 STAGES */
        "Proto Bahamut": [["1030202400", "1030702300", "1030302000", "1030102500", "1030402200", "1030601400", "1030002900", "1030900600", "1030801200", "1030502500"], [], [], []],
        "Proto Bahamut HL": [["59", "79"], [], [], []],
        "Ultimate Bahamut": [["137", "139"], [], [], []],
        "Ultimate Bahamut HL": [["138"], [], [], []],
        "Akasha": [["534"], [], [], []],
        "Grand Order HL": [["546"], [], [], []],
        "Grand Order": [["83", "84"], [], [], []],
        "Super Ultimate Bahamut": [["572"], [], [], []],
        "Lindwurm": [["547"], [], [], []],
        "Lucilius": [["536", "537"], [], [], []],
        "Lucilius (Hard)": [["538"], [], [], []],
        "Beelzebub": [["555"], [], [], []],
        "Belial": [["570"], [], [], []],
        "Atum": [["575", "576"], [], [], []],
        "Tefnut": [["577", "578"], [], [], []],
        "Bennu": [["579", "580"], [], [], []],
        "Ra": [["581", "582"], [], [], []],
        "Horus": [["574", "583"], [], [], []],
        "Osiris": [["573", "584"], [], [], []],
        "Wilnas": [[], ["557"], [], ["592"]],
        "Wamdus": [[], ["558"], [], ["592"]],
        "Galleon": [[], ["559"], [], ["592"]],
        "Ewiyar": [[], ["560"], [], ["592"]],
        "Lu Woh": [[], ["561"], [], ["592"]],
        "Fediel": [[], ["562"], [], ["592"]],
        "Hexachromatic Hierarch": [["592"], ["562"], [], []],
        "Dark Rapture Zero": [["593"], [], [], []],
        "Mugen": [["586"], [], [], []],
        "Diaspora": [["585"], [], [], []],
        "Siegfried": [["587"], [], [], []],
        "Seofon": [["589"], [], [], []],
        "Cosmos": [["590"], [], [], []],
        "Agastia": [["588"], [], [], []],
        "Huanglong and Qilin": [["528", "529", "530", "531"], [], [], []],
        "Huanglong": [["206"], [], [], ["528", "529", "530", "531"]],
        "Qilin": [["208"], [], [], ["528", "529", "530", "531"]],
        "The World": [["25017"], [], [], []],
        "Tiamat Aura Omega": [[], ["612"], ["10", "18", "44", "32", "104", "114", "600", "601", "5041"], []],
        "Luminiera Credo Omega": [[], ["612"], ["25", "26", "45", "50", "105", "115", "608", "609", "5051"], []],
        "Colossus Ira Omega" : [[],["612"],["11", "19", "41", "47", "101", "111", "602", "603", "5011"],[]],
        "Celeste Ater Omega" : [[],["612"],["30", "31", "46", "51", "106", "116", "610", "611", "5061"],[]],
        "Yggdrasil Arbos Omega": [[],["612"],["13", "21", "43", "49", "103", "113", "606", "607", "5031"],[]],
        "Leviathan Mare Omega": [[],["612"],["12", "20", "42", "48", "102", "112", "604", "605", "5021"],[]],
        "Shenxian": [["badge5"], [], [], []],

        /** QUEST TYPE 3 STAGES */
        "Exo Ifrit Crucible": [["1040118000", "10509"], [], [], []],
        "Exo Cocytus Crucible": [["1040516300", "10500"], [], [], []],
        "Exo Vohu Manah Crucible": [["1040218500", "1040119900", "10488", "10548"], [], [], []],
        "Exo Sagittarius Crucible": [["1040712400", "10480"], [], [], []],
        "Exo Corow Crucible": [["1040618400", "10522"], [], [], []],
        "Exo Diablo Crucible": [["1040423200", "10543"], [], [], []],
    },

    /** Contains information for classifying sephira stages */
    sephiraSignature: {
        elementSignature: {
            "Fire": ["1011", "1012", "1311", "1312", "25051", "25055"],
            "Water": ["1021", "1022", "1321", "1322", "25047", "25054"],
            "Earth": ["1031", "1032", "1331", "1332", "25048", "25052"],
            "Wind": ["1041", "1042", "1341", "1342", "25050", "25056"],
            "Light": ["1051", "1052", "1351", "1352", "25053"],
            "Dark": ["1061", "1062", "1361", "1362", "25049"],
        },
        lusters: ["25070", "25071", "25072", "25073"],
        doppelworldBosses: {
            "replicard/stage/6": "Xeno Ifrit Militis", "replicard/stage/7": "Xeno Cocytus Militis", "replicard/stage/8": "Xeno Vohu Manah Militis", "replicard/stage/9": "Xeno Sagittarius Militis"
        },
        swordsBosses: {
            "replicard/stage/6": "Athena Militis", "replicard/stage/7": "Grani Militis", "replicard/stage/8": "Baal Militis", "replicard/stage/9": "Garuda Militis"
        },
        stavesBossMats: [
            "25058", "25059", "25060", "25061", "25062", "25063",
            "25064", "25065", "25066", "25067", "25068", "25069", 
        ],
        swordsBossMats: ["25075", "25076", "25077", "25078", "25079", "25080", "25081", "25082"],
        genesisBosses: {
            "25017": "The World (Solo)", "25085": "Prometheus Militis", "25086": "Ca Ong Militis", "25085": "Gilgamesh Militis", "25085": "Morrigna Militis"
        },
        zones: {
            "replicard/stage/2": "Zone Eletio", "replicard/stage/3": "Zone Faym", "replicard/stage/4": "Zone Goliath", "replicard/stage/5": "Zone Harbinger",
            "replicard/stage/6": "Zone Invidia", "replicard/stage/7": "Zone Joculator", "replicard/stage/8": "Zone Kalendae", "replicard/stage/9": "Zone Liber",
            "replicard/stage/10": "Zone Mundus",
        },
        /** 
         * Sephira Boxes have image IDs that are different from their actual item IDs. This is because some sephira boxes look the same but are different items.
         * This JSON allows you to distinguish them if you know both the return url and image ID. You can find this with sephiraBoxSignatures[url][imageId]
         */
        sephiraBoxSignatures: {
            "replicard/stage/2": { "sep15": "1", "sep19": "2", "sep17": "3" }, // Zone Eletio
            "replicard/stage/3": { "sep11": "4", "sep18": "5", "sep13": "6" }, // Zone Faym
            "replicard/stage/4": { "sep12": "7", "sep16": "8", "sep13": "9" }, // Zone Goliath
            "replicard/stage/5": { "sep14": "10", "sep11": "11", "sep17": "12" }, // Zone Harbinger
            "replicard/stage/6": { "sep101": "13", "sep105": "14" }, // Zone Invidia
            "replicard/stage/7": { "sep102": "15", "sep106": "16" }, // Zone Joculator
            "replicard/stage/8": { "sep103": "17", "sep106": "18" }, // Zone Kalendae
            "replicard/stage/9": { "104": "19", "105": "20" }, // Zone Liber
            "replicard/stage/10": { "sep101": "21", "sep102": "22", "sep103": "23", "sep104": "24", "sep105": "25", "sep106": "26" }, // Zone Mundus
        },
    },
    /** Contains information for classifying Rise of the Beast raids */
    beastSignature: {
        "Xuanwu": ["Extreme", "badge1"],
        "Qinglong": ["Extreme", "badge2"],
        "Baihu": ["Extreme", "badge3"],
        "Zhuque": ["Extreme", "badge4"],
        "Neptune": ["Extreme+", "badge1"],
        "Zephyrus": ["Extreme+", "badge2"],
        "Titan": ["Extreme+", "badge3"],
        "Agni": ["Extreme+", "badge4"],
    },

}
Object.freeze(StageSignature);

/** - Tracks the last loot file info */
var trackedRequest = {};
/** - Stores an up to date list of every debugger attached to a tab */
var activeDebuggers = [];
/** - If loot with these IDs are dropped in a stage results, changes the extension icon */
const changeIconOnId = ["215", "20004"];
Object.freeze(changeIconOnId);
/** All, Month, Week, Day */
const dataPeriodLengths = [0, 2592000000, 604800000, 86400000];
Object.freeze(dataPeriodLengths);
const dataPeriods = ["All", "Month", "Week", "Day", "Timer"];
Object.freeze(dataPeriods);
const defaultStageDataTable = [
    {blueChest: 0, extraChest: 0, itemList: {}, kills: 0, lastIndex: 5, redChest: 0, extraChest: 0, },
    {blueChest: 0, extraChest: 0, itemList: {}, kills: 0, lastIndex: 5, redChest: 0, extraChest: 0, },
    {blueChest: 0, extraChest: 0, itemList: {}, kills: 0, lastIndex: 5, redChest: 0, extraChest: 0, },
    {blueChest: 0, extraChest: 0, itemList: {}, kills: 0, lastIndex: 5, redChest: 0, extraChest: 0, },
    {blueChest: 0, extraChest: 0, itemList: {}, kills: 0, lastIndex: 5, redChest: 0, extraChest: 0, },
];
Object.freeze(defaultStageDataTable);
const defaultStageHeadRow = {
    blueChest: 0,
    extraChest: 0,
    itemList: {},
    kills: 0,
    lastIndex: 5,
    redChest: 0,
}
Object.freeze(defaultStageHeadRow);
/** Tracks when the custom timer was started */
var timerStart = 0;

/**********************************/
/* Listener and support functions */
/**********************************/

/**
 * This class manages all debuggers by dynamically attaching and detaching them when needed.
 */
class DebuggerManager {
    /**
     * Starts the following event listeners:
     * - chrome.debugger.onEvent
     * - chrome.tabs.onUpdated
     */
    static EnableEventListeners() {
        // Adds listeners for network events and tab changes
        if (!chrome.debugger.onEvent.hasListener(NetworkFilter.NetworkListener)) {
            console.log("%c[+]Activating listener on NetworkListener", "color:lime;")
            chrome.debugger.onEvent.addListener(NetworkFilter.NetworkListener);
            let networkListenerStatus = chrome.debugger.onEvent.hasListener(NetworkFilter.NetworkListener)
            console.log("%c[info]false --> " + networkListenerStatus, "color:aqua;");
        }
        if (!chrome.tabs.onUpdated.hasListener(DebuggerManager.TabListener)) {
            console.log("%c[+]Activating listener on TabListener", "color:lime;")
            chrome.tabs.onUpdated.addListener(DebuggerManager.TabListener);
            let TabListenerStatus = chrome.tabs.onUpdated.hasListener(DebuggerManager.TabListener);
            console.log("%c[info]false --> " + TabListenerStatus, "color:aqua;");
        }
    }

    /**
     * Dynamically adds a debugger when a tab loads a URL from Granblue Fantasy, and removes it when the tab views a non Granblue Fantasy URL
     * - Receives events from chrome.tabs.onUpdated
     * @param {number} tabId 
     * @param {object} changeInfo
     * @param {Tab} tab
     * @returns {void}
     */
    static TabListener(tabId, changeInfo, tab) {
        if (urlRegex.extensionUrlRegex.test(tab.url) && (changeInfo.status === "loading")) { DebuggerManager.RefreshActiveDebuggers(); return; }
        // Excludes tabs that aren't loading or are chrome extension pages
        if (!(changeInfo.status === "loading")) { return; }
        let isOnGame = urlRegex.gameUrlRegex.test(tab.url);
        let hasDebuggerAttached = activeDebuggers.some(item => item.tabId == tabId);
        if (isOnGame && !hasDebuggerAttached) {
            DebuggerManager.AddDebugger(tabId);
        }
        else if (!isOnGame && hasDebuggerAttached) {
            DebuggerManager.RemoveDebugger({ "tabId": tabId });
        }
    }

    /**
     * Attaches a debugger to the tab matching the tabId
     * @param {number} tabId 
     */
    static AddDebugger(tabId) {
        try {
            chrome.debugger.attach({
                tabId: tabId
            }, "1.0", DebuggerManager.onAttach.bind(null, tabId));
        }
        catch (error) {
            console.log("%c[error]Results tab already has a debugger attached...", "color:red;", error);
            DebuggerManager.RefreshActiveDebuggers();
        }
    }

    /**
     * Removes a debugger from the tab matching the tabId
     * @param {Debuggee} debuggeeId
     */
    static async RemoveDebugger(debuggeeId) {
        try {
            // Creates bool that shows if the debuggeeId has a debugger attached
            let hasDebugger = activeDebuggers.filter(function (e) { return e.tabId == debuggeeId.tabId }).length > 0;
            if (hasDebugger) {
                console.log("%c[-]Removing debugger from tab: ", "color:red;", debuggeeId);
                requestLog = [];
                requestLogAll = [];
                await chrome.debugger.detach(debuggeeId);
                await DebuggerManager.RefreshActiveDebuggers();
            }
            else { console.log("%c[-]Debugger wasn't attached: ", "color:red;", debuggeeId); }
        }
        catch (error) {
            console.log("%c[error]Debugger was already detatched... ", "color:red;", error)
            DebuggerManager.RefreshActiveDebuggers();
        }
    }

    /**
     * Refreshes the array of active debuggers
     */
    static async RefreshActiveDebuggers() {
        chrome.debugger.getTargets(async function (result) {
            activeDebuggers = result.filter(function (e) { return e.attached == true })
            console.log("%c[info]Active debuggers Refreshed: ", "color:aqua;", activeDebuggers);
        })
    }

    /**
     * Enables network events on debugged tab by sending a Network.enable command to the target debugee. 
     * These events are listened to by the NetworkFilter.NetworkListener() method
     * @param {number} tabId The tabId for the new debugee
     */
    static onAttach(tabId) {
        try {
            console.log("%c[+]New debugger added to: " + tabId, "color:lime;");
            chrome.debugger.sendCommand({
                "tabId": tabId
            }, "Network.enable");
            console.log("%c[+]Network Enabled. Waiting for response", "color:lime;");
            DebuggerManager.RefreshActiveDebuggers();
        }
        catch (error) {
            console.log("An error occured at onAttach...", error);
            DebuggerManager.RefreshActiveDebuggers();
        }
    }
}

/** This class receives chrome.debugger network events and filters them for data that would be recorded by the extension */
class NetworkFilter {
    /**
     * Processes chrome.debugger network events
     * @param {Debuggee} debuggeeId 
     * @param {string} message Name of the event
     * @param {Network} params Information about the event, such as the source URL, requestId
     */
    static async NetworkListener(debuggeeId, message, params) {
        // If the event is a requestWillBeSent and the URL is from a loot results JSON...
        if (message == "Network.requestWillBeSent" && urlRegex.whitelist.test(params.request.url)) {
            console.log("%c[Step 1] RETRIEVING DATA", "color:coral;");
            console.log("%c[1.1]Request found that matches file URL", "color:coral;");
            let fileType = "";
            // Decides what type of file this is
            if (urlRegex.rewardUrlRegex.test(params.request.url)) { fileType = "Battle Data" }
            else if (urlRegex.sephiraOpenRegex.test(params.request.url)) { fileType = "Sephira Results" }
            else if (urlRegex.xenoboxUrlRegex.test(params.request.url)) { fileType = "Xenobox" }
            console.log("%c[1.2]detected requestWillBeSent from: " + params.request.url + " of type: " + fileType, "color:coral;");
            trackedRequest = {
                "requestId": params.requestId,
                "tabId": debuggeeId.tabId,
                "fileType": fileType,
                "timestamp": Date.now(),
            };
            requestLog.push([message, 0, params, debuggeeId.tabId]);
            return;
        }
        else if (params.requestId != trackedRequest.requestId) { return; }
        requestLog.push([message, 0, params, debuggeeId.tabId]);
        if (message == "Network.loadingFinished") {
            console.log("%c[1.3]loadingFinished event matched requestId. Congrats!", "color:coral;");
            await NetworkFilter.sendCommandPromise(debuggeeId.tabId, params).then((response) => {
                console.log("%c[1.4]Succeeded in getting data!", "color: coral;");
                console.log("%c[info]Message chain for retrieved file", "color:coral;", requestLog);
                switch (trackedRequest.fileType) {
                    case "Battle Data":
                        DataProcessor.ProcessRewardJSON(response);
                        break;
                    case "Sephira Results":
                        DataProcessor.ProcessSephiraJSON(response);
                        break;
                    case "Xenobox":
                        DataProcessor.ProcessXenoboxJSON(response);
                        break;
                    default:
                        console.log("%c[error]fileType did not match any known values: " + trackedRequest.fileType, "color:red;");
                        break;
                }

                requestLog = [];
            }).catch((error) => {
                console.log("%cError occured fetching loot data file: ", error, "color:red;");
            });
        }
    }

    /**
     * Function to return response body and handle errors that may arrise
     * @param {number} tabId 
     * @param {Network} params 
     * @returns {Promise<string>} json in string format
     */
    static sendCommandPromise(tabId, params) {
        return new Promise((resolve, reject) => {
            try {
                chrome.debugger.sendCommand(
                    {
                        "tabId": tabId
                    }, "Network.getResponseBody", {
                    "requestId": params.requestId
                }, function (response) {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    }
                    else if (!response || !response.body) {
                        console.error("Response was empty");
                        reject(new Error("Response was empty"));
                    }
                    else { resolve(response); }
                });
            }
            catch (ex) {
                console.log("Error fetching resource");
                reject(ex)
            }
        });
    }
}

/** Handles the processing of raw data into a format that can be stored for later */
class DataProcessor {
    /**
     * Processes and stores the stage reward data recieved from the server
     * @param {ResultInfoRaw} response
     * @returns {void}
     */
    static async ProcessRewardJSON(response) {
        // Changes response body from string to JSON and extracts + stores relevant data
        console.log("%c[Step 2] PROCESSING DATA", "color:cornflowerblue;");
        try {
            /** @type {ResultInfo} */
            var resultInfo = JSON.parse(response.body);
            if (!resultInfo.hasOwnProperty("option") || !resultInfo.option.hasOwnProperty("result_data")) { // Returns if enemy didn't drop any loot
                console.log("%c[!]Boss did not drop any rewards", "color:orange;");
                return;
            }
            /** @type {ResultData} */
            var resultData = resultInfo.option.result_data;
            console.log("%c[2.1]Result data: ", "color:cornflowerblue;", resultData);
            // var rewardList = body.rewards.reward_list;
            // console.log("%c[2.1]Parsed rewards list:", "color:cornflowerblue;", rewardList);
            // Build row to send
            var tableEntry = DataProcessor.BuildTableEntry(resultData);
            // Temporarily changes extension icon if loot contained any special items (sand/bars)
            Object.keys(tableEntry.itemList).some(r => (changeIconOnId.includes(r) && setIconAction(r)))
            // Finds the enemy name
            var enemyName = DataProcessor.FindEnemyName(tableEntry.itemList, resultData.quest_type, resultData.url)
            if (enemyName == "Unknown" || enemyName == undefined) { console.log("%c[!]Enemy was " + enemyName, "color:orange;"); return; }
            console.log("%c[2.5]Enemy name found: " + enemyName, "color:cornflowerblue;");
            DataProcessor.StoreRow(enemyName, tableEntry);
        }
        catch (error) { console.log("%c[error]A problem occured while processing reward data...", "color:red;", error); }
    }

    /**
     * Processes the data that comes from opening a sephira box from the sephira sandbox menu
     * @param {*} response 
     */
    static ProcessSephiraJSON(response) {
        try {
            console.log("%c[Step 2] LOGGING SEPHIRA BOX RESULTS", "color:cyan;")
            var body = JSON.parse(response.body);
            var rewardList = body.reward_list;
            var sephiraTableRow = { epochTime: Date.now(), blueChest: 0, redChest: 0, extraChest: 0, itemList: {} };
            for (let item of rewardList) {
                let itemId = item.item_id;
                let itemType = DataProcessor.itemKindToString(item.item_kind);
                let itemName = itemType + itemId;
                let itemCount = item.number;
                sephiraTableRow.itemList[itemName] = itemCount;
            }
            console.log(sephiraTableRow);
            DataProcessor.StoreRow("Sephira Boxes", sephiraTableRow);
        }
        catch (error) { console.log("%c[error]An error occured in ProcessSephiraJSON: ", "color:red;", error); }
    }

    /**
     * Processes the data that comes visiting a sandbox map
     * @param {*} response 
     */
    static ProcessXenoboxJSON(response){
        console.log("%c[Step 2] PROCESSING DATA", "color:cornflowerblue;");
        try {
            var stageInfo = JSON.parse(response.body);
            if (!stageInfo.hasOwnProperty("xeno_sephirabox_reward") 
                || !stageInfo.xeno_sephirabox_reward.hasOwnProperty("contents")
                || stageInfo.xeno_sephirabox_reward.contents.length == 0)
                {
                    console.log("%c[!]Xenobox did not drop", "color:orange;")
                    return;
                }
            console.log("%cDetected Xeno Militis Box", "color:cornflowerblue;")
            /** @type {object[]} */
            var contents = stageInfo.xeno_sephirabox_reward.contents;
            var xenoTableRow = { epochTime: Date.now(), blueChest: 0, redChest: 0, extraChest: 0, itemList: {} };
            for (let item of contents) {
                let itemId = item.item_id;
                let itemType = DataProcessor.itemKindToString(item.item_kind);
                let itemName = itemType + itemId;
                let itemCount = item.number;
                xenoTableRow.itemList[itemName] = itemCount;
            }
            // Adds the xenobox itself to the reward list for tracking
            if (stageInfo.xeno_sephirabox_reward.hasOwnProperty("xeno_color_id")){
                var xenoboxId = "xeno" + stageInfo.xeno_sephirabox_reward.xeno_color_id;
                xenoTableRow.itemList[xenoboxId] = 1;
                console.log("%cDetected zone of origin", "color:cornflowerblue;")
            }
            else {console.log("%c[error]An error occured in ProcessXenoboxJSON: stageInfo.xeno_sephirabox_reward.xeno_color_id was not defined", "color:red;");}
            
            console.log(xenoTableRow);
            DataProcessor.StoreRow("Xeno Militis Boxes", xenoTableRow);
        }
        catch (error) { console.log("%c[error]An error occured in ProcessXenoboxJSON: ", "color:red;", error); }
    }

    /**
     * Processes the ResultData JSON into a TableEntry
     * @param {ResultData} resultData A JSON object that contains extra info that is used to populate a results page after clearing a stage in the game
     * @returns {TableEntry} A JSON containing information about any items that were dropped by the stage
     */
    static BuildTableEntry(resultData) {
        console.log("%c[2.2]Building table entry", "color:cornflowerblue;");
        var rewardList = resultData.rewards.reward_list;
        var tableEntry = { epochTime: Date.now(), blueChest: 0, redChest: 0, extraChest: 0, itemList: {} }
        var tempItemList = {}; // After construction, will be slotted into tableEntry.itemList
        for (let row in rewardList) { // Iterates over entries in the reward_list JSON
            let chestRow = rewardList[row];
            for (let element in chestRow) {
                var item = chestRow[element];
                var itemCount = item.count;
                var itemType = DataProcessor.itemKindToString(item.item_kind);
                /** 
                 * This if and else if block is here to solve some weirdness caused by ROTB items.
                 * These badges work differently than other items, and the stars (item_kind = 49) are formatted differently.
                 * These conversions must be made so that these items can work with the extension.
                 */
                if (itemType == "badge") {
                    switch (item.item_kind) {
                        case 26: // Water RotB badge
                            item.id = "1"
                            break;
                        case 27: // Wind RotB badge
                            item.id = "2"
                            break;
                        case 28: // Earth RotB badge
                            item.id = "3"
                            break;
                        case 63: // Fire RotB badge
                            item.id = "4"
                            break;
                        case 85: // Golden RotB badge
                            item.id = "5"
                            break;
                    }
                }
                else if (item.item_kind == 49) {
                    itemCount = item.id;
                    item.id = "90001"
                }
                var itemId = itemType + item.id;
                /**
                 * What row an item is in shows what type of chest it is. These chest counts are tracked so their counts are increased here
                 */
                switch (row){
                    case "4":
                        tableEntry.redChest += 1;
                        break;
                    case "11":
                        tableEntry.blueChest += 1;
                        break;
                    case "13":
                    case "16":
                        tableEntry.extraChest += 1
                        break;
                    default:
                        break;
                }
                /** Adds count to existing itemId property or creates a new one if it didn't exist before */
                if (!tempItemList.hasOwnProperty(itemId)) { tempItemList[itemId] = +itemCount; }
                else { tempItemList[itemId] += +itemCount; }
            }
        }

        // If result is from a sandbox stage, checks if a sephira box dropped and adds it to the itemList if it exists
        if (resultData.quest_type == 25 && resultData.replicard.sephirabox_stock_data != null) {
            let sephiraBoxId = "sep" + resultData.replicard.sephirabox_stock_data.card_number;
            tempItemList[sephiraBoxId] = 1;
            console.log("%c[info]New Sephira box detected: " + sephiraBoxId, "color:cornflowerblue;");
            DataProcessor.UpdateSephiraStock(sephiraBoxId, resultData.url);
        }

        tableEntry.itemList = tempItemList;
        console.log("%c[2.3]Built table entry", "color:cornflowerblue;", tableEntry);
        return tableEntry;
    }

    /**
     * Converts an item's item_kind into the string for that item type
     * - This is the prefix that appears on some itemIds in this extension
     * - This must be done because some item IDs have overlap across item types
     * @param {number} item_kind 
     * @returns {string}
     */
    static itemKindToString(item_kind) {
        switch (item_kind) {
            case 4: // Stamina / berries
                return "stam";
            case 9: // Crystal
                return "stam";
            case 10: // Normal items that go in your item inventory (usually)
                // No itemTypeString
                return "";
            case 55: // Ticket items like gold gifts or astra boxes
                return "box";
            case 73: // Rings + Earrings
                return "emp"; 
            case 88: // Plus Marks
                return "bonus";
            case 91: // Paladin Shields
                return "shld";
            case 93: // Manadiver pets
                return "mntr";
            // RISE OF THE BEAST ITEMS
            case 26: // Water RotB badge
            case 27: // Wind RotB badge
            case 28: // Earth RotB badge
            case 63: // Fire RotB badge
            case 85: // Golden RotB badge
                return "badge";
            case 49: // RotB four symbols pendants (Low drop number that has it's own type)
                return "";
            default:
                return "";
        }
    }

    /**
     * Records a new sephira sandbox drop in Sephira Boxes 
     * @param {string} imageId The string name for the image of this sephira Box. Is usually: **"sep" + number**
     * @param {string} url The url the game will take you to when you click the continue button. Usually where you started the stage from.
     * @returns {void}
     */
    static UpdateSephiraStock(imageId, url) {
        try {
            console.log("%c[Step 3] Recording new sephira box drop", "color:cyan;");
            console.log("%c[2.1]Finding box ID", "color:cyan;");
            const sephiraBoxSignatures = StageSignature.sephiraSignature.sephiraBoxSignatures;
            /** @type {string} The id for the sephira box that was dropped */
            const itemId = "boxId" + sephiraBoxSignatures[url][imageId];
            /** @type {TableEntry} */
            var boxTableRow = {};
            boxTableRow.epochTime = Date.now();
            boxTableRow.redChest = 0;
            boxTableRow.blueChest = 0;
            boxTableRow.extraChest = 0;
            boxTableRow.itemList = { [itemId]: 1 };
            console.log(boxTableRow);
            console.log("%c[2.2]Box Table Row was built, Sending to StoreRow: ", "color:cyan;", [boxTableRow]);
            DataProcessor.StoreRow("Sephira Boxes", boxTableRow);
        }
        catch (error) { console.log("%c[error]An error occured in UpdateSephiraStock: ", "color:red;", error); }
    }

    /**
     * Finds a stage name from other information about the stage
     * @param {JSON} lootList JSON containing information about items that were dropped for this entry
     * - An item's ID {string} is the key and it's count {string} is the value
     * @param {number} quest_type Contains information about what kind of quest the results page is for. 
     * - 1 => raid, 
     * - 25 => sandbox, 
     * - ext... 
     * @param {string} url 
     * @returns {string}
     */
    static FindEnemyName(lootList, quest_type, url) {
        console.log("DEBUG FROM FindEnemyName(): ", lootList, quest_type, url);
        console.log("%c[2.4]Finding enemy name", "color:cornflowerblue;");
        /** A list of all lootIds obtained from the stage results */
        var lootKeys = Object.keys(lootList);
        switch (quest_type) {
            // 1 = raid, 25 = sephira sandbox
            case 1:
            case 3:
                /** A JSON containing the data needed to classify all stages of quest_type = 1 */
                const raidSignature = StageSignature.raidSignature;
                for (let stageName in raidSignature) {
                    /** Checks instant field of */
                    if (raidSignature[stageName][0].length > 0) {
                        if (raidSignature[stageName][0].some(r => lootKeys.includes(r))) { return stageName }
                        else { continue; }
                    }
                    if (raidSignature[stageName][1].length > 0 && !raidSignature[stageName][1].some(r => lootKeys.includes(r))) { continue; }
                    if (raidSignature[stageName][2].length > 0 && !raidSignature[stageName][2].some(r => lootKeys.includes(r))) { continue; }
                    if (raidSignature[stageName][3].length > 0 && raidSignature[stageName][3].some(r => lootKeys.includes(r))) { continue; }
                    console.log("Returning: " + stageName);
                    return stageName;
                }
                // Difficulty: The fight is classified as this difficulty
                // required: This item must be in the list
                const RotBSignature = StageSignature.beastSignature;
                console.log("Checking if RotB");
                // Checks RotB enemies. 90001 is the lootId for RotB stars which all RotB stages drop
                if (lootKeys.includes("90001")) {
                    console.log("Was RotB");
                    // If over 210 stars drop from chests, the enemy must be a RotB enemy of Extreme+ difficulty
                    let difficulty = "Extreme";
                    if (lootListRaw["90001"] > 210) { difficulty = "Extreme+" }
                    console.log("Difficulty was: " + difficulty)
                    for (let beast in RotBSignature) {
                        if (RotBSignature[beast][0] == difficulty && lootKeys.includes(RotBSignature[beast][1])) {
                            console.log("RotB boss was: " + beast);
                            return beast;
                        }
                    }
                }
                // Did not match any known loot signature
                return "Unknown";
            case 25:
                /** A JSON containing the data needed to classify all stages of quest_type = 25 */
                const sephiraData = StageSignature.sephiraSignature;
                console.log("Return URL: " + url);
                // Checks if stage is in Sephira Zones E-H
                if (urlRegex.sandboxStavesRegex.test(url)) { console.log(url + " is in zone E-H"); return sephiraData.zones[url]; }
                // Checks if stage is in Sephira Zones I-L
                if (urlRegex.sandboxSwordsRegex.test(url)) {
                    console.log(url + " is in zone I-L");
                    /** Doppel world bosses are the only stages in Swords zones that drop Staves boss materials */
                    if (sephiraData.stavesBossMats.some(r => lootKeys.includes(r))) { return sephiraData.doppelworldBosses[url]; }
                    /** Zone bosses are the only stages that drop lusters but not staves boss materials */
                    if (sephiraData.lusters.some(r => lootKeys.includes(r))) {{ return sephiraData.swordsBosses[url]; }}
                    for (let element in sephiraData.elementSignature) {
                        if (sephiraData.elementSignature[element].some(r => lootKeys.includes(r))) { return sephiraData.zones[url] + " " + element; }
                    }
                }
                // Checks if stage is in Sephira Zone M
                if (url == "replicard/stage/10") {
                    console.log(url + " is in zone M");
                    for (let id in sephiraData.genesisBosses) {
                        if (lootKeys.includes(id)) { return sephiraData.genesisBosses[id] }
                    }
                    for (let element in sephiraData.elementSignature) {
                        if (sephiraData.elementSignature[element].some(r => lootKeys.includes(r))) { return sephiraData.zones[url] + " " + element; }
                    }
                }
                // Stage did not match any known loot signature
                return "Unknown";
            default:
                console.log("%c[!]quest_type did not belong to any tracked stage... quest_type: " + quest_type, "color:orange;");
                return "Unknown";
        }
    }

    /**
     * Stores a new entry in a stage's table. If a stage doesn't have a table yet, it constructs one
     * @param {string} key The name of the stage the TableEntry will be stored in
     * @param {TableEntry} value The TableEntry that will be stored
     */
    static async StoreRow(key, value) {
        console.log("%c[2.6]Storing table entry", "color:cornflowerblue;");
        /** @type {JSON[] | null} An array containing the table before the new row is added */
        var table = await storageProxy.get(key);
        // Builds new table if it does not exist
        if (table == null) {
            console.log("%c[!]Table was not found. Building new table...", "color:orange;")
            table = new Array();
            // Creates 5 header rows for the table using data from the stage's first entry
            var defaultHead = Object.assign({}, value);
            // Adds killcount + lastIndex and deletes epochTime field from header rows
            defaultHead.kills = 1;
            defaultHead.lastIndex = 5;
            delete defaultHead["epochTime"];
            // Builds table with 5 rows containing values from first kill
            // Rows in order are stored Total, Monthly, Weekly, Daily, Timer
            for (let i = 0; i <= 4; i++) {
                table[i] = Object.assign({}, defaultHead);
            }
        }

        /** If the stage has data already recorded, simply adds the new row to headder rows */
        else {
            for (let i = 0; i <= 4; i++) {
                if(!table[i].hasOwnProperty("kills")){table[i].kills = 0;}
                table[i].kills += 1;
                if(!table[i].hasOwnProperty("blueChest")){table[i].blueChest = 0;}
                table[i].blueChest += value.blueChest;
                if(!table[i].hasOwnProperty("redChest")){table[i].redChest = 0;}
                table[i].redChest += value.redChest;
                if(!table[i].hasOwnProperty("extraChest")){table[i].extraChest = 0;}
                table[i].extraChest += value.extraChest;
                table[i].itemList = addItemList(table[i].itemList, value.itemList);
            }
        }

        /** Pops the new entry at the end of the list */
        table.push(value);
        /** Recounts table header rows to be within proper time periods */
        DataProcessor.BalanceStageData(table);
        await storageProxy.save({ [key]: table });
        console.log("%c[2.7]Table entry was successfully stored", "color:cornflowerblue;");
    }

    /**
     * Rebalances all data to have an accurate tally for data from the last month/week/day
     * The first 5 rows of the array stored in stage data contain tallies for:
     * stageData[0], all data ever obtained about the stage
     * stageData[1], data from the last month
     * stageData[2], data from the last week
     * stageData[3], data from the last day
     * stageData[4], data since the custom timer was started
     * @param {TableData} stageData An array containing a list of the names of stages that will have their data rebalanced
     * @returns {TableData}
     */
    static BalanceStageData(stageData){
        if (stageData == undefined){return stageData;}
        const sizeOfArray = stageData.length
        for (let i = 1; i <= 4; i++){ 
            // Isolates data to only be for the specified row
            let targetRow = {...stageData[i]};
            let cutoffTime, index;
            // cutoffTime is the datetime in ms for which only data from after this time will be counted
            if (i != 4){cutoffTime = Date.now() - dataPeriodLengths[i];}
            else {cutoffTime = timerStart;}

            // index is the index for the last row of data that was valid the last time the sum was calculated. 
            // The starting index would have not been removed from the total so if the starting index is before cutoffTime, it will be subtracted
            if (targetRow.lastIndex < 5){index = 5;}
            else {index = targetRow.lastIndex;}

            if (index >= sizeOfArray){
                continue;
            }
            if (cutoffTime <= stageData[index].epochTime){
                // console.log("Stage data was already balanced for the period: " + dataPeriods[i])
                continue;
            }

            // While the current index is within the array and the current index is outside the cutoff time
            while (index < sizeOfArray && stageData[index].epochTime < cutoffTime){
                // Subtracts the row that is outside the cutoff time from the sum
                targetRow.blueChest -= stageData[index].blueChest;
                targetRow.redChest -= stageData[index].redChest;
                targetRow.extraChest -= stageData[index].extraChest;
                targetRow.kills--;
                targetRow.itemList = subtractItemList(targetRow.itemList, stageData[index].itemList);
                index++;
                targetRow.lastIndex = index;
            }
            stageData[i] = targetRow;
        }
        return stageData;
    }

    static RecalculateStageData(stageData){
        if (stageData == undefined){console.log("ERROR: RecalculateStageData() recieved undefined input..."); return stageData;}
        const sizeOfArray = stageData.length
        if (sizeOfArray <= 5){return stageData;}
        let stageDataSum = structuredClone(defaultStageHeadRow);
        // Sums up all data in dataRows into stageDataSum
        for(let i = 5; i < sizeOfArray; i++){
            if (stageData[i].hasOwnProperty("redChest")){stageDataSum.redChest += stageData[i].redChest;}
            if (stageData[i].hasOwnProperty("blueChest")){stageDataSum.blueChest += stageData[i].blueChest;}
            if (stageData[i].hasOwnProperty("extraChest")){stageDataSum.extraChest += stageData[i].extraChest;}
            if (stageData[i].hasOwnProperty("itemList")){stageDataSum.itemList = addItemList(stageDataSum.itemList, stageData[i].itemList);}
            stageDataSum.kills++;
        }
        // Sets all header rows to have the full sum of all data
        for(let i = 0; i < 5; i++){
            stageData[i] = structuredClone(stageDataSum);
        }
        // Uses a sliding window to rebalance header rows and remove data outside of proper period
        stageData = DataProcessor.BalanceStageData(stageData)
        return stageData;
    }

    /**
     * Recalculates all stage data which will fix errors in any running counts
     * @param {string[]} stageNames
     */
    static async RecalculateStageDataAll(stageNames){
        return new Promise(async (resolve, reject) => {
            try {
                var stagesBalanced = 0;
                for (let stageName of stageNames){
                    let stageData = await storageProxy.get(stageName);
                    if (stageData == undefined){continue};
                    var balancedData = DataProcessor.RecalculateStageData(stageData);
                    if (balancedData != undefined){
                        stagesBalanced++;
                        storageProxy.save({[stageName]: balancedData})
                    }
                    // console.log(stageName, balancedData);
                }
                resolve("Recounted the data for " + stagesBalanced + " stages...");
            }
            catch (ex) {
                reject(ex);
            }
        })
    }
}

/**
 * Synchronizes read/write events to prevent race conditions
 */
class StorageProxy{
    constructor(){
        /** A queue of objects waiting to be written to local storage @type {object[]} */
        this.writeRequestQueue = [];
        /** Set to true when an object in the writeRequestQueue is being processed by processRequest() @type {boolean} */
        this.writeProtectFlag = false;
        return this;
    }

    async processRequest(){
        this.writeProtectFlag = true;
        while (this.writeRequestQueue.length > 0){
            const obj = this.writeRequestQueue.shift();
            // console.log("SAVING NEW OBJECT: ", obj);
            await this.saveObjectInLocalStorage(obj);
        }
        this.writeProtectFlag = false;
    }

    async get(key){
        const writeRequestQueueCopy = this.writeRequestQueue.slice();
        while(writeRequestQueueCopy.length > 0){
            let object = writeRequestQueueCopy.pop()
            if (object.hasOwnProperty(key)){
                return object[key];
            }
        };
        return this.getObjectFromLocalStorage(key);
    }

    async save(obj){
        this.writeRequestQueue.push(obj);
        if (!this.writeProtectFlag){this.processRequest();}
    }

    /* Returns object from chrome's local storage */
    async getObjectFromLocalStorage(key) {
        return new Promise((resolve, reject) => {
            try {
                chrome.storage.local.get(key, function (value) {
                    resolve(value[key]);
                });
            } catch (ex) {
                console.log(ex);
                reject(ex);
            }
        });
    };
    
    /* Stores object from chrome's local storage */
    async saveObjectInLocalStorage(obj) {
        return new Promise((resolve, reject) => {
            try {
                chrome.storage.local.set(obj, function () {
                    resolve("Saved new object");
                });
            } catch (ex) {
                console.log(ex);
                reject(ex);
            }
        });
    };
}

/**
 * Merges like values of 2 JSONs and returns the combined result
 * @param {JSON} item1 
 * @param {JSON} item2 
 * @returns {JSON}
 */
function addItemList(item1, item2) {
    for (let key in item2) {
        if (item1.hasOwnProperty(key)) {
            item1[key] = +item1[key] + +item2[key];
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
 * @returns {JSON}
 */
function subtractItemList(item1, item2){
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


// Handle messages from extension pages
function handleMessage(request, sender, sendResponse) {
    // console.log(request);
    let message = request.message;
    let action = message.action;
    let params = message.params;
    // console.log("A content script sent a message: " + message);
    switch (action) {
        case "setData":
            if (params.data == undefined) {
                // console.log(message);
                sendResponse({ response: "Message was missing either location or data" });
                return;
            }
            /** If settings were changed, updates the time the last tracker timer was set. This is used for balancing stage data */
            if (params.data.hasOwnProperty("Settings") && params.data.Settings.hasOwnProperty("timerStart")){timerStart = params.data.Settings.timerStart;}
            storageProxy.save(params.data);
            sendResponse({ response: "Added data to write queue" });
            break;
        case "getData":
            if (params.storageKey == undefined) {
                sendResponse({ response: "Message was missing location" });
            }
            // console.log("Getting data for: " + params.storageKey);
            storageProxy.get(params.storageKey).then((result) => {
                if (params.isStageData){
                    result = DataProcessor.BalanceStageData(result);
                }
                sendResponse({ response: result });
            });
            break;
        case "recalculateData":
            if (params.data == undefined){
                sendResponse({ response: "Message was missing data" });
            }
            DataProcessor.RecalculateStageDataAll(params.data).then((result) =>{
                sendResponse({ response: result });
            });
            break;

        default:
            console.log("Request sent to background script was not recognized. Request received: " + action);
    }
    return true;
}

async function CheckForUpdate() {
    let settings = await storageProxy.get("Settings");
    if (settings == undefined) { console.log("Settings were never initialized"); return; }
    if (!settings.hasOwnProperty("timeCheckedLastVersion")) { // Settings were initialized, but it was before this feature was added
        settings.timeCheckedLastVersion = Date.now();
        await storageProxy.save({ ["Settings"]: settings });
    }
    else if (settings.timeCheckedLastVersion > Date.now() - 1200000) {return;} // Game checked in last 20 minutes
    settings.timeCheckedLastVersion = Date.now();
    await storageProxy.save({ ["Settings"]: settings }); // Updates the last time that an update was checked
    const apiUrl = 'https://api.github.com/repos/granbluetracker/Granblue-Fantasy-Tracker/releases/latest';
    const options = {
        "method": "GET",
        "header": {
            "User-Agent": "Granblue-Fantasy-Tracker",
            "Accept": "application/vnd.github+json",
            "X-Github-Api-Version": "2022-11-28",
        }
    }
    // Make a request to the GitHub Releases API
    fetch(apiUrl, options)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch latest release: ", response.status, response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            let latestVersion = data.tag_name;
            latestVersion = latestVersion.substring(1); // Removes the v from the start of the version
            console.log("Latest release version: " + latestVersion);
            if (settings.hasOwnProperty("latestVersion") && settings.latestVersion == latestVersion) { console.log("Latest version was already known"); return; } // Latest version was already known
            settings.latestVersion = latestVersion;
            console.log("Latest version was updated!");
            storageProxy.save({ ["Settings"]: settings }); // Latest version saved to settings
        })
        .catch(error => {
            console.error('Error:', error.message);
        });
}

const storageProxy = new StorageProxy();

async function InitializeServiceWorker() {
    var settings = await storageProxy.get("Settings");
    if (!settings.hasOwnProperty("timerStart")){console.log("ERROR: settings did not have timerStart property set")}
    else {timerStart = settings.timerStart;}
    CheckForUpdate();
    DebuggerManager.EnableEventListeners();
    chrome.runtime.onMessage.addListener(handleMessage);
    var currentVersion = chrome.runtime.getManifest();
    currentVersion = currentVersion.version;
    console.log(`%c[v${currentVersion}]Service worker has started...`, "color:cyan;");
}

InitializeServiceWorker();