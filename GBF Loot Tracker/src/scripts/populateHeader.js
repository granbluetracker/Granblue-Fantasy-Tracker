const header = document.getElementById("headerVersion");
var currentVersion = chrome.runtime.getManifest();
currentVersion = currentVersion.version;
header.innerHTML = "&nbsp;v" + currentVersion;