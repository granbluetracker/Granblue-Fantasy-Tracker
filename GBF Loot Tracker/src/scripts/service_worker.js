console.log('Service worker has started...');
let requestLog = [];
let requestLogAll = [];

const debuggerTimeoutDurationMS = 5000;
const loadingFinishedDelayMS = 100;

const soloResultUrlRegex = new RegExp("^https:\/\/game.granbluefantasy.jp\/#result\/\\d{10}"); // Regex for a url on the solo fight result page
const raidResultUrlRegex = new RegExp("^https:\/\/game.granbluefantasy.jp\/#result_multi\/\\d{11}"); // Regex for a url on the raid result page
// Regex for a url on ANY fight result page
const resultUrlRegex = new RegExp("^https:\/\/game.granbluefantasy.jp\/#result\/\\d{10}|^https:\/\/game.granbluefantasy.jp\/#result_multi\/\\d{11}");
const raidRewardUrlRegex = new RegExp("^https:\/\/game.granbluefantasy.jp\/resultmulti\/content\/index\/\\d{11}"); // Regex for the request url containing raid battle data
const soloRewardUrlRegex = new RegExp("^https:\/\/game.granbluefantasy.jp\/result\/data\/\\d{10}"); // Regex for the request url containing solo battle data
 // Regex for the request url containing ANY battle data
const rewardUrlRegex = new RegExp("^https:\/\/game.granbluefantasy.jp\/result\/data\/\\d{10}|^https:\/\/game.granbluefantasy.jp\/resultmulti\/content\/index\/\\d{11}");
const sandboxStavesRegex = new RegExp("^replicard\/stage\/[2-5]"); // Sandbox zone E-H URL
const sandboxSwordsRegex = new RegExp("^replicard\/stage\/[6-9]"); // Sandbox zone I-L URL
const sandboxGenesisRegex = new RegExp("^replicard\/stage\/10"); // Sandbox zone M URL

var debuggerTimeout; // Where the debugger timeout is stored so that it can be set and removed in different scopes
var isRequesting = false; // Lock that will stop the extension from processing a battle twice if the game sends duplicate loadingFinished messages
var targetTabId = 0; // Tells NetworkListener() to ignore all messages not coming from this tabId
var requestId = "0.0"; // Var that will store the request ID for the loot table

// Adds event listener to function to listen to events from debugged tabs
if (!chrome.debugger.onEvent.hasListener(NetworkListener)){
  console.log("Activating listener on NetworkListener")
  chrome.debugger.onEvent.addListener(NetworkListener);
  listenerStatus = chrome.debugger.onEvent.hasListener(NetworkListener)
  console.log("false --> " + listenerStatus);
}

/* Monitors the state of all tabs and attaches debugger when a tab is on a loot screen */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  // Returns if tab hasn't finished loading or isn't on results screen
  // Use "loading" instead of "complete" so you won't miss the "Network.requestWillBeSent" message for the battle results JSON
  // If you don't, around 10% of the time the "Network.enable" command won't make it in time!
  if (!(changeInfo.status === "loading") || !resultUrlRegex.test(tab.url)){return;}
  try {
    chrome.debugger.attach({
      tabId: tabId
    }, "1.0", onAttach.bind(null, tabId));
    console.log("Tab is on results: " + tab.url, "\n[1]Valid target found that matches: " + tabId, "Attempting to attach..");
  }
  catch(error){
    console.log("Results tab already has a debugger attached...", error);
    console.log("This can happen if loot data was somehow missed and timeout did not yet expire. \nRemoving and restarting timeout to catch new rewards screen...");
    if (debuggerTimeout){
      clearTimeout(debuggerTimeout);
      debuggerTimeout = setTimeout(function() {RemoveDebugger({"tabId": tabId}, false);}, debuggerTimeoutDurationMS);
    }
  }
});

/**
 * Handles attatched debugger and facilitates the transfer of game data to local storage
 * @param {int} tabId
 */
