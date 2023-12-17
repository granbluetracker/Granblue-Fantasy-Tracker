console.log('%c[+]Service worker has started...', "color:lime;");
let requestLog = [];
let requestLogAll = [];



const gameUrlRegex = new RegExp("^https:\/\/game.granbluefantasy.jp");

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

var trackedRequest = []; // Tracks the last loot file info
var trackedFileLookup = [ // Unused for now, will come into play when arcarum and more free quest support gets added
  {
    "FileNameRegex" : raidRewardUrlRegex,
    "RequiredLocation" : raidResultUrlRegex
  }
];
var activeDebuggers = []; // Stores an up to date list of every debugger attached to a tab

/**********************************/
/* Listener and support functions */
/**********************************/


// Adds listeners for network events and tab changes
if (!chrome.debugger.onEvent.hasListener(NetworkListener)){
  console.log("%c[+]Activating listener on NetworkListener", "color:lime;")
  chrome.debugger.onEvent.addListener(NetworkListener);
  let networkListenerStatus = chrome.debugger.onEvent.hasListener(NetworkListener)
  console.log("%c[info]false --> " + networkListenerStatus, "color:aqua;");
}
if (!chrome.tabs.onUpdated.hasListener(TabListener)){
  console.log("%c[+]Activating listener on TabListener", "color:lime;")
  chrome.tabs.onUpdated.addListener(TabListener);
  let TabListenerStatus = chrome.tabs.onUpdated.hasListener(TabListener);
  console.log("%c[info]false --> " + TabListenerStatus, "color:aqua;");
}

// Dynamically adds/removes debugger when a tab enter/leaves granblue fantasy
function TabListener(tabId, changeInfo, tab){
  // Excludes tabs that aren't loading or are chrome extension pages
  if (!(changeInfo.status === "loading") || tab.url.startsWith("chrome-extension://")){return;}
  let isOnGame = gameUrlRegex.test(tab.url);
  let hasDebuggerAttached = activeDebuggers.some(item => item.tabId == tabId);
  if (isOnGame && !hasDebuggerAttached) {
    AddDebugger(tabId);
  }
  else if (!isOnGame && hasDebuggerAttached) {
    RemoveDebugger({"tabId":tabId});
  }
}

// Attaches debugger to target tab
function AddDebugger(tabId) {
  try {
    chrome.debugger.attach({
      tabId: tabId
    }, "1.0", onAttach.bind(null, tabId));
  }
  catch(error){
    console.log("%c[error]Results tab already has a debugger attached...", "color:red;", error);
  }
}

// Enables network events on debugged tab. These events are listened to by the NetworkListener() function
function onAttach(tabId) {
  try{
    console.log("%c[+]New debugger added to: " + tabId, "color:lime;");
    chrome.debugger.sendCommand({ 
      "tabId": tabId
    }, "Network.enable");
    console.log("%c[+]Network Enabled. Waiting for response", "color:lime;");
    chrome.debugger.getTargets(async function (result){
      activeDebuggers = result.filter(function(e){return e.attached==true})
      console.log("%c[info]Active debuggers updated: ", "color:aqua;", activeDebuggers);
    })
  }
  catch(error){
    console.log("An error occured at onAttach...", error);
    chrome.debugger.getTargets(async function (result){
      activeDebuggers = result.filter(function(e){return e.attached==true})
      console.log("%c[info]Active debuggers updated: ", "color:aqua;", activeDebuggers);
    })
  }
}

// Removes debugger from target tab
async function RemoveDebugger(debuggeeId){
  try{
    // Creates bool that shows if the debuggeeId has a debugger attached
    let hasDebugger = activeDebuggers.filter(function(e){return e.tabId==debuggeeId.tabId}).length > 0;
    if (hasDebugger){
      console.log("%c[-]Removing debugger from tab: ", "color:red;", debuggeeId);
      requestLog = [];
      requestLogAll = [];
      await chrome.debugger.detach(debuggeeId);
      await chrome.debugger.getTargets(function (result){
        activeDebuggers = result.filter(function(e){return e.attached==true})
        console.log("%c[info]Active debuggers updated: ", "color:aqua;", activeDebuggers);
      });
    }
  }
  catch(error){console.log("%c[error]Debugger was already detatched... ", "color:red;", error)}
}

