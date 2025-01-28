import './types/typedefs.js';

function DeepFreeze(object){
    Object.keys(object).forEach((property) => {
        if (object[property] != null && typeof object[property] == "object" && !Object.isFrozen(object[property])){
            DeepFreeze(object[property]);
        }
    })
    return Object.freeze(object);
}

const urlFilter = {
    gameUrl: "^https:\/\/game.granbluefantasy.jp\/",
    gameUrlRegex: undefined,
    extensionUrlRegex: new RegExp("^chrome:\/\/extensions\/|^chrome-extension:\/\/"),

    // Results file URL
    soloRewardUrl: "result\/content\/index\/\\d{10}",
    soloRewardUrlRegex: undefined,
    raidRewardUrl: "resultmulti\/content\/index\/\\d{11}",
    raidRewardUrlRegex: undefined,
    soloOrRaidRewardUrl: undefined,
    rewardUrlRegex: undefined,

    // Sandbox URLs
    sandboxStavesRegex: new RegExp("^replicard\/stage\/[2-5]"),
    sandboxSwordsRegex: new RegExp("^replicard\/stage\/[6-9]"),
    sandboxGenesisRegex: new RegExp("^replicard\/stage\/10"),

    // Sandbox specific file URLs
    sephiraOpenUrl: "rest\/replicard\/open_sephirabox\\?_=",
    sephiraOpenRegex: undefined,
    xenoboxUrl: "rest\/replicard\/stage\\?_=\\d{10}",
    xenoboxUrlRegex: undefined,
    sephiraOrXenoUrl: undefined,

    // Event landing pages
    tokenEventLandingUrl: "treasureraid\\d{3}\/top\/content\/newindex\\?_=",
    tokenEventLandingRegex: undefined,
    guildwarLandingUrl: "teamraid\\d{3}\/top\/content\/index\\?_=",
    guildwarLandingRegex: undefined,
    soloTreasureLandingUrl: "solotreasure\\d{3}\/top\/content\/newindex\\?_=",
    soloTreasureLandingRegex: undefined,
    eventLandingUrl: undefined,
    eventLandingRegex: undefined,

    // Network listener whitelist
    whitelistUrl: undefined,
    whitelist: undefined,
};

urlFilter.gameUrlRegex = new RegExp(urlFilter.gameUrl);
urlFilter.soloRewardUrlRegex = new RegExp(urlFilter.gameUrl + urlFilter.soloRewardUrl);
urlFilter.raidRewardUrlRegex = new RegExp(urlFilter.gameUrl + urlFilter.raidRewardUrl);
urlFilter.soloOrRaidRewardUrl = urlFilter.soloRewardUrl + "|" + urlFilter.raidRewardUrl;
urlFilter.rewardUrlRegex = new RegExp(urlFilter.gameUrl + "(" + urlFilter.soloOrRaidRewardUrl + ")");

urlFilter.sephiraOpenRegex = new RegExp(urlFilter.gameUrl + urlFilter.sephiraOpenUrl);
urlFilter.xenoboxUrlRegex = new RegExp(urlFilter.gameUrl + urlFilter.xenoboxUrl);
urlFilter.sephiraOrXenoUrl = urlFilter.sephiraOpenUrl + "|" + urlFilter.xenoboxUrl;

urlFilter.tokenEventLandingRegex = new RegExp(urlFilter.gameUrl + urlFilter.tokenEventLanding);
urlFilter.guildwarLandingRegex = new RegExp(urlFilter.gameUrl + urlFilter.guildwarLanding);
urlFilter.soloTreasureLandingRegex = new RegExp(urlFilter.gameUrl + urlFilter.soloTreasureLandingUrl);
urlFilter.eventLandingUrl = urlFilter.tokenEventLandingUrl + "|" + urlFilter.guildwarLandingUrl; // + "|" + urlFilter.soloTreasureLandingUrl;
urlFilter.eventLandingRegex = new RegExp(urlFilter.gameUrl + "(" + urlFilter.eventLandingUrl + ")");

