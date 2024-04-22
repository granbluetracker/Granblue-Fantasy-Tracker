let requestLog = [];
let requestLogAll = [];

var currentVersion = chrome.runtime.getManifest();
currentVersion = currentVersion.version;
console.log(`%c[v${currentVersion}]Service worker has started...`, "color:cyan;");


const gameUrlRegex = new RegExp("^https:\/\/game.granbluefantasy.jp");
const extensionUrlRegex = new RegExp("^chrome:\/\/extensions\/|^chrome-extension:\/\/")

const soloResultUrlRegex = new RegExp("^https:\/\/game.granbluefantasy.jp\/#result\/\\d{10}"); // Regex for a url on the solo fight result page
const raidResultUrlRegex = new RegExp("^https:\/\/game.granbluefantasy.jp\/#result_multi\/\\d{11}"); // Regex for a url on the raid result page
// Regex for a url on ANY fight result page
const resultUrlRegex = new RegExp("^https:\/\/game.granbluefantasy.jp\/#result\/\\d{10}|^https:\/\/game.granbluefantasy.jp\/#result_multi\/\\d{11}");
const raidRewardUrlRegex = new RegExp("^https:\/\/game.granbluefantasy.jp\/resultmulti\/content\/index\/\\d{11}"); // Regex for the request url containing raid battle data
const soloRewardUrlRegex = new RegExp("^https:\/\/game.granbluefantasy.jp\/result\/content\/index\/\\d{10}"); // Regex for the request url containing solo battle data
 // Regex for the request url containing ANY battle data
const rewardUrlRegex = new RegExp("^https:\/\/game.granbluefantasy.jp\/result\/content\/index\/\\d{10}|^https:\/\/game.granbluefantasy.jp\/resultmulti\/content\/index\/\\d{11}");
const sandboxStavesRegex = new RegExp("^replicard\/stage\/[2-5]"); // Sandbox zone E-H URL
const sandboxSwordsRegex = new RegExp("^replicard\/stage\/[6-9]"); // Sandbox zone I-L URL
const sandboxGenesisRegex = new RegExp("^replicard\/stage\/10"); // Sandbox zone M URL
// Regex for any file containing sephira box data
const sephiraUrlRegex = new RegExp("^https:\/\/game.granbluefantasy.jp\/rest\/replicard\/sephirabok_stock_list\\?_=|^https:\/\/game.granbluefantasy.jp\/rest\/replicard\/open_sephirabox\\?_=");
const sephiraStockRegex = new RegExp("^https:\/\/game.granbluefantasy.jp\/rest\/replicard\/sephirabok_stock_list\\?_="); // File showing current chest stock
const sephiraOpenRegex = new RegExp("^https:\/\/game.granbluefantasy.jp\/rest\/replicard\/open_sephirabox\\?_="); // File showing items from opening chests 

var trackedRequest = []; // Tracks the last loot file info
var activeDebuggers = []; // Stores an up to date list of every debugger attached to a tab
const changeIconOnId = ["215", "20004"]; // If loot with these IDs are dropped, changes the extension icon
const iconChangeDuration = 300000; // How long the extension icon stays changed after a lucky drop. 300,000 ms = 5 minutes

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
  if (extensionUrlRegex.test(tab.url) && (changeInfo.status === "loading")){RefreshActiveDebuggers(); return;}
  // Excludes tabs that aren't loading or are chrome extension pages
  if (!(changeInfo.status === "loading")){return;}
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
    RefreshActiveDebuggers();
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
      await RefreshActiveDebuggers();
    }
    else{console.log("%c[-]Debugger wasn't attached: ", "color:red;", debuggeeId);}
  }
  catch(error){
    console.log("%c[error]Debugger was already detatched... ", "color:red;", error)
    RefreshActiveDebuggers();
  }
}

async function RefreshActiveDebuggers(){
  chrome.debugger.getTargets(async function (result){
    activeDebuggers = result.filter(function(e){return e.attached==true})
    console.log("%c[info]Active debuggers Refreshed: ", "color:aqua;", activeDebuggers);
  })
}

// Enables network events on debugged tab. These events are listened to by the NetworkListener() function
function onAttach(tabId) {
  try{
    console.log("%c[+]New debugger added to: " + tabId, "color:lime;");
    chrome.debugger.sendCommand({ 
      "tabId": tabId
    }, "Network.enable");
    console.log("%c[+]Network Enabled. Waiting for response", "color:lime;");
    RefreshActiveDebuggers();
  }
  catch(error){
    console.log("An error occured at onAttach...", error);
    RefreshActiveDebuggers();
  }
}

