document.body.style.zoom = "55%";
var selectedBoss = "Seofon";
var dataPeriodIndex = 0;
const dataPeriods = ["All", "Month", "Week", "Day", "Timer"];
var timerStart = 1700693924522; // When loot timer was started
var timerInterval; // interval that updates timer every second
var dataPeriodLengths = [0, 2592000000, 604800000, 86400000];
var isBalancingLoot = false; // Lock to stop loot from updating when RecalculateData() updates what loot is within the data period

// Stores DOM elements in vars for easier access
// Panel elements
const settingsPanel = document.getElementById("settingsPanel");
const settingsButton = document.getElementById("settingsButton");
const bossRadio = document.getElementById("bossRadio");
const dataPeriodRadio = document.getElementById("dataPeriodRadio");
const lootPanel = document.getElementById("lootPanel");
const lootButton = document.getElementById("lootButton");
// Loot table elements
const cLoot = document.getElementById('c-commonLoot');
const lLoot = document.getElementById('c-luckyLoot');
const luckyTitle = document.getElementById("luckyLootTitle")
// Boss statistic elements
const bossText = document.getElementById('bossNameText');
const bossPortrait = document.getElementById('bossSummary');
const killCountText = document.getElementById('text-killCountSummary');
const blueCountText = document.getElementById('text-blueCountSummary');
const redCountText = document.getElementById('text-redCountSummary');
const dataPeriodText = document.getElementById('text-dataTypeSummary');
const timerText = document.getElementById('text-Timer');

const validBosses = [
  "*Pre Bar Grind", "05Proto Bahamut", "06Ultimate Bahamut", "04Grand Order",
  "*Bar Grind", "16Ultimate Bahamut HL", "14Akasha", "16Grand Order HL", "15Proto Bahamut HL",
  "*Uncap Grind", "06Lindwurm", "09The Four Primarchs", "06Lucilius", "06Lucilius (Hard)", "06Beelzebub", "06Belial",
  "*Ennead Raids", "20Atum", "21Tefnut", "22Bennu", "23Ra", "24Horus", "25Osiris",
  "*Six Dragons", "20Wilnas", "21Wamdus", "22Galleon", "23Ewiyar", "24Lu Woh", "25Fediel",
  "*Revans", "20Mugen", "21Diaspora", "22Siegfried", "23Seofon", "24Cosmos", "25Agastia",
  "*High Difficulty", "06Super Ultimate Bahamut", "08Hexachromatic Hierarch",
  "*Rise of the Beasts", "17Huanglong and Qilin", "14Huanglong", "15Qilin",
  "*Guild War", "06Tyrant", "06Nightmare 95",
];

var tempValidBossesStripped = [];
for (item of validBosses){
  if (!item.startsWith("*")){tempValidBossesStripped.push(item.substring(2));}
}
const validBossesStripped = tempValidBossesStripped;
delete tempValidBossesStripped;

const elementColors = [
  "#bf371a", "#357ed4", "#855327", "#4b962a", "#d4b62b", "#7b49ca", "#696969", 
"linear-gradient(135deg, rgba(212,182,43,1) 0%, rgba(123,73,202,1) 100%)", // Huanglong and Qilin
"linear-gradient(135deg, #bf371a, #357ed4, #855327, #4b962a, #d4b62b, #7b49ca)", // Hexachromatic Hierarch
"linear-gradient(135deg, #bf371a, #357ed4, #855327, #4b962a)",

];

const fallbackLootImage = "url(./img/loot/default.jpg)"
const luckyLootIds = [
/*Red ring + Sand + Gold Bar*/"emp3", "215", "20004",
/*Revans Weapons Fire-Earth*/"1040023500", "1040712900", "1040913800", "1040617900", "1040116400", "1040316600", 
/*Revans Weapons Wind-Dark*/"1040024300", "1040316800", "1040915200", "1040117500", "1040421300", "1040816000",
/*Longdong and Qilin Summons + Omega anima*/"529", "2040157000", "531", "2040158000",
/*Rev Weapons*/"1040201600", "1040700500", "1040301300", "1040101700", "1040401800",
"1040600800", "1040001800", "1040900500", "1040800300", "1040500800",
/*Malice weapons*/"1040314000", "1040414600", "1040112300", "1040416300", "1040111000", "1040711000",
/*Menace weapons*/"1040711100", "1040704800", "1040615000", "1040408100", "1040905500", "1040305600", 
/*6D weapons*/"1040912400", "1040020300", "1040513400", "1040313000", "1040215100", "1040613800",
/*Proven weapons*/"1040213800", "1040514500", "1040511200", "1040215000", "1040813900", "1040416500",
"1040617100", "1040614500", "1040016100", "1040016500", "1040612200",
];

