using System;
using System.IO;
using System.IO.Compression;
using System.Net.Http;
using System.Threading.Tasks;

namespace GBFLootTrackerUpdater
{
    // Downloads a new version to destination path, unzips the new version, and deletes the leftover zip
    internal class Program
    {
        // Unpacks the zip that was downloaded and deletes the zip after
        private static void UnpackLatestVersion(string parentDir, string fileName)
        {
            try
            {
                string fileLocation = parentDir + fileName;
                if (!Directory.Exists(parentDir))
                {
                    Console.WriteLine($"Error, directory not found: {parentDir}");
                    Console.WriteLine("Press Enter to quit");
                    Console.ReadLine();
                    Environment.Exit(-1);
                }
                Console.WriteLine($"Extracting zip from: \"{fileLocation}\" to: \"{parentDir}\"");
                ZipFile.ExtractToDirectory(fileLocation, parentDir, true);
                Console.WriteLine("Zip extracted successfully!");
                Console.WriteLine("Cleaning up and deleting zip...");
                File.Delete(fileLocation);
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error when trying to extract zip: {e}");
            }
            
        }
        private static async Task<string> DownloadLatestVersion(string version, string destinationPath)
        {
            string downloadURL =
                $@"https://github.com/granbluetracker/Granblue-Fantasy-Tracker/releases/download/v{version}/GBF.Loot.Tracker.{version}.zip";
            destinationPath += $@"\GBF.Loot.Tracker.{version}.zip";
            // Console.WriteLine($"Download URL: {downloadURL}");
            // Console.WriteLine($"Destination path: {destinationPath}");

            using (HttpClient httpClient = new HttpClient())
            {
                try
                {
                    // Modifies headers so that the request to github is not rejected
                    httpClient.DefaultRequestHeaders.Add("User-Agent", "Granblue-Fantasy-Tracker");
                    httpClient.DefaultRequestHeaders.Add("Accept", "application/vnd.github+json");
                    httpClient.DefaultRequestHeaders.Add("X-Github-Api-Version", "2022-11-28");
                    using (HttpResponseMessage response = await httpClient.GetAsync(downloadURL))
                    using (HttpContent content = response.Content)
                    {
                        if (response.IsSuccessStatusCode)
                        {
                            Console.WriteLine($"Status code: {response.StatusCode}");
                            Console.WriteLine("Starting Download...");
                            using (Stream stream = await content.ReadAsStreamAsync())
                            using (FileStream fileStream = File.Create(destinationPath))
                            {
                                long fileSize = stream.Length;
                                Console.WriteLine($"Download size: {fileSize/1048576}MB");
                                await stream.CopyToAsync(fileStream);
                                return "Download was successful!";
                            }
                        }
                        else
                        {
                            Console.WriteLine($"Error, response was not ok: {response.StatusCode}");
                            return "Response was not ok";
                        }
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine($"An error occured: {e}");
                    return "An error occured";
                }
            }
        }
        // Gets the latest version number of the extension from Github
        private static async Task<string> GetLatestVersion()
        {
            // API URL to get info about the latest release for the project
            string apiLatestVersionUrl = @"https://api.github.com/repos/granbluetracker/Granblue-Fantasy-Tracker/releases/latest";
            using (HttpClient httpClient = new HttpClient())
            {
                try
                {
                    // Modifies headers so that the request to github is not rejected
                    httpClient.DefaultRequestHeaders.Add("User-Agent", "Granblue-Fantasy-Tracker");
                    httpClient.DefaultRequestHeaders.Add("Accept", "application/vnd.github+json");
                    httpClient.DefaultRequestHeaders.Add("X-Github-Api-Version", "2022-11-28");
                    HttpResponseMessage response = await httpClient.GetAsync(apiLatestVersionUrl);
                    if (response.IsSuccessStatusCode)
                    {
                        string responseBody = await response.Content.ReadAsStringAsync();
                        // Now to get the version number from the response body
                        string targetString = "\"tag_name\"";
                        int indexOfTarget = responseBody.IndexOf(targetString);
                        string versionSubstringStart = responseBody.Substring(indexOfTarget);
                        // Now extracts version from string
                        int indexStart = 0;
                        int indexEnd = 0;
                        int curIndex = 0;
                        foreach (char c in versionSubstringStart)
                        {
                            if (Char.IsNumber(c))
                            {
                                if (indexStart == 0)
                                {
                                    indexStart = curIndex;
                                }
                                indexEnd = curIndex;
                            }
                            // Breaks foreach loop if ',' is hit (no longer looking at version number)
                            if (c.Equals(',')) {break;}
                            curIndex++;
                        }
                        string latestVersion = versionSubstringStart.Substring(indexStart, indexEnd + 1 - indexStart);
                        Console.WriteLine($"latestVersion: {latestVersion}");
                        return latestVersion;
                    }
                    else
                    {
                        Console.WriteLine($"An error has occured: {response.StatusCode}, {response.ReasonPhrase}");
                    }
                }
                catch (Exception e){Console.WriteLine($"Error {e.Message}");}
            }
            Console.WriteLine("Return without response...");
            return "";
        }

        private static string GetCurrentVersion(string parentDirectory)
        {
            string manifestPath = parentDirectory + @"\GBF Loot Tracker\manifest.json";
            string currentVersion = "";
            try
            {
                StreamReader sr = new StreamReader(manifestPath);
                string fileLine = sr.ReadLine();
                while (fileLine != null)
                {
                    if (fileLine.Contains("\"version\"")) {
                        currentVersion = fileLine;
                        break;
                    }
                    fileLine = sr.ReadLine();
                }
                sr.Close();
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception hit: " + e.Message);
            }
            if (currentVersion == "")
            {
                Console.WriteLine("Version was not found in manifest...");
                Console.WriteLine("Press Enter to quit");
                Console.ReadLine();
                Environment.Exit(-1);
            }
            // Now extracts version from string
            int indexStart = 0;
            int indexEnd = 0;
            int curIndex = 0;
            foreach (char c in currentVersion)
            {
                if (Char.IsNumber(c))
                {
                    if (indexStart == 0)
                    {
                        indexStart = curIndex;
                    }
                    indexEnd = curIndex;
                }
                curIndex++;
            }

            currentVersion = currentVersion.Substring(indexStart, indexEnd + 1 - indexStart);
            Console.WriteLine("Detected version: {0}", currentVersion);
            return currentVersion;
        }
        
        // Compares 2 different version numbers. If v1>v2, returns 1, if v1=v2, returns 0, if v1<v2, returns -1
        private static int CompareVersion(string version1, string version2)
        {
            string[] v1Array = version1.Split('.');
            string[] v2Array = version2.Split('.');
            for (int i = 0; i < Math.Max(v1Array.Length, v2Array.Length); i++)
            {
                int v1Num = (v1Array.Length >= i) ? Int32.Parse(v1Array[i]) : 0;
                int v2Num = (v2Array.Length >= i) ? Int32.Parse(v2Array[i]) : 0;
                if (v1Num>v2Num){Console.WriteLine("{0} > {1}", version1, version2); return 1;}
                if (v1Num<v2Num){Console.WriteLine("{0} < {1}", version1, version2); return -1;}
            }
            return 0;
        }
        // Verifies that the extension is in the same directory as this program, and that the extension has a valid manifest
        static string CheckIntegrity()
        {
            string parentDir = Directory.GetCurrentDirectory();
            Console.WriteLine($"Detected parent directory as: {parentDir}");
            string extensionPath = parentDir + @"\GBF Loot Tracker";
            string manifestPath = extensionPath + @"\manifest.json";
            // String cwd = Directory.GetCurrentDirectory();
            // Console.WriteLine(cwd);
            // Finds if the extension dir exists
            if (!Directory.Exists(extensionPath))
            {
                Console.WriteLine($"Extension folder \"{extensionPath}\" doesn't exist");
                Console.WriteLine("This can happen if the updater is not in the same folder as the GBF Loot Tracker folder.");
                Console.WriteLine("Press Enter to quit");
                Console.ReadLine();
                Environment.Exit(-1);
            }
            Console.WriteLine("Extension path was valid!");
            // Finds if extension manifest exists
            if (!File.Exists(manifestPath))
            {
                Console.WriteLine($"manifest.json wasn't found at: \"{manifestPath}\"");
                Console.WriteLine("This can happen if the GBF Loot Tracker folder was empty or did not contain the manifest.json file.");
                Console.WriteLine("Press Enter to quit");
                Console.ReadLine();
                Environment.Exit(-1);
            }
            Console.WriteLine("Manifest file was valid!");
            return parentDir;
        }

        public static void Main(string[] args)
        {
            // First, checks that files and folders are in the right place and gets the parent directory of the extension
            Console.WriteLine("[Step 1]Checking if extension is in the correct place");
            string parentDir = CheckIntegrity();
            // Checks the manifest.json file for the currently installed version
            Console.WriteLine("[Step 2]Checking currently installed version");
            string clientVersion = GetCurrentVersion(parentDir);
            // Now gets latest version from Github
            Console.WriteLine("[Step 3]Checking latest version on Github");
            Task<string> latestVersionTask = GetLatestVersion();
            string latestVersion = latestVersionTask.Result;
            Console.WriteLine($"Installed Version: {clientVersion}, Latest Version: {latestVersion}");
            Console.WriteLine("[Step 4]Comparing versions to check if update is possible");
            // Compares version numbers and quits if client is up to date
            if (CompareVersion(latestVersion, clientVersion) != 1)
            {
                Console.WriteLine("Your version is up to date...");
                Console.WriteLine("Press Enter to quit");
                Console.ReadLine();
                Environment.Exit(-1);
            }
            // Prompts user if they want to upgrade
            Console.WriteLine($"Latest version: {latestVersion} > Current Version: {clientVersion}");
            Console.WriteLine("Type yes to upgrade or no to quit: ");
            string input = Console.ReadLine();
            input = input.ToLower();
            if (!(input == "yes" || input == "y" || input == "true"))
            {
                Console.WriteLine("Did not type: yes");
                Console.WriteLine("Press Enter to quit");
                Console.ReadLine();
                Environment.Exit(-1);
            }
            // Downloads latest version
            Console.WriteLine("[Step 5]Downloading latest version of the extension");
            Task<string> updateStatus = DownloadLatestVersion(latestVersion, parentDir);
            Console.WriteLine($"Download status: {updateStatus.Result}");
            if (updateStatus.Result != "Download was successful!")
            {
                Console.WriteLine("Press Enter to quit");
                Console.ReadLine();
                Environment.Exit(-1);
            }
            Console.WriteLine("[Step 6]Installing latest version from download");
            UnpackLatestVersion(parentDir, $@"\GBF.Loot.Tracker.{latestVersion}.zip");
            clientVersion = GetCurrentVersion(parentDir);
            if (clientVersion == latestVersion)
            {
                Console.WriteLine($"Installed Version: {clientVersion} == Latest Version: {latestVersion}");
                Console.WriteLine("Update successfully installed!");
                Console.WriteLine("Press Enter to quit");
                Console.ReadLine();
                Environment.Exit(1);
            }
            Console.WriteLine($"Installed Version: {clientVersion} =/= Latest Version: {latestVersion}");
            Console.WriteLine("Update wasn't successfully installed!");
            Console.WriteLine("Press Enter to quit");
            Console.ReadLine();
            Environment.Exit(1);
            Console.ReadLine();
        }
    }
}