/************************************************************************/
/* [Step 1] Functions that retrieve all files of interest from the game */
/************************************************************************/

// Listens to all network messages coming from debugged tabs
async function NetworkListener(debuggeeId, message, params){
  if (message == "Network.requestWillBeSent" && (rewardUrlRegex.test(params.request.url) || sephiraOpenRegex.test(params.request.url))){
    console.log("%c[Step 1] RETRIEVING DATA", "color:coral;");
    console.log("%c[1.1]Request found that matches file URL", "color:coral;");
    let fileType = "";
    if (rewardUrlRegex.test(params.request.url)){fileType = "Battle Data"}
    else {fileType = "Sephira Results"}
    console.log("%c[1.2]detected requestWillBeSent from: " + params.request.url + " of type: " + fileType, "color:coral;");
    trackedRequest = [params.requestId, debuggeeId.tabId, fileType, Date.now()];
    requestLog.push([message, 0, params, debuggeeId.tabId]);
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
      switch(trackedRequest[2]){
        case "Battle Data":
          ProcessRewardJSON(response);
          break;
        case "Sephira Results":
          ProcessSephiraJSON(response);
          break;
        default:
          console.log("%c[error]fileType did not match any known values: " + trackedRequest[2], "color:red;");
          break;
      }
      
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
    if (!body.hasOwnProperty("option") || !body.option.hasOwnProperty("result_data")){ // Returns if enemy didn't drop any loot
      console.log("%c[!]Boss did not drop any rewards", "color:orange;");
      return;
    }
    var body = body.option.result_data;
    console.log("%c[debug]Result data: ", "color:cornflowerblue;", body);
    // var rewardList = body.rewards.reward_list;
    // console.log("%c[2.1]Parsed rewards list:", "color:cornflowerblue;", rewardList);
    // Build row to send
    var tableEntry = BuildTableEntry(body);
    // Temporarily changes extension icon if loot contained any special items (sand/bars)
    Object.keys(tableEntry.itemList).some(r => (changeIconOnId.includes(r) && setIconAction(r)))
    // Finds the enemy name
    var enemyName = FindEnemyName(tableEntry.itemList, body.quest_type, body.url)
    if (enemyName == "Unknown" || enemyName == undefined){console.log("%c[!]Enemy was " + enemyName, "color:orange;"); return;}
    console.log("%c[2.5]Enemy name found: " + enemyName, "color:cornflowerblue;");
    StoreRow(enemyName, tableEntry);
  }
  catch (error){console.log("%c[error]A problem occured while processing reward data...", "color:red;", error);}
}

// Processes the reward_list JSON into the format that will be stored
function BuildTableEntry(body){
  console.log("%c[2.2]Building table entry", "color:cornflowerblue;");
  var rewardList = body.rewards.reward_list;
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
        case 4: // Stamina / berries
          var itemType = "stam";
          break;
        case 10: // Normal items that go in your item inventory (usually)
          var itemType = "";
          break;
        case 55: // Ticket items like gold gifts or astra boxes
          var itemType = "box";
          break;
        case 73: // Rings + Earrings
          var itemType = "emp";
          break;
        case 88: // Plus Marks
          var itemType = "bonus";
          break;
        case 91: // Paladin Shields
          var itemType = "shld";
          break;
        case 93: // Manadiver pets
          var itemType = "mntr";
          break;
        // RISE OF THE BEAST ITEMS
        case 26: // Water RotB badge
          var itemType = "badge";
          item.id = "1"
          break;
        case 27: // Wind RotB badge
          var itemType = "badge";
          item.id = "2"
          break;
        case 28: // Earth RotB badge
          var itemType = "badge";
          item.id = "3"
          break;
        case 63: // Fire RotB badge
          var itemType = "badge";
          item.id = "4"
          break;
        case 85: // Golden RotB badge
          var itemType = "badge";
          item.id = "5"
          break;
        case 49: // RotB four symbols pendants (Low drop number that has it's own type)
          var itemType = "";
          itemCount = item.id;
          item.id = "90001"
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

  // Adds sephira box to reward list as an item if one drops
  if (body.quest_type == 25 && body.replicard.sephirabox_stock_data != null){
    let sephiraBoxId = "sep" + body.replicard.sephirabox_stock_data.card_number;
    tempItemList[sephiraBoxId] = 1;
    console.log("%c[info]New Sephira box detected: " + sephiraBoxId, "color:cornflowerblue;");
    UpdateSephiraStock(sephiraBoxId, body.url);
  }

  tableEntry.itemList = tempItemList;
  console.log("%c[2.3]Built table entry", "color:cornflowerblue;", tableEntry);
  return tableEntry;
}