const skillItemIds = ["1029900000", "1039900000"];
const angelWeapons = [
  "1020399000", "1020799000", "1020699000", "1020599000", "1020899000", // Angel
  "1020999000", "1020199000", "1020299000", "1020099000", "1020499000",
  "1030399000", "1030799000", "1030699000", "1030599000", "1030899000", //Archangel
  "1030999000", "1030199000", "1030299000", "1030099000", "1030499000",
];

// Animations
const newItemAnimation = {
  keyframes: [
    {filter: "brightness(1)"}, 
    {filter: "brightness(0.5)"}, 
    {filter: "brightness(1)"}
  ],
  timing: 750
}

// Hanles updating of loot table
async function populateLoot(bossData){
  // Updates boss title text
  bossText.innerHTML = selectedBoss;
  // Sets the boss image and uses default if not found
  selectedBossEscaped = selectedBoss.replace(/ /g, "%20").replace(/\(/g, "%28").replace(/\)/g, "%29");
  var imagePath = "url(./img/portrait/" + selectedBossEscaped + ".png)";
  bossPortrait.style.backgroundImage=imagePath + ", " + fallbackLootImage;
  // If no boss data was specified, defaults to selectedBoss
  if (bossData == null){
    // Tries to get boss loot from local data
    var bossData = await getObjectFromLocalStorage(selectedBoss);
    // Exits function if boss's loot table was empty
    if (bossData == null){console.log(selectedBoss + "\'s loot table was empty"); return}
    console.log("%cBoss Data: ", "color:aqua;", [bossData]);
    // Initializes boss's stat counters in module
    // Recalculates if data period is set to monthly, weekly, or daily
    if (dataPeriodIndex > 0){bossData = await recalculateData(bossData);}
    bossData = bossData[dataPeriodIndex];
    killCountText.innerHTML = bossData.kills;
    blueCountText.innerHTML = bossData.blueChest;
    redCountText.innerHTML = bossData.redChest;
  }
  else{
    // Updates boss's stat counter on the module
    var bossStats = [killCountText.innerHTML, blueCountText.innerHTML, redCountText.innerHTML]
    killCountText.innerHTML = +bossStats[0] + 1;
    blueCountText.innerHTML = +bossStats[1] + +bossData.blueChest;
    redCountText.innerHTML = +bossStats[2] + +bossData.redChest;
  }
  
  items = bossData.itemList;
  for(key in items){
    // Updates count for each lootbox on screen and creates one if it does not exist yet
    if (document.getElementById("text-" + key) === null) { // Element is not on screen
      generateLootBox(key);
    }
    
    // If the item count is already in the DOM, simply updates it
    else {
      itemBox = document.getElementById("text-" + key);
      itemCount = itemBox.innerHTML
      itemBox.innerHTML = +itemCount + +items[key];
      // briefly flashes loot picture when item count is updated
      itemImage = itemBox.parentElement.parentElement;
      itemImage.animate(newItemAnimation.keyframes, newItemAnimation.timing);}
  }
}
// Creates new elements for the loot table
function generateLootBox(key){
  // Creates item box element
  box = document.createElement('div');
  box.setAttribute("id", key);
  box.setAttribute("class", "itemBlock");

  // Sets the boxs background image and uses default if not found
  var imagePath = "url(./img/loot/" + key + ".jpg)"
  box.style.backgroundImage=imagePath + ", " + fallbackLootImage;

  // Creates container for item count text
  cText = document.createElement('div');
  cText.setAttribute("class", "c-itemText");
  if (+key > 1000000000){cText.classList.add("weaponText");}
  // Creates item text
  text = document.createElement('p');
  text.setAttribute("id", "text-" + key);
  text.setAttribute("class", "itemText");
  // Creates the "X" before the number
  multi = document.createElement('p');
  multi.setAttribute("id", "x-" + key);
  multi.setAttribute("class", "itemMulti");
  // Updates the text
  text.innerHTML = items[key];
  multi.innerHTML = "X"
  // Adds all elements together and places them in the DOM
  cText.appendChild(multi);
  cText.appendChild(text);
  box.appendChild(cText)
  // Sorts the loot into common loot or lucky loot
  if (!luckyLootIds.includes(key)){cLoot.appendChild(box);}
  else {lLoot.appendChild(box); luckyTitle.classList.remove("hidden");}
}

