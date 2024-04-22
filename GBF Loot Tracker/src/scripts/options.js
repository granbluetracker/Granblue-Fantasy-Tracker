document.body.style.zoom = "55%";
/*************************/
/* Variable Declarations */
/*************************/
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
const sephiraButton = document.getElementById("sephiraButton");
// Loot table elements
const sephiraSummary = document.getElementById('c-sephiraSummary');
const sephiraChestCount = document.getElementById('sephiraSummaryStatsCount');
const sephiraPeriodText = document.getElementById('sephiraSummaryStatsPeriod');
const cLoot = document.getElementById('c-commonLoot');
const lLoot = document.getElementById('c-luckyLoot');
const luckyTitle = document.getElementById("luckyLootTitle")
// Boss statistic elements
const bossText = document.getElementById('bossNameText');
const bossSummary = document.getElementById('c-bossSummary');
const bossPortrait = document.getElementById('bossPortrait');
const killCountText = document.getElementById('text-killCountSummary');
const blueCountText = document.getElementById('text-blueCountSummary');
const redCountText = document.getElementById('text-redCountSummary');
const dataPeriodText = document.getElementById('text-dataTypeSummary');
const timerText = document.getElementById('text-Timer');


// Stores the dom element for each sephira box count
var sephiraBoxIcons = []
sephiraBoxIcons.length = 27;
for (let i = 1; i <= 26; i++){
  sephiraBoxIcons[i] = document.getElementById('sep' + i + 'Count');
}
// Stores list of bosses and group titles. Used to populate the selected boss dropdown
const validBosses = [
  "*Pre Bar Grind", "05Proto Bahamut", "06Ultimate Bahamut", "04Grand Order",
  "*Bar Grind", "16Ultimate Bahamut HL", "14Akasha", "16Grand Order HL", "15Proto Bahamut HL",
  "*Uncap Grind", "06Lindwurm", "09The Four Primarchs", "06Lucilius", "06Lucilius (Hard)", "06Beelzebub", "06Belial", "26The World",
  "*Ennead Raids", "20Atum", "21Tefnut", "22Bennu", "23Ra", "24Horus", "25Osiris",
  "*Six Dragons", "20Wilnas", "21Wamdus", "22Galleon", "23Ewiyar", "24Lu Woh", "25Fediel",
  "*Magna 3", "23Tiamat Aura Omega", "24Luminiera Credo Omega",
  "*Revans", "20Mugen", "21Diaspora", "22Siegfried", "23Seofon", "24Cosmos", "25Agastia",
  "*High Difficulty", "26Super Ultimate Bahamut", "28Hexachromatic Hierarch", "26Dark Rapture Zero",
  "*Rise of the Beasts", "00Zhuque", "00Agni", "01Xuanwu", "01Neptune", 
  "02Baihu", "02Titan", "03Qinglong", "03Zephyrus",
  "06Shenxian", "17Huanglong and Qilin", "14Huanglong", "15Qilin",
  "*Replicard Sandbox E-H", "00Zone Eletio", "01Zone Faym", "02Zone Goliath", "03Zone Harbinger",
  "*Replicard Sandbox I-L", "00Zone Invidia Fire", "04Zone Invidia Light", "01Zone Joculator Water", "05Zone Joculator Dark", 
  "02Zone Kalendae Earth", "05Zone Kalendae Dark", "03Zone Liber Wind", "05Zone Liber Light",
  "*Replicard Sandbox I-L Bosses", "00Athena Militis", "01Grani Militis", "02Baal Militis", "03Garuda Militis",
  "10Xeno Ifrit Militis", "31Xeno Cocytus Militis", "32Xeno Vohu Manah Militis", "13Xeno Sagittarius Militis",
  "*Replicard Sandbox M", "00Zone Mundus Fire", "01Zone Mundus Water", "02Zone Mundus Earth", "03Zone Mundus Wind", "04Zone Mundus Light", "05Zone Mundus Dark",
  "*Replicard Sandbox M Bosses", "00Prometheus Militis", "01Ca Ong Militis", "02Gilgamesh Militis", "03Morrigna Militis", "06The World (Solo)",
];
// Cleans the valid boss list of element/lucky loot data and removes group titles
var tempValidBossesStripped = [];
for (item of validBosses){
  if (!item.startsWith("*")){tempValidBossesStripped.push(item.substring(2));}
}
const validBossesStripped = tempValidBossesStripped;
delete tempValidBossesStripped;
// Context for the element id colors. 
const elementColors = [
  "#bf371a", "#357ed4", "#855327", "#4b962a", "#d4b62b", "#7b49ca", "#696969", 
"linear-gradient(135deg, rgba(212,182,43,1) 0%, rgba(123,73,202,1) 100%)", // Huanglong and Qilin
"linear-gradient(135deg, #bf371a, #357ed4, #855327, #4b962a, #d4b62b, #7b49ca)", // Hexachromatic Hierarch
"linear-gradient(135deg, #bf371a, #357ed4, #855327, #4b962a)",
];

