class config {
  
}

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
  "*Revans", "20Mugen", "21Diaspora", "22Siegfried", "23Seofon", "24Cosmos", "25Agastia",
  "*High Difficulty", "06Super Ultimate Bahamut", "08Hexachromatic Hierarch",
  "*Rise of the Beasts", "17Huanglong and Qilin", "14Huanglong", "15Qilin",
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
];

const skillItemIds = ["1029900000", "1039900000"];
const angelWeapons = [
  "1020399000", "1020799000", "1020699000", "1020599000", "1020899000", // Angel
  "1020999000", "1020199000", "1020299000", "1020099000", "1020499000",
  "1030399000", "1030799000", "1030699000", "1030599000", "1030899000", //Archangel
  "1030999000", "1030199000", "1030299000", "1030099000", "1030499000",
];