/************************************************************************/
/* [Step 1] Functions that retrieve all files of interest from the game */
/************************************************************************/

// Listens to all network messages coming from debugged tabs
async function NetworkListener(debuggeeId, message, params){
  if (message == "Network.requestWillBeSent" && rewardUrlRegex.test(params.request.url)){
    console.log("%c[Step 1] RETRIEVING DATA", "color:coral;");
    console.log("%c[1.1]Request found that matches file URL", "color:coral;");
    //let tabUrl = await chrome.tabs.get(debuggeeId.tabId);
    //tabUrl = tabUrl.url;
    //if (raidResultUrlRegex.test(tabUrl)){
      // This message is the start of an actual loot result file. Add to the stack
      console.log("%c[1.2]detected requestWillBeSent from: " + params.request.url, "color:coral;");
      trackedRequest = [params.requestId, debuggeeId.tabId, Date.now()];
      requestLog.push([message, 0, params, debuggeeId.tabId]);
    //  console.log("Request passed URL check with: " + tabUrl);
    //}
    //else {console.log("Request didn't pass URL check: " + tabUrl);}
    return;
  }
  else if (params.requestId != trackedRequest[0]){return;}
  requestLog.push([message, 0, params, debuggeeId.tabId]);
  if (message == "Network.loadingFinished"){
    console.log("%c[1.3]loadingFinished event matched requestId. Congrats!", "color:coral;");
    await sendCommandPromise(debuggeeId.tabId, params)
    .then((response) => {
      console.log("%c[1.4]Succeeded in getting data!", "color: coral;");
      console.log("%c[info]Message chain for retrieved file", "color:coral;", requestLog);
      ProcessRewardJSON(response);
      requestLog = [];
      }).catch((error) => {
      console.log("%cError occured fetching loot data file: ", error, "color:red;");
    });
  }
}

// Function to return response body and handle errors that may arrise
function sendCommandPromise(tabId, params) {
  return new Promise((resolve, reject) => {
    try{
      chrome.debugger.sendCommand(
        {"tabId" : tabId
      }, "Network.getResponseBody", {
        "requestId": params.requestId
      }, function(response) {
        if (chrome.runtime.lastError){
          reject(chrome.runtime.lastError);
        }
        else if (!response || !response.body) {
          console.error("Response was empty");
          reject(new Error("Response was empty"));
        }
        else {resolve(response);}
      });
    }
    catch(ex){
      console.log("Error fetching resource");
      reject(ex)
    }
  });
}


/*****************************************************/
/* [Step 2] Functions to process any retrieved files */
/*****************************************************/

// Processes and stores the reward data recieved from the server
async function ProcessRewardJSON(response){
  // Changes response body from string to JSON and extracts + stores relevant data
  console.log("%c[Step 2] PROCESSING DATA", "color:cornflowerblue;");
  try{
    var body = JSON.parse(response.body);
    if (!body.option.hasOwnProperty("result_data")){ // Returns if enemy didn't drop any loot
      console.log("%c[!]Boss did not drop any rewards", "color:orange;");
      return;
    }
    var body = body.option.result_data;
    var rewardList = body.rewards.reward_list;
    console.log("%c[2.1]Parsed rewards list:", "color:cornflowerblue;", rewardList);
    // Build row to send
    var tableEntry = BuildTableEntry(rewardList);
    // Finds the enemy name
    var enemyName = FindEnemyName(tableEntry.itemList, body.quest_type, body.url)
    if (enemyName == "Unknown"){console.log("%c[!]Enemy was unknown", "color:orange;"); return;}
    console.log("%c[2.5]Enemy name found: " + enemyName, "color:cornflowerblue;");
    StoreRow(enemyName, tableEntry);
  }
  catch (error){console.log("%c[error]A problem occured while processing reward data...", "color:red;", error);}
}

// Processes the reward_list JSON into the format that will be stored
function BuildTableEntry(rewardList){
  console.log("%c[2.2]Building table entry", "color:cornflowerblue;");
  // Build row to send
  var tableEntry = {epochTime: Date.now(), blueChest: 0, redChest: 0, itemList: {}}
  var tempItemList = {};
  for (let row in rewardList){ // Iterates over arrays 1-15 in the reward list
    let tableRow = rewardList[row];
    for (let element in tableRow){
      var item = tableRow[element];
      var itemCount = item.count;
      // adds prefix to items that need one
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
      
      // Adds processed item if it's ID is not already in the item list
      if (!tempItemList.hasOwnProperty(itemId)){tempItemList[itemId] = +itemCount;}
      // Merges item totals if it's ID is already in the item list
      else {tempItemList[itemId] += +itemCount;}
    }
  }
  tableEntry.itemList = tempItemList;
  console.log("%c[2.3]Built table entry", "color:cornflowerblue;", tableEntry);
  return tableEntry;
}