// Replacement image when an image wasn't found
const fallbackLootImage = "url(./img/loot/default.jpg)"
// Ids that get placed in the lucky loot section
const luckyLootIds = [
/*Red ring + Sand + Gold Bar + Evolite*/"emp3", "215", "20004", "25036",
/*Gifts+Coffers*/"box2", "box3", "box4", "box5",
/*Revans Weapons Fire-Earth*/"1040023500", "1040712900", "1040913800", "1040617900", "1040116400", "1040316600", 
/*Revans Weapons Wind-Dark*/"1040024300", "1040316800", "1040915200", "1040117500", "1040421300", "1040816000",
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

// Hanles updating of loot and boss stats
async function populateLoot(bossData){
  // Updates boss title text
  bossText.innerHTML = selectedBoss;
  // Sets the boss image and uses default if not found
  let selectedBossEscaped = selectedBoss.replace(/ /g, "%20").replace(/\(/g, "%28").replace(/\)/g, "%29");
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
    if (dataPeriodIndex > 0){bossData = await recalculateData(selectedBoss, bossData);}
    bossData = bossData[dataPeriodIndex];
    killCountText.innerHTML = bossData.kills;
    blueCountText.innerHTML = bossData.blueChest;
    redCountText.innerHTML = bossData.redChest;
  }
  else{
    // Updates boss's stat counter on the module
    var bossStats = [killCountText.innerHTML, blueCountText.innerHTML, redCountText.innerHTML];
    killCountText.innerHTML = +bossStats[0] + 1;
    blueCountText.innerHTML = +bossStats[1] + +bossData.blueChest;
    redCountText.innerHTML = +bossStats[2] + +bossData.redChest;
  }
  
  let items = bossData.itemList;
  UpdateLoot(items);
}

// Loops through passed items and adds them to the screen
async function UpdateLoot(items){
  for(let key in items){
    // Updates count for each lootbox on screen and creates one if it does not exist yet
    if (document.getElementById("text-" + key) === null) { // Element is not on screen
      generateLootBox(key, items[key]);
    }
    
    // If the item count is already in the DOM, simply updates it
    else {
      let itemBox = document.getElementById("text-" + key);
      let itemCount = itemBox.innerHTML
      itemBox.innerHTML = +itemCount + +items[key];
      // briefly flashes loot picture when item count is updated
      let itemImage = itemBox.parentElement.parentElement;
      itemImage.animate(newItemAnimation.keyframes, newItemAnimation.timing);}
  }
}

