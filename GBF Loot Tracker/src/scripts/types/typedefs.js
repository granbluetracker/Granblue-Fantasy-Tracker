/** TYPE DEFINITIONS */

/**
 * The JSON object that contains information about the game before being tokenized
 * @typedef ResultInfoRaw
 * @property {boolean} base64Encoded If the response body is encoded in base64
 * - This should be set to false usually
 * @property {object} body The content of the file
 */

/**
 * - The JSON object that contains information about the webpage after being tokenized. 
 * - This object comes from executing JSON.parse() on the body property of a ResultInfoRaw object.
 * @typedef ResultInfo
 * @property {string} data - A string containing the HTML for the current page. This string has been escaped so any special characters are replaced with their percent encoding
 * @property {object} display_list - A JSON containing the items the player has favorited and are populating the UI at the bottom of the screen
 * @property {object} option - Contains aditional info that may be used by the game webpage to populate itself
 * @property {ResultData} option.result_data - A JSON object that contains extra info that is used to populate a results page after clearing a stage in the game
 */

/**
 * - A JSON object that contains extra info that is used to populate a results page after clearing a stage in the game
 * @typedef ResultData
 * @property {number} quest_type - Contains information about what kind of quest the results page is for. 
 * - 1 => raid, 
 * - 25 => sandbox, 
 * - ext...
 * @property {object | Array} replicard - Contains extra information specific to replicard stage. 
 * - object is only populated if the results are for a replicard stage.
 * @property {object} rewards - Contains info about the rewards earned from the stage
 * @property {object} rewards.reward_list A JSON containing information about any items that were dropped by the stage. This JSON has the following entries that contain JSONs when populated and an empty array when not:
 * - "1" => wooden chest drops
 * - "2" => silver chest drops
 * - "3" => gold chest drops
 * - "4" => MVP/Host/Red chest drops
 * - "11" => blue chest drops
 * - "13" => (maybe purple?) chest drops
 * - "15" => (maybe purple?) chest drops
 * - "16" => Conditional/Extra/Light Blue chest drops
 * @property {string} url - The return url that clicking the continue button will bring you to
 */

/**
 * - A JSON containing information about any items that were dropped by the stage
 * @typedef TableEntry
 * @property {number} epochTime Time in ms (from Jan 1, 1970) when the entry was created
 * @property {number} blueChest Number of blue chests dropped in this entry
 * @property {number} redChest Number of blue chests dropped in this entry
 * @property {number} extraChest Number of purple/sky blue chests dropped in this entry
 * @property {object} itemList JSON containing information about items that were dropped for this entry
 * - An item's ID {string} is the key and it's count {string} is the value
 */

/**
 * An array of TableEntry objects representing the data recorded for a tracked stage
 * @typedef {TableEntry[]} TableData
 */

/**
 * Unique request identifier.
 * @typedef Network
 * @property {object} request HTTP request data
 * @property {string} request.url Request URL
 * @property {string} requestId
 */

/**
 * Debuggee identifier. Either tabId, extensionId or targetId must be specified.
 * @typedef Debuggee
 * @property {string=} extensionId The id of the extension which this debugger is attached to.
 * @property {number=} tabId The id of the tab this debugger is attached to.
 * @property {string=} targetId The opaque id of the target this debugger is attached to.
 */

/**
 * A chrome extension object containing information about a browser tab.
 * @typedef Tab
 * @property {string} url The last committed URL of the main frame of the tab. 
 * @property {number} id The ID of the tab. Tab IDs are unique within a browser session. 
 */

/** 
 * Contains the Regex to check if URLs match certain conditions.
 * @typedef UrlRegexJson
 * @property {RegExp} gameUrlRegex - Granblue Fantasy URL
 * @property {RegExp} extensionUrlRegex - Extension page URL
 * @property {RegExp} soloResultUrlRegex - Solo fight results landing page URL
 * @property {RegExp} raidResultUrlRegex - Raid results landing page URL
 * @property {RegExp} resultUrlRegex - Any fight results landing page
 * @property {RegExp} soloRewardUrlRegex - Solo battle results JSON file URL
 * @property {RegExp} raidRewardUrlRegex - Raid results JSON file URL
 * @property {RegExp} rewardUrlRegex - Any fight results JSON file URL
 * @property {RegExp} sandboxStavesRegex - Sandbox zone E-H URL
 * @property {RegExp} sandboxSwordsRegex - Sandbox zone I-L URL
 * @property {RegExp} sandboxGenesisRegex - Sandbox zone M URL
 * @property {RegExp} sephiraStockRegex - Current sephira sandbox chest stock JSON file URL
 * @property {RegExp} sephiraOpenRegex - Sephira chest opening rewards JSON file URL
 * @property {RegExp} sephiraUrlRegex - Sephira Sandbox chest stock JSON file URL
 * @property {RegExp} xenoboxUrlRegex - URLs that may contain xeno box drops
 * @property {RegExp} whitelist - URLs that will pass the network listener
 */