// Finds the name of the enemy by determining which can produce the data captured in step 1
function FindEnemyName(lootList, battleType, returnUrl){
  console.log("%c[2.4]Finding enemy name", "color:cornflowerblue;");
  // Uses loot and the type of battle to determine which enemy it came from
  var lootList = Object.keys(lootList);
  switch(battleType){
    // 1 = raid, 25 = sandbox
    case 1:
      // instant: If the loot has one, it must be this boss
      // required: This item must be in the list
      // or: at least one item of this type must be in the list
      // prohibit: none of these items can be in the list
      // "Boss Name" : [[instant],[required],[or],[prohibit]],
      var lootSignature = {
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
      for (let boss in lootSignature){
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
      return "Unknown";
    case 25:
      // Orb, orb+, tome, scroll, veritas(s)
      var elementSignature = {
        "Fire" : ["1011", "1012", "1311", "1312", "25051", "25055"],
        "Water" : ["1021", "1022", "1321", "1322", "25047", "25054"],
        "Earth" : ["1031", "1032", "1331", "1332", "25048", "25052"],
        "Wind" : ["1041", "1042", "1341", "1342", "25050", "25056"],
        "Light" : ["1051", "1052", "1351", "1352", "25053"],
        "Dark" : ["1061", "1062", "1361", "1362", "25049"],
      };
      var lusters = ["25070", "25071", "25072", "25073"];
      var doppelworldBosses = {
        "replicard/stage/6":"Xeno Ifrit Militis", "replicard/stage/7":"Xeno Cocytus Militis", "replicard/stage/8":"Xeno Vohu Manah Militis", "replicard/stage/9":"Xeno Sagittarius Militis"
      };
      var swordsBosses = {
        "replicard/stage/6":"Athena Militis", "replicard/stage/7":"Grani Militis", "replicard/stage/8":"Baal Militis", "replicard/stage/9":"Garuda Militis"
      };
      var swordsBossMats = ["25075", "25076", "25077", "25078", "25079", "25080", "25081", "25082"]
      var genesisBosses = {
        "25017":"The World", "25085":"Prometheus Militis", "25086":"Ca Ong Militis", "25085":"Gilgamesh Militis", "25085":"Morrigna Militis"
      };
      var zones = {
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
        for (let element in elementSignature){
          if (elementSignature[element].some(r=> lootList.includes(r))){return zones[returnUrl] + " " + element;}
        }
      }
      // Zone M
      if (returnUrl == "replicard/stage/10"){
        console.log(returnUrl+" is in zone M");
        for (let id in genesisBosses){
          if (lootList.includes(id)){return genesisBosses[id]}
        }
        for (let element in elementSignature){
          if (elementSignature[element].some(r=> lootList.includes(r))){return zones[returnUrl] + " " + element;}
        }
      }
      return "Unknown";
  } 
}

// Perminantly stores the reward info in the table for a boss
async function StoreRow(key, value){
  console.log("%c[2.6]Storing table entry", "color:cornflowerblue;");
  var table = await getObjectFromLocalStorage(key);
  // Builds new table if it does not exist
  if (table == null){
    console.log("%c[info]Table was not found. Building new table...", "color:orange;")
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
  console.log("%c[2.7]Table entry was successfully stored", "color:cornflowerblue;");
}

/*****************************************/
/* Functions to help debug the extension */
/*****************************************/

// Gets all active debuggers and prints them if the variable activeDebuggers isn't correct
function printActiveDebuggers(printAll) {
  chrome.debugger.getTargets(function (result){
    if (printAll){result = result.filter(function(e){return e.attached==true})}
    console.log(result);
  });
}

/*********************************/
/* Lower level support functions */
/*********************************/

// Merges like values of 2 JSONs and returns the combined result
function mergeItemList(item1, item2){
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

/* Returns object from chrome's local storage */
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

/* Stores object from chrome's local storage */
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