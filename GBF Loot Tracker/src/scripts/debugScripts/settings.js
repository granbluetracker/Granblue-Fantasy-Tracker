import CommandManager from '../debugScripts/commands.js';

await CommandManager.init();

const restoreData = document.getElementById("restoreData");
const downloadDataButton = document.getElementById("downloadDataButton");
restoreData.addEventListener("change", function (changeEvent) { CommandManager.ImportStorage(changeEvent) });
downloadDataButton.addEventListener("click", CommandManager.ExportStorage);

const printSettingsButton = document.getElementById("printSettingsButton");
printSettingsButton.addEventListener("click", CommandManager.logSettings);
const resetSettingsButton = document.getElementById("resetSettingsButton");
resetSettingsButton.addEventListener("click", CommandManager.resetSettings);
const recalculateDataButton = document.getElementById("recalculateDataButton");
recalculateDataButton.addEventListener("click", CommandManager.recalculateData);
const fixDataButton = document.getElementById("fixDataButton");
fixDataButton.addEventListener("click", CommandManager.dataNorm);



