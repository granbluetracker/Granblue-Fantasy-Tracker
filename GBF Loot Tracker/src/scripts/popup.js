chrome.storage.local.get("Settings", function(response){
  try{
    settings = response.Settings;
    const updateLink = document.getElementById("updateLink");
    var currentVersion = chrome.runtime.getManifest();
    currentVersion = currentVersion.version;
    var latestVersion = settings.latestVersion;
    console.log("[popup]Settings: ", settings);
    console.log("[popup]Latest: " + latestVersion + ", Current: " + currentVersion)
    if (latestVersion != currentVersion){
      updateLink.innerHTML = "Update Available: &nbsp;v" + latestVersion;
    }
  }
  catch(error){console.log("Popup failed to check if update", error)}
});

