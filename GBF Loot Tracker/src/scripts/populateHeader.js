const headerVersion = document.getElementById("headerVersion");
var currentVersion = chrome.runtime.getManifest();
currentVersion = currentVersion.version;
headerVersion.innerHTML = "&nbsp;v" + currentVersion;