// recalculates row to only include data from last month/week/day/custom
async function recalculateData(bossData){
  // Safe mode:
  // targetRow = Object.assign({}, bossData[0]);
  // targetItemList = Object.assign({}, targetRow.itemList);
  targetRow = bossData[dataPeriodIndex];
  targetItemList = targetRow.itemList;
  console.log("Boss Table: ", bossData);
  console.log("Target Row: ", targetRow);
  console.log("Target Item List: ", targetItemList);
  // Error checks index of 0
  if (targetRow.lastIndex == 0){index = 5;}
  else {index = targetRow.lastIndex;}

  // only kills with an epoch time after this are counted
  if (dataPeriodIndex == 4){cutoffTime = timerStart}
  else {cutoffTime = Date.now() - dataPeriodLengths[dataPeriodIndex];}
  console.log("cutoffTime: " + cutoffTime);
  tableSize = bossData.length;
  // Checks if any recalculating even needs to be done
  if (bossData[dataPeriodIndex].kills == 0 || index == tableSize || bossData[index].epochTime > cutoffTime){
    console.log("Data didn't need to be rebalanced");
    return bossData;
  }

  // Removes each row from the total that hasn't been removed by a previous load
  while (index < tableSize && bossData[index].epochTime < cutoffTime){
    targetRow.blueChest -= bossData[index].blueChest;
    targetRow.redChest -= bossData[index].redChest;
    targetRow.kills--;
    targetItemList = subtractItemList(targetItemList, bossData[index].itemList)
    index++;
    targetRow.lastIndex = index;
  }
  // Clears all items from the list that have a value of 0;
  for (key in targetItemList){if (targetItemList[key] == 0){delete targetItemList[key];}}
  targetRow.itemList = targetItemList;
  bossData[dataPeriodIndex] = targetRow;
  // Sets lock so that the storage listener doesn't update loot on module
  isBalancingLoot = true;
  // Puts recalculated row back in storage
  await saveObjectInLocalStorage({[selectedBoss] : bossData});
  // Lifts lock
  isBalancingLoot = false;
  return bossData;
}

// Populates boss dropdown list with all valid bosses
function populateDropdowns() {
  for (i in validBosses){
    // Initializes variables for the radio entry
    itemType = validBosses[i].substring(0,1);
    element = +validBosses[i].substring(1,2);
    entryName = validBosses[i].substring(2);
    // Adds group title
    if (itemType == "*"){
      var label = document.createElement("label");
      label.classList.add("radioGroup");
      var labelText = document.createElement("span");
      labelText.classList.add("labelText");
      labelText.innerHTML = validBosses[i].substring(1);
      label.appendChild(labelText);
      bossRadio.appendChild(label);
    }
    // Adds boss name
    else {
      // Adds radio input
      var radio = document.createElement("input");
      radio.type = "radio";
      radio.id = entryName;
      radio.value = entryName;
      radio.name = "boss";
      if (entryName == selectedBoss){radio.checked = true;}
      bossRadio.appendChild(radio);
      // Adds radio label
      var label = document.createElement("label");
      label.style.setProperty('--label-background-color', elementColors[element]);
      label.htmlFor = entryName;
      var labelText = document.createElement("span");
      labelText.classList.add("labelText");
      labelText.innerHTML = entryName;
      // Adds boss icon container
      cIcon = document.createElement("div");
      cIcon.classList.add("c-radioIcon");
      cIcon.style.background=elementColors[element];
      // Adds boss icon and potential loot icon
      bossIcon = document.createElement("img");
      bossIcon.src = "./img/icon/boss/" + entryName.replace(/ /g, "%20") + ".jpg";
      bossIcon.classList.add("bossIcon");
      label.appendChild(labelText);
      if (itemType != "0"){ // Enemy has luckyloot to display next to name in dropdown
        lootIcon = document.createElement("img");
        lootIcon.src = "./img/icon/boss/" + itemType + ".jpg";
        lootIcon.classList.add("bossIcon");
        cIcon.appendChild(lootIcon);
      }
      cIcon.appendChild(bossIcon);
      label.appendChild(cIcon)
      bossRadio.appendChild(label);
    }
  }
  // Logic for the data period dropdown
  checkedRadio = document.getElementById("dataPeriod" + dataPeriods[dataPeriodIndex]);
  checkedRadio.checked = true;
  dataPeriodText.innerHTML = dataPeriods[dataPeriodIndex];
  if (dataPeriodIndex == 4){toggleTimer(true);}
}