function onAttach(tabId) {
  try{
    isRequesting = false; // Opens lock
    targetTabId = tabId; // Tells NetworkListener to capture packets from this tab
    // Turns on the network library
    console.log("[2]Debugger is attached. Enabling network commands...")
    chrome.debugger.sendCommand({ 
      "tabId": tabId
    }, "Network.enable");
    console.log("Network Enabled. Waiting for response");
    // Removes debugger automatically after 5 seconds
    debuggerTimeout = setTimeout(function() {RemoveDebugger({"tabId": tabId}, true);}, debuggerTimeoutDurationMS);
  }
  catch(error){console.log("An error occured at onAttach...", error);}
}

var responseReceivedEpoch = 0;

// Listens to all network messages coming from debugged tabs
function NetworkListener(debuggeeId, message, params){
  if(debuggeeId.tabId != targetTabId){return;}
  requestLogAll.push([message, params, debuggeeId.tabId]);
  if (message == "Network.responseReceived" && rewardUrlRegex.test(params.response.url)){
    requestId = params.requestId;
    requestLog.push([message, 0, params, debuggeeId.tabId]);
    console.log("RequestId found: " + requestId + " " + params.requestId);
    responseReceivedEpoch = Date.now();
    return;
  }
  if (params.requestId != requestId){return;}
  requestLog.push([message, Date.now() - responseReceivedEpoch, params, debuggeeId.tabId]);
  // When the reward JSON finishes loading, requests it
  if (message == "Network.loadingFinished"){
    // Checks and sets lock to prevent multiple requests to the tab for data
    if (isRequesting){return;}
    isRequesting = true;
    // Sends the command to grab the reward data JSON
    console.log("Time Between = " + (Date.now() - responseReceivedEpoch));
    setTimeout(() => { // Delays fetching response body so that it is ready
    console.log("Loading is finished!", "RequestId = " + params.requestId + " " + requestId, [message, params, debuggeeId.tabId], requestLog);
    chrome.debugger.sendCommand({
      "tabId" : debuggeeId.tabId
    }, "Network.getResponseBody", {
      "requestId": params.requestId
    }, function(response) {
      // Processes the reward data if response had a body
      if (response == undefined){
        console.log("Response body was empty... WTF!");
        console.log("Response Recieved at: " + responseReceivedEpoch)
        console.log("Time since first message: " + (Date.now() - responseReceivedEpoch));
        console.log(requestLog, requestLogAll);
        clearTimeout(debuggerTimeout); // Removes timeout so that RemoveDebugger doesn't activate prematurely if you open another reward screen
        RemoveDebugger(debuggeeId, false);
      }
      else {
        ProcessRewardJSON(debuggeeId.tabId, response);
        console.log("Successfully exiting with debugeeId: ", debuggeeId);
        clearTimeout(debuggerTimeout); // Removes timeout so that RemoveDebugger doesn't activate prematurely if you open another reward screen
        RemoveDebugger(debuggeeId, false);
      }
    });
    }, loadingFinishedDelayMS);
  }
}

// Processes and stores the reward data recieved from the server
async function ProcessRewardJSON(tabId, response){
  // Changes response body from string to JSON and extracts + stores relevant data
  try{
    body = JSON.parse(response.body);
    body = body.option.result_data;
    rewardList = body.rewards.reward_list;
    console.log("Parsed rewards list:", rewardList);
    // Build row to send
    var tableEntry = BuildTableEntry(rewardList);
    // Finds the enemy name
    enemyName = FindEnemyName(tableEntry.itemList, body.quest_type, body.url)
    if (enemyName == "Unknown"){console.log("Enemy was unknown"); return;}
    console.log("Enemy was determined to be: " + enemyName);
    StoreRow(enemyName, tableEntry);
  }
  catch (error){console.log("Error was found while processing reward data...", error);}
}

/**
 * formats the game's "reward_list" array so that it can be efficiently stored
 * @param {Array} rewardList
 */
