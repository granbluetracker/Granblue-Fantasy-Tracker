// Credit goes to sumitpore
// Taken from https://gist.github.com/sumitpore/47439fcd86696a71bf083ede8bbd5466

/**
 * Retrieve object from Chrome's Local StorageArea using background script
 * @param {string} key 
 */
const getObjectFromLocalStorage = async function (key, isStageData = false) {
    return new Promise((resolve, reject) => {
        try {
            let request = {
                message: {
                    action: "getData",
                    params: {
                        storageKey: key,
                        isStageData: isStageData
                    }
                }
            }
            chrome.runtime.sendMessage(request, function (message) {
                var lastError = chrome.runtime.lastError;
                if (lastError){throw new Error(lastError.message);}
                resolve(message.response);
            });
        } catch (ex) {
            reject(ex);
        }
    });
};

/**
 * Save Object in Chrome's Local StorageArea Retrieve using background script
 * @param {*} obj 
 */
const saveObjectInLocalStorage = async function (obj) {
    return new Promise((resolve, reject) => {
        try {
            let request = {
                message: {
                    action: "setData",
                    params: {
                        data: obj,
                    }
                }
            }
            chrome.runtime.sendMessage(request, function (message) {
                var lastError = chrome.runtime.lastError;
                if (lastError){throw new Error(lastError.message);}
                resolve(message.response);
            });
        } catch (ex) {
            reject(ex);
        }
    });
};

const rebalanceStageInLocalStorage = async function (stageNames) {
    return new Promise((resolve, reject) => {
        try {
            let request = {
                message: {
                    action: "recalculateData",
                    params: {
                        data: stageNames
                    }
                }
            }
            chrome.runtime.sendMessage(request, function (message) {
                resolve(message.response);
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
const removeObjectFromLocalStorage = async function (keys) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.remove(keys, function () {
                resolve();
            });
        } catch (ex) {
            reject(ex);
        }
    });
};

export {
    getObjectFromLocalStorage,
    saveObjectInLocalStorage,
    removeObjectFromLocalStorage,
    rebalanceStageInLocalStorage
}