// Remove comment below to enable the processing of event pages
urlFilter.whitelistUrl = urlFilter.soloOrRaidRewardUrl + "|" + urlFilter.sephiraOrXenoUrl + "|" + urlFilter.eventLandingUrl;
urlFilter.whitelist = new RegExp(urlFilter.gameUrl + "(" + urlFilter.whitelistUrl + ")");
DeepFreeze(urlFilter);

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
        "Venerable Paragon": [[],["613", "614"],[],[]],
        "Shenxian": [["badge5"], [], [], []],
        // "": [[],[],[],[]],
        /** QUEST TYPE 3 STAGES */
        "Exo Ifrit Crucible": [["1040118000", "10509"], [], [], []],
        "Exo Cocytus Crucible": [["1040516300", "10500"], [], [], []],
        "Exo Vohu Manah Crucible": [["1040218500", "1040119900", "10488", "10548"], [], [], []],
        "Exo Sagittarius Crucible": [["1040712400", "1040026900", "10480", "10554"], [], [], []],
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
DeepFreeze(StageSignature);

/** - If loot with these IDs are dropped in a stage results, changes the extension icon */
const changeIconOnId = ["215", "20004"];
Object.freeze(changeIconOnId);
/** How long the extension icon stays changed after a lucky drop. 300,000 ms = 5 minutes */
const iconChangeDuration = 300000;
/** All, Month, Week, Day */
const dataPeriodLengths = [0, 2592000000, 604800000, 86400000];
Object.freeze(dataPeriodLengths);
const dataPeriods = ["All", "Month", "Week", "Day", "Timer"];
Object.freeze(dataPeriods);
/** Unused for now */
const defaultStageDataTable = [
    {blueChest: 0, extraChest: 0, itemList: {}, kills: 0, lastIndex: 5, redChest: 0, extraChest: 0, },
    {blueChest: 0, extraChest: 0, itemList: {}, kills: 0, lastIndex: 5, redChest: 0, extraChest: 0, },
    {blueChest: 0, extraChest: 0, itemList: {}, kills: 0, lastIndex: 5, redChest: 0, extraChest: 0, },
    {blueChest: 0, extraChest: 0, itemList: {}, kills: 0, lastIndex: 5, redChest: 0, extraChest: 0, },
    {blueChest: 0, extraChest: 0, itemList: {}, kills: 0, lastIndex: 5, redChest: 0, extraChest: 0, },
];
DeepFreeze(defaultStageDataTable);
const defaultStageHeadRow = {
    blueChest: 0,
    extraChest: 0,
    itemList: {},
    kills: 0,
    lastIndex: 5,
    redChest: 0,
    difficultySum: {},
}
DeepFreeze(defaultStageHeadRow);
const tokensToDificulty = {
    1: { // Token draw events
        "honors": {},
        "tokens": { // winning
            15: "7", // Very Hard
            16: "8", // Extreme
            42: "10", // Impossible
            100: "6", // Hell skip
        }
    },
    3: { // Guild War
        "honors": {},
        "tokens": { // winning
            22: "8", // Extreme Host
            26: "9", // Extreme+ Host
            45: "11", // Nightmare 90 Hosts
            // The bosses above have join rewards of 20 so you cannot use join rewards to distinguish. 
            // If a guild war raid has a join reward of 20, you must check instead for host rewards 
            30: "12", // Nightmare 95
            48: "13", // Nightmare 100
            85: "14", // Nightmare 150
            110: "15", // Nightmare 200
            145: "16", // Nightmare 250
        }
    },
    11: { // solotreasure
        "honors": {
            20000: "0", // Very Hard (solo)
            75000: "2", // Extreme (solo)
            150000: "4" // Maniac (solo)
        },
        "tokens": {}
    }
};

export {changeIconOnId, iconChangeDuration, dataPeriodLengths, defaultStageHeadRow, tokensToDificulty, StageSignature, urlFilter};