/**
 * @typedef ControllerElements
 * @property {HTMLElement} controllerHead
 * @property {HTMLElement} addTrackerButton
 * @property {HTMLElement} removeTrackerButton
 * @property {HTMLElement} clearTrackersButton
 * @property {HTMLElement} controllerBody
 * @property {HTMLElement} backgroundShadow
 * @property {HTMLElement} stageSelectMenu
 * @property {HTMLElement} stageSelectGroups
 * @property {HTMLElement} dataPeriodButton
 * @property {HTMLElement} dataPeriodText
 * @property {HTMLElement} dataPeriodSelector
 * @property {HTMLElement} timerText
 * @property {HTMLElement} resetTimerButton
 * @property {HTMLElement} lastDrop
 * @property {HTMLElement} lastDropName
 * @property {HTMLElement} lastDropItemsContainer
 * @property {HTMLElement} lastDropItems
 */

/** 
 * A collection of HTML elements containing different pieces of the tracker instance 
 * @typedef trackerElements
 * @property {HTMLDivElement} tracker Root element for tracker
 * @property {HTMLDivElement} stageTitleText Title of tracker
 * @property {HTMLDivElement | undefined} trackerInfoPortrait Div holding image for the stage
 * @property {HTMLDivElement | undefined} killsRow Div containing kill info (part of stats block)
 * @property {HTMLDivElement | undefined} killsText Div containing kill count text (part of stats block)
 * @property {HTMLDivElement | undefined} redChestRow Div containing red chest info (part of stats block)
 * @property {HTMLDivElement | undefined} redChestText Div containing red chest count text (part of stats block)
 * @property {HTMLDivElement | undefined} blueChestRow Div containing blue chest info (part of stats block)
 * @property {HTMLDivElement | undefined} blueChestText Div containing blue chest count text (part of stats block)
 * @property {HTMLDivElement | undefined} extraChestRow Div containing extra chest info (part of stats block)
 * @property {HTMLDivElement | undefined} extraChestText Div containing extra chest count text (part of stats block)
 * @property {HTMLDivElement} lootContainer Div holding all pieces of the loot tracker
 * @property {HTMLDivElement} xenoBoxes Div holding Xeno Boxes. Only exists on trackers of type "2"
 * @property {HTMLDivElement} luckyLoot Div holding lucky loot title and info about lucky loot
 * @property {HTMLDivElement} luckyLootDrops Div holding info about lucky loot
 * @property {HTMLDivElement} commonLoot Div holding common loot title and info about common loot
 * @property {HTMLDivElement} commonLootDrops Div holding info about common loot
 * @property {NodeList | undefined} sephiraBoxes Collection of all text elements for the sephira box tracker (stageType = 1) 
 * @property {HTMLDivElement} trackerRemoveClickbox Div element that when active, covers the entire tracker and deletes it when clicked
 */

/**
 * Stores settings for the tracker instance
 * @typedef trackerSettings The settings of a tracker instance
 * @property {string} stageType ID for the type of data being tracked
 * @property {string} selectedStage The name of the stage being tracked
 * @property {string[]} otherStages Other stages besides "selectedStage" that may be recorded by the tracker.\
 * Unused for now
 */

/**
 * @typedef extensionSettings
 * @property {boolean} darkmode Bool if darkmode background is used
 * @property {string} dataPeriod String representing what the current period being tracked is.\n
 * - "0" => All data
 * - "1" => Data within the month
 * - "2" => Data within the week
 * - "3" => Data within the day
 * - "4" => Data since a custom timer was started
 * @property {string} latestVersion A string storing the last known latest version taken from the extension's github page
 * @property {selectedBoss[]} selectedBoss An array storing the currently tracked bosses. This array is read when the tracker controller is opened and determines which trackers are built at initialization
 * @property {number} timeCheckedLastVersion The datetime in ms representing the last time that the extension checked github for the latest version
 * @property {number} timerStart The datetime that the timer was started. This timer is the one used for dataPeriod = 4
 * @property {boolean} useLastDrop Setting that determines if the latest drop is displayed in the tracker controller header
 * @property {boolean} useUnlockedStage Setting that determines if the extension will use an unlocked stage at the end of the tracker controller that always updates to any untracked stage
 */

/**
 * The format that the currently tracked bosses are stored in the extension settings
 * @typedef selectedBoss
 * @property {boolean} isLocked A redundant flag set to true. Would determine if a stage can be swapped for another if an untracked stage drop is detected.\
 * Since untracked stages aren't stored in localstorage, this will always be true.
 * @property {string} stage The name of the stage.
 * @property {string} type The type of stage being tracked... 
 */