// Creates new elements for the loot table
function generateLootBox(key, value){
  // Creates item box element
  let box = document.createElement('div');
  box.setAttribute("id", key);
  box.setAttribute("class", "itemBlock");

  // Sets the boxs background image and uses default if not found
  let imagePath = "url(./img/loot/" + key + ".jpg)"
  box.style.backgroundImage=imagePath + ", " + fallbackLootImage;

  // Creates container for item count text
  let cText = document.createElement('div');
  cText.setAttribute("class", "c-itemText");
  // if (+key > 1000000000){cText.classList.add("weaponText");}
  cText.classList.add("weaponText");
  // Creates item text
  let text = document.createElement('p');
  text.setAttribute("id", "text-" + key);
  text.setAttribute("class", "itemText");
  // Creates the "X" before the number
  let multi = document.createElement('p');
  multi.setAttribute("id", "x-" + key);
  multi.setAttribute("class", "itemMulti");
  // Updates the text
  text.innerHTML = value;
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
async function recalculateData(bossName, bossData){
  // Safe mode:
  // targetRow = Object.assign({}, bossData[0]);
  // targetItemList = Object.assign({}, targetRow.itemList);
  let targetRow = bossData[dataPeriodIndex];
  let targetItemList = targetRow.itemList;
  console.log("%c[Recalculate Data]Boss Table: ", "color:#AC87C5", bossData);
  console.log("%c[Recalculate Data]Target Row: ", "color:#AC87C5", targetRow);
  console.log("%c[Recalculate Data]Target Item List: ", "color:#AC87C5", targetItemList);
  // Error checks index of 0
  if (targetRow.lastIndex == 0){var index = 5;}
  else {var index = targetRow.lastIndex;}

  // only kills with an epoch time after this are counted
  // Cutoff time would be exactly a day/week/month ago, or at the start of the timer
  if (dataPeriodIndex == 4){var cutoffTime = timerStart}
  else {var cutoffTime = Date.now() - dataPeriodLengths[dataPeriodIndex];}
  console.log("%c[Recalculate Data]cutoffTime: " + cutoffTime, "color:#AC87C5");
  let tableSize = bossData.length;
  // Checks if any recalculating even needs to be done
  if (bossData[dataPeriodIndex].kills == 0 || index == tableSize || bossData[index].epochTime > cutoffTime){
    console.log("%c[Recalculate Data]Data didn't need to be rebalanced", "color:#AC87C5");
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
  for (let key in targetItemList){if (targetItemList[key] == 0){delete targetItemList[key];}}
  targetRow.itemList = targetItemList;
  bossData[dataPeriodIndex] = targetRow;
  // Sets lock so that the storage listener doesn't update loot on module
  isBalancingLoot = true;
  // Puts recalculated row back in storage
  await saveObjectInLocalStorage({[bossName] : bossData});
  // Lifts lock
  isBalancingLoot = false;
  return bossData;
}

// Populates boss dropdown list with all valid bosses
function populateDropdowns() {
  for (let i in validBosses){
    // Initializes variables for the radio entry
    let itemType = validBosses[i].substring(0,1);
    let element = +validBosses[i].substring(1,2);
    let entryName = validBosses[i].substring(2);
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
      let cIcon = document.createElement("div");
      cIcon.classList.add("c-radioIcon");
      cIcon.style.background=elementColors[element];
      // Adds boss icon and potential loot icon
      let bossIcon = document.createElement("img");
      bossIcon.src = "./img/icon/boss/" + entryName.replace(/ /g, "%20") + ".jpg";
      bossIcon.classList.add("bossIcon");
      label.appendChild(labelText);
      if (itemType != "0"){ // Enemy has luckyloot to display next to name in dropdown
        let lootIcon = document.createElement("img");
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
  let checkedRadio = document.getElementById("dataPeriod" + dataPeriods[dataPeriodIndex]);
  checkedRadio.checked = true;
  dataPeriodText.innerHTML = dataPeriods[dataPeriodIndex];
  if (dataPeriodIndex == 4){toggleTimer(true);}
}

// Update loot on screen when new kill is recorded
chrome.storage.onChanged.addListener((changes, areaname) => {
  try{
    var bossName = Object.keys(changes)[0];
    if (!validBossesStripped.includes(bossName) || isBalancingLoot) {return;}
    let isBossNew = (selectedBoss != bossName);
    // Turns off sephira mode if it was on so new loot can be loaded
    if(!sephiraSummary.classList.contains("hidden")) {
      clearSephiraMode();
      console.log("Sephira mode disabled. Loading new profile: " + bossName);
      isBossNew = true; // Set to true so that the boss that just dropped loot has all loot loaded instead of just the last drop
      // This has to be done because the loot display was previously cleared by sephira mode opening
    }
    if (isBossNew){
      // Sets current boss to the newly detected one and cleares loot from DOM
      selectedBoss = bossName;
      cLoot.innerHTML = "";
      lLoot.innerHTML = "";
      luckyTitle.classList.add("hidden");
      // Sends null so that new boss is initialized
      var lastBattle = null;
    }
    else {
      // Gets the latest updated data for the boss
      let bossData = changes[bossName].newValue;
      // Strips the data to only include the last fight
      var lastBattle = bossData[bossData.length-1];
    }
    populateLoot(lastBattle); // updates loot module in the DOM
  }
  catch(error){console.log(error)}
});

// Updates current boss when dropdown is changed
bossRadio.addEventListener('change', function (e) {
  selectedBoss = e.target.value;
  if(!sephiraSummary.classList.contains("hidden")) {clearSephiraMode();}
  updateSettings("selectedBoss", selectedBoss);
  console.log("Selected boss changed to: " + selectedBoss);
  clearLootModule()
  togglePanel(settingsPanel);
  populateLoot(null);
})

dataPeriodRadio.addEventListener('change', async function (e) {
  dataPeriodIndex = +e.target.value;
  if(!sephiraSummary.classList.contains("hidden")) {clearSephiraMode();}
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
  let deltaTime = Date.now() - timerStart;
  let seconds = Math.floor(deltaTime/1000) % 60;
  let minutes = Math.floor(deltaTime/60000) % 60;

  
  let hours = Math.floor(deltaTime/3600000) % 24;
  let days = Math.floor(deltaTime/86400000);
  let displayArr = [days, hours, minutes, seconds];
  let startDisplay = false;
  let display = "";
  for (let i in displayArr){
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

sephiraButton.addEventListener('click', function(){
  modifyPanel("loot"); // Closes loot panel
  toggleSephiraMode()
});

async function toggleSephiraMode(){
  await clearLootModule(); // Clears whatever loot was being displayed
  // Enable sephira box
  if (sephiraSummary.classList.contains("hidden")){
    console.log("Enabling sephira mode");
    sephiraSummary.classList.remove("hidden");
    bossSummary.classList.add("hidden");
    bossText.innerHTML ="Sephira Data";
    UpdateSephiraData();
  }
  // Disable sephira box
  else {
    console.log("Disabling sephira mode");
    sephiraSummary.classList.add("hidden");
    bossSummary.classList.remove("hidden");
    populateLoot(null);
  }
}

async function UpdateSephiraData(){
  // Recalculates what loot is within current period
  if (dataPeriodIndex != 0){
    let tempSephiraBoxData = await getObjectFromLocalStorage("Sephira Boxes");
    await recalculateData("Sephira Boxes", tempSephiraBoxData);
    let tempSephiraDropData = await getObjectFromLocalStorage("Sephira Drops");
    await recalculateData("Sephira Drops", tempSephiraDropData);
  }
  var stockData = await getObjectFromLocalStorage("Sephira Boxes");
  sephiraChestCount.innerHTML = stockData[dataPeriodIndex].kills;
  sephiraPeriodText.innerHTML = dataPeriods[dataPeriodIndex];
  stockData = stockData[dataPeriodIndex].itemList;
  for (let key in stockData){
    sephiraBoxIcons[+key.substring(5)].innerHTML = stockData[key]
  }
  var lootData = await getObjectFromLocalStorage("Sephira Drops");
  lootData = lootData[dataPeriodIndex].itemList;
  UpdateLoot(lootData)
}

// Resets the html for the loot display
async function clearLootModule(){
  killCountText.innerHTML = 0;
  blueCountText.innerHTML = 0;
  redCountText.innerHTML = 0;
  cLoot.innerHTML = "";
  lLoot.innerHTML = "";
  luckyTitle.classList.add("hidden");
}

function clearSephiraMode(){
  console.log("Disabling sephira mode");
  sephiraSummary.classList.add("hidden");
  bossSummary.classList.remove("hidden");
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

/**
 * Removes Object from Chrome Local StorageArea.
 *
 * @param {string or array of string keys} keys
 */
const removeObjectFromLocalStorage = async function(keys) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.remove(keys, function() {
        resolve();
      });
    } catch (ex) {
      reject(ex);
    }
  });
};
/***********************/
/* DEBUGGING FUNCTIONS */
/***********************/
// Replaces all instances of idTarget with idReplace in the bossName's loot table
// NOTE: This function isn't used in regular opperation, but for fixing loot tables if I fucked something up
// WARNING: Misusing this function can ruin an enemies loot table

function GetLatestVersion(){
  const apiUrl = 'https://api.github.com/repos/granbluetracker/Granblue-Fantasy-Tracker/releases/latest';
  const options = {
    "method": "GET",
    "header": {
    "User-Agent": "Granblue-Fantasy-Tracker",
    "Accept": "application/vnd.github+json",
    "X-Github-Api-Version": "2022-11-28",
    }
  }

  // Make a request to the GitHub Releases API through the CORS proxy
  fetch(apiUrl, options)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch latest release: ${response.status} ${response.statusText}');
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      const latestVersion = data.tag_name;
      console.log('Latest release version:' + latestVersion);
    })
    .catch(error => {
      console.error('Error:', error.message);
    });
}

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
async function recountSelectedBoss(selectedKey){
  if (null == selectedKey){selectedKey = selectedBoss}
  bossTable = await getObjectFromLocalStorage(selectedKey);
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
  await saveObjectInLocalStorage({[selectedKey]: bossTable})
}

// Updates the setting with the name type and stores the value
async function updateSettings(type, value){
  settings = await getObjectFromLocalStorage("Settings");

  // Sets all settings to default if they are missing
  if (settings == null){
    settings = {
      "dataPeriod" : 0,
      "selectedBoss" : "Proto Bahamut",
      "timerStart" : 0,
      "timeCheckedLastVersion" : 0
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
    "timerStart" : 0,
    "timeCheckedLastVersion" : 0
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