// Finds the name of the enemy by determining which can produce the data captured in step 1
function FindEnemyName(lootListRaw, battleType, returnUrl){
  console.log("DEBUG FROM FindEnemyName(): ", lootListRaw, battleType, returnUrl);
  console.log("%c[2.4]Finding enemy name", "color:cornflowerblue;");
  // Uses loot and the type of battle to determine which enemy it came from
  var lootList = Object.keys(lootListRaw);
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
        "Dark Rapture Zero" : [["593"],[],[],[]],
        "Mugen" : [["586"],[],[],[]],
        "Diaspora" : [["585"],[],[],[]],
        "Siegfried" : [["587"],[],[],[]],
        "Seofon" : [["589"],[],[],[]],
        "Cosmos" : [["590"],[],[],[]],
        "Agastia" : [["588"],[],[],[]],
        "Huanglong and Qilin" : [["528", "529", "530", "531"],[],[],[]],
        "Huanglong" : [["206"],[],[],["528", "529", "530", "531"]],
        "Qilin" : [["208"],[],[],["528", "529", "530", "531"]],
        "Shenxian":[["badge5"],[],[],[]],
        "The World" : [["25017"],[],[],[]],
        "Tiamat Aura Omega" : [[],["612"],["10", "18", "44", "32", "104", "114", "600", "601", "5041"],[]],
        "Luminiera Credo Omega" : [[],["612"],["25", "26", "45", "50", "105", "115", "608", "609", "5051"],[]],
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
        console.log("Returning: " + boss);
        return boss;
      }
      // Difficulty: The fight is classified as this difficulty
      // required: This item must be in the list
      var RotBSignature = {
        "Xuanwu" : ["Extreme","badge1"],
        "Qinglong" : ["Extreme","badge2"],
        "Baihu" : ["Extreme","badge3"],
        "Zhuque" : ["Extreme","badge4"],
        "Neptune" : ["Extreme+","badge1"],
        "Zephyrus" : ["Extreme+","badge2"],
        "Titan" : ["Extreme+","badge3"],
        "Agni" : ["Extreme+","badge4"],
      }
      console.log("Checking if RotB");
      // Checks RotB enemies
      if (lootList.includes("90001")){
        console.log("Was RotB");
        let difficulty = "Extreme";
        if (lootListRaw["90001"] >= 200){difficulty = "Extreme+"}
        console.log("Difficulty was: " + difficulty)
        for (let boss in RotBSignature){
          if (RotBSignature[boss][0] == difficulty && lootList.includes(RotBSignature[boss][1])){
            console.log("RotB boss was: " + boss);
            return boss;
          }
        }
      }
      // Did not match any known loot signature
      return "Unknown";
    case 25:
      // Orb, orb+, tome, scroll, veritas(s)
      console.log("Return URL: " + returnUrl);
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
        "25017":"The World (Solo)", "25085":"Prometheus Militis", "25086":"Ca Ong Militis", "25085":"Gilgamesh Militis", "25085":"Morrigna Militis"
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
    default:
      console.log("%c[!]Battle type was not tracked: " + battleType, "color:orange;");
      return "Unknown";
    } 
}