function BuildTableEntry(rewardList){
  console.log("Building table entry: ");
  // Build row to send
  var tableEntry = {epochTime: Date.now(), blueChest: 0, redChest: 0, itemList: {}}
  tempItemList = {};
  for (row in rewardList){ // Iterates over arrays 1-15 in the reward list
    tableRow = rewardList[row];
    for (element in tableRow){
      var item = tableRow[element];
      var itemCount = item.count;
      // adds prefix to item depending on the type
      switch(item.item_kind){
        case 4:
          var itemType = "stam";
          break;
        case 73:
          var itemType = "emp";
          break;
        case 88:
          var itemType = "bonus";
          break;
        default:
          var itemType = "";
          break;
      }
      var itemId = itemType + item.id;
      // Checks if item is in a blue or red chest
      if (row == 4){tableEntry.redChest += 1;}
      if (row == 11){tableEntry.blueChest += 1;}
      
      // If the item in the reward list is not stored in the item list
      if (!tempItemList.hasOwnProperty(itemId)){tempItemList[itemId] = +itemCount;}
      // If the item already exists in the item list, merge them
      else {tempItemList[itemId] += +itemCount;}
    }
  }
  tableEntry.itemList = tempItemList;
  console.log(tableEntry);
  return tableEntry;
}

// Removes debugger
function RemoveDebugger(debuggeeId, dumpRequestLog){
  // Gets all tabs with debugger attached
  try{
  chrome.debugger.getTargets(async function (result){
    // Creates bool that shows if the debuggeeId has a debugger attached
    hasDebugger = result.filter(function(e){return e.attached==true}).filter(function(e){return e.tabId==debuggeeId.tabId}).length > 0;
    if (dumpRequestLog){await PrintDebugState(requestLog, requestLogAll)}
    if (hasDebugger){
      console.log("\n[4]Removing debugger from tab: ", debuggeeId);
      targetTabId = 0; // Resets the targeted tab used by NetworkListener()
      await chrome.debugger.sendCommand({ 
        "tabId": debuggeeId.tabId
      }, "Network.disable");
      requestLog = [];
      requestLogAll = [];
      // await chrome.debugger.getTargets(function (result){console.log("Target list before: ", result.filter(function(e){return e.attached==true}))});
      await chrome.debugger.detach(debuggeeId);
      // await chrome.debugger.getTargets(function (result){console.log("Target list after: ", result.filter(function(e){return e.attached==true}))});
    }
  })}
  catch(error){console.log("Debugger was already detatched... ", error)}
}

async function PrintDebugState(requestLog, requestLogAll) {
  console.log("Is requesting lock state: " + isRequesting);
  console.log("Current Target Tab Id: " + targetTabId);
  console.log("Current request Id: " + requestId);
  console.log("All logged requests: ", requestLogAll);
  console.log("logged requests for drop: ", requestLog);
}

/**
 * Stores data from a battle using the enemy name as a key
 * @param {string} key
 * @param {JSON} value 
 */
async function StoreRow(key, value){
  var table = await getObjectFromLocalStorage(key);
  // Builds new table if it does not exist
  if (table == null){
    console.log("Table was not found. Building new table...")
    var table = new Array();
    defaultHead = Object.assign({}, value);
    // Adds killcount + lastIndex and deletes epochTime field from header rows
    defaultHead.kills = 1;
    defaultHead.lastIndex = 5;
    delete defaultHead["epochTime"];
    // Builds table with 5 rows containing values from first kill
    // Rows in order are stored Total, CurrentGrind, Monthly, Weekly, Daily
    for(var i=0; i<=4; i++){
        table[i] = Object.assign({}, defaultHead);
    }
    // Adds first kill details to row 5
    table[5] = value;
  }

  else {
      for (let i = 0; i <=4; i++){
        table[i].kills += 1;
        table[i].blueChest += value.blueChest;
        table[i].redChest += value.redChest;
        table[i].itemList = mergeItemList(table[i].itemList, value.itemList);
      }
  }

  // Adds new row to table
  table[table.length] = value;
  await saveObjectInLocalStorage({[key]: table});
  console.log("Boss data was added to storage...")
}

