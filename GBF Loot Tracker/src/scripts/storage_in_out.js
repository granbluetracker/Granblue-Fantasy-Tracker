// This is the code used to import or export data in local storage

const restoreData = document.getElementById("restoreData");
const downloadDataButton = document.getElementById("downloadDataButton");
restoreData.addEventListener("change", function(changeEvent){ImportStorage(changeEvent)});
downloadDataButton.addEventListener("click", function(){ExportStorage()});

function ExportStorage(){
  chrome.storage.local.get(null, function(allDataJson){
    console.log("Downloading all data from local storage", allDataJson);
    const allDataString = JSON.stringify(allDataJson);
    const dataBlob = new Blob([allDataString], {type: "application/json"});
    const dataUrl = URL.createObjectURL(dataBlob);
    const dl = document.createElement("a");
    dl.href=dataUrl;
    dl.download = "GBF_Loot_Tracker_Localdata.json";
    dl.click();
  });
}

// ChangeEvent is an event of type change on an input element with type file
function ImportStorage(changeEvent){
  const allDataFile = changeEvent.target.files[0];
  console.log("Writing file to local storage");
  // File isn't empty
  if (allDataFile){
    const fileReader = new FileReader();
    fileReader.onload = function(e){
      var allDataJson = JSON.parse(e.target.result);
      chrome.storage.local.set(allDataJson, function(){
        if (chrome.runtime.lastError){
          console.log("Runtime Error importing data: ", chrome.runtime.lastError)
        }
        else{console.log("Import was successful")}
      })
    }
    fileReader.readAsText(allDataFile);
  }
}