// Perminantly stores the reward info in the table for a boss
async function StoreRow(key, value){
  console.log("%c[2.6]Storing table entry", "color:cornflowerblue;");
  var table = await getObjectFromLocalStorage(key);
  // Builds new table if it does not exist
  if (table == null){
    console.log("%c[!]Table was not found. Building new table...", "color:orange;")
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

function UpdateSephiraStock(boxName, returnUrl){
  try{
    console.log("%c[Step 3] Recording new sephira box drop", "color:cyan;");
    console.log("%c[2.1]Finding box ID", "color:cyan;");
    var sephiraBoxSignatures = {
      "replicard/stage/2" : {"sep15":"1", "sep19":"2", "sep17":"3"}, // Zone Eletio
      "replicard/stage/3" : {"sep11":"4", "sep18":"5", "sep13":"6"}, // Zone Faym
      "replicard/stage/4" : {"sep12":"7", "sep16":"8", "sep13":"9"}, // Zone Goliath
      "replicard/stage/5" : {"sep14":"10", "sep11":"11", "sep17":"12"}, // Zone Harbinger
      "replicard/stage/6" : {"sep101":"13", "sep105":"14"}, // Zone Invidia
      "replicard/stage/7" : {"sep102":"15", "sep106":"16"}, // Zone Joculator
      "replicard/stage/8" : {"sep103":"17", "sep106":"18"}, // Zone Kalendae
      "replicard/stage/9" : {"104":"19", "105":"20"}, // Zone Liber
      "replicard/stage/10" : {"sep101":"21", "sep102":"22", "sep103":"23", "sep104":"24", "sep105":"25", "sep106":"26"}, // Zone Mundus
    }
    var sephBoxIndex = "boxId" + sephiraBoxSignatures[returnUrl][boxName];
    var boxTableRow = {};
    boxTableRow.epochTime = Date.now();
    boxTableRow.redChest = 0;
    boxTableRow.blueChest = 0;
    boxTableRow.itemList = {[sephBoxIndex] : 1};
    console.log(boxTableRow);
    console.log("%c[2.2]Box Table Row was built, Sending to StoreRow: ", "color:cyan;", [boxTableRow]);
    StoreRow("Sephira Boxes", boxTableRow);
  }
  catch(error){console.log("%c[error]An error occured in UpdateSephiraStock: ", "color:red;", error);}
  

}

function ProcessSephiraJSON(response){
  try{
    console.log("%c[Step 2] LOGGING SEPHIRA BOX RESULTS", "color:cyan;")
    var body = JSON.parse(response.body);
    console.log(body);
    var rewardList = body.reward_list;
    console.log(rewardList);
    var sephiraTableRow = {};
    sephiraTableRow.epochTime = Date.now();
    sephiraTableRow.redChest = 0;
    sephiraTableRow.blueChest = 0;
    sephiraTableRow.itemList = {};
    for (item of rewardList){
      let itemId = item.item_id
      let itemQuantity = item.number;
      // Extracts each item from the JSON and stores it in sephiraTableRow.itemList
      switch(item.item_kind){
        case 4:
          var itemType = "stam";
          break;
        case 55:
          var itemType = "box";
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
      let itemName = itemType + itemId;
      sephiraTableRow.itemList[itemName] = itemQuantity;
    }
    console.log(sephiraTableRow);
    StoreRow("Sephira Drops", sephiraTableRow);
  }
  catch(error){console.log("%c[error]An error occured in ProcessSephiraJSON: ", "color:red;", error);}
}

async function CheckForUpdate(){
  let settings = await getObjectFromLocalStorage("Settings");
  if (settings == undefined){console.log("Settings were never initialized"); return;} // Settings weren't ever initialized
  if (!settings.hasOwnProperty("timeCheckedLastVersion")){ // Settings were initialized, but it was before this feature
    settings.timeCheckedLastVersion = Date.now();
    await saveObjectInLocalStorage({["Settings"]:settings});
  }
  else if (settings.timeCheckedLastVersion > Date.now() - 600000) {console.log("Game has already checked for update in the last 10 minutes"); return;} // Game checked in last 10 minutes
  settings.timeCheckedLastVersion = Date.now();
  console.log("Last time checked updated to: " + settings.timeCheckedLastVersion);
  await saveObjectInLocalStorage({["Settings"]:settings}); // Updates the last time that an update was checked
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
      if (settings.hasOwnProperty("latestVersion") && settings.latestVersion == latestVersion ){console.log("Latest version was already known"); return;} // Latest version was already known
      settings.latestVersion = latestVersion;
      console.log("Latest version was updated!");
      saveObjectInLocalStorage({["Settings"]:settings}); // Latest version saved to settings
    })
    .catch(error => {
      console.error('Error:', error.message);
    });
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

// Stores the timeout to revert the extension icon
var setIconActionTimeout;
// Changes the extension icon to any lucky drop you may get
function setIconAction(iconId){
  if (iconId == "reset"){var imagePath = "/src/img/icon.png"}
  else{
    if (!changeIconOnId.includes(iconId)){console.log("%c[error]Invalid ID for extension icon: " + iconId, "color:red;");return;};
    var imagePath = "/src/img/icon/luckyIcons/" + iconId + ".jpg"
    // Resets the extension icon to default after iconChangeDuration (ms). Default is 300,000ms = 5 minutes
    setIconActionTimeout = setTimeout(setIconAction, iconChangeDuration, "reset")
  }
  chrome.action.setIcon({
    path: {
      "16": imagePath,
      "48": imagePath,
      "128": imagePath
    }
  }).then(console.log("%c[+]Extension icon changed to: " + imagePath, "color:#AFC8AD;"));
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

CheckForUpdate();