// Update loot on screen when new kill is recorded
chrome.storage.onChanged.addListener((changes, areaname) => {
  try{
    var bossName = Object.keys(changes)[0];
    if (!validBossesStripped.includes(bossName) || isBalancingLoot) {return;}
    if (selectedBoss != bossName){
      // Sets current boss to the newly detected one and cleares loot from DOM
      selectedBoss = bossName;
      cLoot.innerHTML = "";
      lLoot.innerHTML = "";
      luckyTitle.classList.add("hidden");
      // Sends null so that new boss is initialized
      lastBattle = null;
    }
    else {
      // Gets the latest updated data for the boss
      bossData = changes[bossName].newValue;
      // Strips the data to only include the last fight
      lastBattle = bossData[bossData.length-1];
    }
    populateLoot(lastBattle); // updates loot module in the DOM
  }
  catch(error){console.log(error)}
});

// Updates current boss when dropdown is changed
bossRadio.addEventListener('change', function (e) {
  selectedBoss = e.target.value;
  updateSettings("selectedBoss", selectedBoss);
  console.log("Selected boss changed to: " + selectedBoss);
  clearLootModule()
  togglePanel(settingsPanel);
  populateLoot(null);
})

dataPeriodRadio.addEventListener('change', async function (e) {
  dataPeriodIndex = +e.target.value;
  await updateSettings("dataPeriod", dataPeriodIndex);
  if (dataPeriodIndex == 4){
    timerStart = Date.now()
    updateSettings("timerStart", timerStart)
    toggleTimer(true);
  }
  else{toggleTimer(false);}
  console.log("Data Period changed to: " + dataPeriods[dataPeriodIndex]);
  dataPeriodText.innerHTML = dataPeriods[dataPeriodIndex]
  clearLootModule()
  togglePanel(settingsPanel);
  populateLoot(null);
})

/*******************/
/* TIMER FUNCTIONS */
/*******************/
// Turns the timer on or off (true = on, false = off)
async function toggleTimer(state) {
  // Turn timer on
  if (state == true && !timerInterval){
    timerText.classList.remove("hidden");
    timerInterval = setInterval(updateTimer, 1000);
    console.log("Timer ON");
  }
  // Turn timer off
  else if (state == false && timerInterval){
    timerText.classList.add("hidden");
    timerInterval = null;
    console.log("Timer OFF");
  }
}
// Updates the timer once a second when active
function updateTimer(){
  deltaTime = Date.now() - timerStart;
  seconds = Math.floor(deltaTime/1000) % 60;
  minutes = Math.floor(deltaTime/60000) % 60;
  hours = Math.floor(deltaTime/3600000) % 24;
  days = Math.floor(deltaTime/86400000);
  displayArr = [days, hours, minutes, seconds];
  startDisplay = false;
  display = "";
  for (i in displayArr){
    if (displayArr[i] != 0 || startDisplay){
      // Add leading 0
      if (i != 0 && displayArr[i] < 10 && startDisplay == true){display += "0"}
      display += displayArr[i] + ":"
      startDisplay = true;
    }
  }
  display = display.slice(0,-1);
  timerText.innerHTML = display;
}

/*******************/
/* PANEL FUNCTIONS */
/*******************/
// Handles opening and closing of panels
lootButton.addEventListener("click", function(){modifyPanel("loot")});
settingsButton.addEventListener("click", function(){modifyPanel("settings")});

function modifyPanel(targetName){
  // Settings button clicked
  if (targetName == "settings"){
    if (lootPanel.style.height != "0px"){ // Loot panel is already open
      togglePanel(lootPanel);
    }
    togglePanel(settingsPanel);
  }
  // Loot button clicked
  else if (targetName == "loot"){
    if (settingsPanel.style.height != "0px"){ // Settings panel is already open
      togglePanel(settingsPanel);
    }
    togglePanel(lootPanel);
  }
}

// Resets the html for the loot display
function clearLootModule(){
  killCountText.innerHTML = 0;
  blueCountText.innerHTML = 0;
  redCountText.innerHTML = 0;
  cLoot.innerHTML = "";
  lLoot.innerHTML = "";
  luckyTitle.classList.add("hidden");
}

