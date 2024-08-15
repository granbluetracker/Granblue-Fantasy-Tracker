import requests
import os
from sys import exit
from sys import argv
from zipfile import ZipFile
from tqdm import tqdm

def compareVersions(v1, v2):
    v1 = [int(v) for v in v1.split(".")]
    v2 = [int(v) for v in v2.split(".")]
    for l in range(max(len(v1),len(v2))):
        v1d = v1[l] if l < len(v1) else 0
        v2d = v2[l] if l < len(v2) else 0
        if v1d > v2d:
            print("{0} > {1}".format(v1, v2))
            return 1
        elif v1d < v2d:
            print("{0} < {1}".format(v1, v2))
            return -1    
    return 0

print("GBF Loot Tracker Updater v1.0.0")

# Sets myPath to be the current folder that the updater is in
myPath = os.path.dirname(argv[0])
print("Updater is in: {}".format(myPath))

# Path to the folder that the extension uses
folderPath = myPath + r'\GBF Loot Tracker'
# Path to the manifest.json file that the extension uses
manifestPath = myPath + r'\GBF Loot Tracker\manifest.json'
print("Checking if path \"{0}\" is valid: {1}".format(folderPath, os.path.isdir(folderPath)))
if not os.path.isdir(folderPath):
    print("Error, could not find the folder that the extension was installed in")
    print("The \"GBF Loot Tracker\" folder should be in the same directory as the updater")
    input("Press enter to quit")
    exit()
print("Checking if file \"{0}\" is valid: {1}".format(manifestPath, os.path.isfile(manifestPath)))
if not os.path.isfile(manifestPath):
    print("Error, could not find the manifest.json file for the extension")
    input("Press enter to quit")
    exit()

print("Path to manifest.json confirmed to be: {0}".format(manifestPath))
print("Opening manifest.json to find current extension version...")

fp = open(manifestPath, 'r')
lines = fp.readlines()
fp.close()
currentVersion = ""
for line in lines:
    if line.find("\"version\"") != -1:
        print("Line containing \"version\" was found.")
        print(line)
        firstDigitIndex = 0
        lastDigitIndex = 0
        for i, c in enumerate(line):
            if c.isdigit():
                if firstDigitIndex == 0:
                    firstDigitIndex = i
                lastDigitIndex = i
        currentVersion = line[firstDigitIndex:lastDigitIndex+1]
        break

print("Current version determined to be: {0}".format(currentVersion))

print("Finding latest version...")
# Location of the latest version of the extension
apiURL = "https://api.github.com/repos/granbluetracker/Granblue-Fantasy-Tracker/releases/latest"
# Gets the information about the latest version
response = requests.get(apiURL)
myJson = response.json()
# Stores the tag_name for the latest extension version in latestTag which is also the latest version
latestTag = myJson["tag_name"]
print("Found latest version: {}".format(latestTag))
# removes the "v" from the tag to get the version number
latestVersion = latestTag[1:]

# latest > current = 1, latest == current = 0, latest < current = -1
needsUpdate = compareVersions(latestVersion, currentVersion)
if needsUpdate != 1:
    print("You are all up to date!")
    input("Press enter to quit")
    exit()

print("Would you like to upgrade from version {0} to version {1}?".format(currentVersion, latestVersion))
choice = input("Please type \"yes\" or \"no\" (yes/no): ")
choice = choice.lower()
if choice == "yes" or choice == "y" or choice == "true":
    choice = "yes"
if choice != "yes":
    print("input was not \"yes\"")
    input("Press enter to quit")
    exit()
# Where to download the latest version of the extension code
downloadURL = 'https://github.com/granbluetracker/Granblue-Fantasy-Tracker/releases/download/{0}/GBF.Loot.Tracker.{1}.zip'.format(latestTag, latestVersion)
print("Downloading latest version from: {}".format(downloadURL))

# Downloads the latest extension version as a zip
r = requests.get(downloadURL, allow_redirects=True, stream=True)


zipPath = myPath + "\\GBF.Loot.Tracker.{0}.zip".format(latestVersion)
print("Writing download to: \"{0}\"".format(zipPath))

totalSize = int(r.headers.get('content-length', 0))
progressBar = tqdm(total=totalSize, unit='iB', unit_scale=True)


# Stores the downloaded zip in the same directory as the updater
with open(zipPath, 'wb') as f:
    for chunk in r.iter_content(chunk_size=1024 * 8):
        if chunk:
            progressBar.update(len(chunk))
            f.write(chunk)
            f.flush()
            os.fsync(f.fileno())
progressBar.close()
print("Download complete!")
print("Unzipping latest extension version")
# Now to unpack the downloaded zip
with ZipFile(zipPath, "r") as zip_ref:
    zip_ref.extractall(myPath)
print("Latest version unpacked!")
print("Deleting leftover zip.")
# Now to delete the downloaded zip
os.remove(zipPath)
print("leftover zip was deleted!")
input("Extension updated successfully! Press enter to quit")