/**
 * Merges 2 JSONs together combining like values
 * @param {JSON} item1
 * @param {JSON} item2 
 */
function mergeItemList(item1, item2){
  for(key in item2){
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
 * Lookup an enemy name using their loot
 * @param {JSON} lootList
 * @param {boolean} isRaid 
 */
function FindEnemyName(lootList, battleType, returnUrl){
  // Uses loot and the type of battle to determine which enemy it came from
  lootList = Object.keys(lootList);
  switch(battleType){
    // 1 = raid, 25 = sandbox
    case 1:
      // instant: If the loot has one, it must be this boss
      // required: This item must be in the list
      // or: at least one item of this type must be in the list
      // prohibit: none of these items can be in the list
      // "Boss Name" : [[instant],[required],[or],[prohibit]],
      lootSignature = {
        "Proto Bahamut" :[["1030202400", "1030702300", "1030302000", "1030102500", "1030402200", "1030601400", "1030002900", "1030900600", "1030801200", "1030502500"],[],[],[]],
        "Proto Bahamut HL" :[["59", "79"],[],[],[]],
        "Ultimate Bahamut" :[["137", "139"],[],[],[]],
        "Ultimate Bahamut HL" : [["138"],[],[],[]],
        "Akasha" : [["534"],[],[],[]],
        "Grand Order HL" : [["546"],[],[],[]],
        "Grand Order" : [["83", "84"],[],[],[]],
        "Super Ultimate Bahamut" : [["572"],[],[],[]],
        "Lindwurm" : [["547"],[],[],[]],
        "Lucilius" : [["536", "537"],[],[],[]],
        "Lucilius (Hard)" : [["538"],[],[],[]],
        "Beelzebub" : [["555"],[],[],[]],
        "Belial" : [["570"],[],[],[]],
        "Atum" : [["575", "576"],[],[],[]],
        "Tefnut" : [["577", "578"],[],[],[]],
        "Bennu" : [["579", "580"],[],[],[]],
        "Ra" : [["581", "582"],[],[],[]],
        "Horus" : [["574", "583"],[],[],[]],
        "Osiris" : [["573", "584"],[],[],[]],
        "Wilnas" : [[],["557"],[],["592"]],
        "Wamdus" : [[],["558"],[],["592"]],
        "Galleon" : [[],["559"],[],["592"]],
        "Ewiyar" : [[],["560"],[],["592"]],
        "Lu Woh" : [[],["561"],[],["592"]],
        "Fediel" : [[],["562"],[],["592"]],
        "Hexachromatic Hierarch" : [["592"],["562"],[],[]],
        "Mugen" : [["586"],[],[],[]],
        "Diaspora" : [["585"],[],[],[]],
        "Siegfried" : [["587"],[],[],[]],
        "Seofon" : [["589"],[],[],[]],
        "Cosmos" : [["590"],[],[],[]],
        "Agastia" : [["588"],[],[],[]],
        "Huanglong and Qilin" : [["528", "529", "530", "531"],[],[],[]],
        "Huanglong" : [["206"],[],[],["528", "529", "530", "531"]],
        "Qilin" : [["208"],[],[],["528", "529", "530", "531"]],
        "Tyrant" : [["10116"],[],[],[]],
      }
      for (boss in lootSignature){
        // If there is an instant field, you can decide if it is the right boss instantly
        if (lootSignature[boss][0].length>0){
            if(lootSignature[boss][0].some(r=> lootList.includes(r))){return boss}
            else {continue;}
        }  
        if (lootSignature[boss][1].length>0 && !lootSignature[boss][1].some(r=> lootList.includes(r))){continue;}
        if (lootSignature[boss][2].length>0 && !lootSignature[boss][2].some(r=> lootList.includes(r))){continue;}
        if (lootSignature[boss][3].length>0 && lootSignature[boss][3].some(r=> lootList.includes(r))){continue;}
        return boss;
      }
      // Did not match any known loot signature
      return "Unknown"
    case 25:
      // Orb, orb+, tome, scroll, veritas(s)
      elementSignature = {
        "Fire" : ["1011", "1012", "1311", "1312", "25051", "25055"],
        "Water" : ["1021", "1022", "1321", "1322", "25047", "25054"],
        "Earth" : ["1031", "1032", "1331", "1332", "25048", "25052"],
        "Wind" : ["1041", "1042", "1341", "1342", "25050", "25056"],
        "Light" : ["1051", "1052", "1351", "1352", "25053"],
        "Dark" : ["1061", "1062", "1361", "1362", "25049"],
      }
      lusters = ["25070", "25071", "25072", "25073"]
      doppelworldBosses = {
        "replicard/stage/6":"Xeno Ifrit Militis", "replicard/stage/7":"Xeno Cocytus Militis", "replicard/stage/8":"Xeno Vohu Manah Militis", "replicard/stage/9":"Xeno Sagittarius Militis"
      };
      swordsBosses = {
        "replicard/stage/6":"Athena Militis", "replicard/stage/7":"Grani Militis", "replicard/stage/8":"Baal Militis", "replicard/stage/9":"Garuda Militis"
      };
      swordsBossMats = ["25075", "25076", "25077", "25078", "25079", "25080", "25081", "25082"]
      genesisBosses = {
        "25017":"The World", "25085":"Prometheus Militis", "25086":"Ca Ong Militis", "25085":"Gilgamesh Militis", "25085":"Morrigna Militis"
      }
      zones = {
      "replicard/stage/2":"Zone Eletio", "replicard/stage/3":"Zone Faym", "replicard/stage/4":"Zone Goliath", "replicard/stage/5":"Zone Harbinger", 
      "replicard/stage/6":"Zone Invidia", "replicard/stage/7":"Zone Joculator", "replicard/stage/8":"Zone Kalendae", "replicard/stage/9":"Zone Liber",
      "replicard/stage/10":"Zone Mundus",
      };
      // Zones E-H
      if (sandboxStavesRegex.test(returnUrl)){console.log(returnUrl+" is in zone E-H");return zones[returnUrl];}
      // Zones I-L
      if (sandboxSwordsRegex.test(returnUrl)){
        console.log(returnUrl+" is in zone I-L");
        if (lusters.some(r=> lootList.includes(r))){
          if (swordsBossMats.some(r=> lootList.includes(r))){return doppelworldBosses[returnUrl]}
          else{return swordsBosses[returnUrl]}
        }
        for (element in elementSignature){
          if (elementSignature[element].some(r=> lootList.includes(r))){return zones[returnUrl] + " " + element;}
        }
      }
      // Zone M
      if (returnUrl == "replicard/stage/10"){
        console.log(returnUrl+" is in zone M");
        for (id in genesisBosses){
          if (lootList.includes(id)){return genesisBosses[id]}
        }
        for (element in elementSignature){
          if (elementSignature[element].some(r=> lootList.includes(r))){return zones[returnUrl] + " " + element;}
        }
      }
      return "Unknown";
  } 
}

/** API for chrome storage */
/**
 * Retrieve object from Chrome's Local StorageArea
 * @param {string} key 
 */
const getObjectFromLocalStorage = async function(key) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(key, function(value) {
        resolve(value[key]);
      });
    } catch (ex) {
      console.log(ex);
      reject(ex);
    }
  });
};

/**
 * Save Object in Chrome's Local StorageArea
 * @param {*} obj 
 */
const saveObjectInLocalStorage = async function(obj) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set(obj, function() {
        resolve();
      });
    } catch (ex) {
      console.log(ex);
      reject(ex);
    }
  });
};