// Togles the panel element passed to open or closed
function togglePanel(targetElement){
  // Closes panel
  if (targetElement.style.height != "0px"){targetElement.style.height = "0px";targetElement.style.width = "0px";}
  // Opens panel
  else {targetElement.style.height = "100em"; targetElement.style.width = "64em";}
}

/*********************/
/* SUPPORT FUNCTIONS */
/*********************/
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
 * Subtracts like values of a JSON from another
 * @param {JSON} item1
 * @param {JSON} item2 
 */
function subtractItemList(item1, item2){
  for(key in item2){
    item1[key] -= item2[key];
  }
  return item1;
}

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
      reject(ex);
    }
  });
}

/***********************/
/* DEBUGGING FUNCTIONS */
/***********************/
// Replaces all instances of idTarget with idReplace in the bossName's loot table
// NOTE: This function isn't used in regular opperation, but for fixing loot tables if I fucked something up
// WARNING: Misusing this function can ruin an enemies loot table
async function fixLoot(bossName, idOld, idNew){
  var count = 0;
  bossTable = await getObjectFromLocalStorage(bossName);
  bossTable.forEach(object => {
    if (object.itemList.hasOwnProperty(idOld)){
      object.itemList[idNew] = object.itemList[idOld];
      delete object.itemList[idOld];
      count++;
    }
  })
  console.log(count + " Changes made...");
  saveObjectInLocalStorage({[selectedBoss]: bossTable});
}

// Function I change to fix some data I corrupted. Not used in normal operation...
async function fixCode(){
  bossTable = await getObjectFromLocalStorage(selectedBoss);
  console.log("Boss data before operation: ", bossTable);
  bossTable[0].lastIndex = 0;
  bossTable[4] = bossTable[0];
  console.log("Boss table after operation: ", bossTable);
  await saveObjectInLocalStorage({[selectedBoss] : bossTable})
}

// Counts all fights from the selectedBoss to retally the total in index 0 of the drop table
async function recountSelectedBoss(){
  bossTable = await getObjectFromLocalStorage(selectedBoss);
  // Removes old properties from old versions
  legacyProperties = ["lootList", "epochTime"]
  for (let property in legacyProperties){
    if (bossTable[0].hasOwnProperty(property)){
      console.log("Removing " + property + " from", bossTable[0]); 
      delete bossTable[0][property];
    }
  }
  console.log("Before operation: ", bossTable);
  if (bossTable == null){console.log("Boss Table was empty"); return;}
  tableHead = bossTable[0]
  tableHead.kills = 0;
  tableHead.blueChest = 0; 
  tableHead.redChest = 0;
  tableHead.itemList = {};
  tableHead.lastIndex = 5;
  for (var i = 5; i < bossTable.length; i++){
    tableHead.kills++;
    tableHead.blueChest += bossTable[i].blueChest;
    tableHead.redChest += bossTable[i].redChest;
    tableHead.itemList = mergeItemList(tableHead.itemList, bossTable[i].itemList);
  }
  for (var i = 1; i <= 4; i++){bossTable[i] = bossTable[0];}
  
  console.log("After operation: ", bossTable);
  await saveObjectInLocalStorage({[selectedBoss]: bossTable})
}

// Updates the setting with the name type and stores the value
async function updateSettings(type, value){
  settings = await getObjectFromLocalStorage("Settings");

  // Sets all settings to default if they are missing
  if (settings == null){
    settings = {
      "dataPeriod" : 0,
      "selectedBoss" : "Proto Bahamut",
      "timerStart" : 0
    }
    await saveObjectInLocalStorage({["Settings"]: settings});
  }
  // Updates variables to settings when the page is first loaded
  if (type == null || value == null){
    console.log("Settings: ", settings);
    selectedBoss = settings.selectedBoss;
    dataPeriodIndex = settings.dataPeriod;
    timerStart = settings.timerStart;
  }
  // Changes a settings value in local storage
  else{
    settings[type] = value;
    await saveObjectInLocalStorage({["Settings"]: settings});
  }
}

// Resets all settings to their default
async function resetSettings(){
  settingsDefault = {
    "dataPeriod" : 0,
    "selectedBoss" : "Proto Bahamut",
    "timerStart" : 0
  }
  await saveObjectInLocalStorage({["Settings"]: settings});
  return new Promise((resolve, reject) => {resolve()});
}

// Loads all logic for the module when the page is opened
async function initializePage(){
  // Updates page variables with values from settings
  await updateSettings(null, null).then(function() {
    populateLoot(null);
    populateDropdowns();
  });
}

initializePage();