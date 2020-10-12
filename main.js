// Requiring this allows access to the environment variables of the running node process.
require("dotenv").config();

// Sets the target Instagram username.
const targetInstagramUsername = process.env.TARGET_INSTAGRAM_USERNAME;

// Sets the Discord webhook URL.
const discordWebhookURL = process.env.DISCORD_WEBHOOK_URL;

// Sets the delay.
// The delay has to be same for both locations that use this variable
// or the timing will be incorrect.
const delay = process.env.DELAY;

// Requires the node-fetch module.
const fetch = require("node-fetch");

// Requires the fs module.
const fs = require("fs");

// Requires the chalk module.
const chalk = require("chalk");

// The target Instagram URL.
const targetInstagramURL = ("https://www.instagram.com/" + targetInstagramUsername + "/?__a=1");

// The database file (just a text file).
const database = "database.txt";

// Function to get the current time in ISO format.
function timeNowISO() {

	let timeNow = new Date();
	let timeNowISO = timeNow.toISOString();
	
	return timeNowISO;

}

// Function to write data to the database file.
function writeToFile(content, filename) {

    let filepath = (".\\" + filename);

    fs.access(filepath, fs.constants.R_OK, (err) => {

        if (err) {

            console.error(err);
            console.log(chalk.blue(timeNowISO()) + chalk.red("An error occured trying to read the file \"" + filename + "\"."));
            
        } else {
            
            fs.writeFile(filepath, content, err => {

                if (err) {

                    console.error(err);
                    console.log(chalk.blue(timeNowISO()) + chalk.red("An error occured trying to write to the file \"" + filename + "\"."));

                }

            });
            
        }

    });

}

// Function to read data from the database file.
function readFromFile(filename) {

    let filepath = (".\\" + filename);

    fs.access(filepath, fs.constants.R_OK, (err) => {

        if (err) {

            console.error(err);
            console.log(chalk.blue(timeNowISO()) + chalk.red("An error occured trying to read the file \"" + filename + "\"."));
            
        } else {
            
            fs.readFile(filepath, "utf8", (err, data) => {

                if (err) {

                    console.error(err)
                    console.log(chalk.blue(timeNowISO()) + chalk.red("An error occured trying to read the file \"" + filename + "\"."));

                } else {

                    return data;

                }

            });
            
        }

    });
    
}

// Function to get the target user's full name.
function getUserFullName(jsonData) {

    return jsonData["graphql"]["user"]["full_name"];

}

// Function to get the target user's total image/post count.
function getTotalImages(jsonData) {

    return Math.round(jsonData["graphql"]["user"]["edge_owner_to_timeline_media"]["count"]);

}

// Function to get the target user's last publication URL.
function getLastPublicationURL(jsonData) {

    return jsonData["graphql"]["user"]["edge_owner_to_timeline_media"]["edges"][0]["node.shortcode"];

}

// Function to get the target user's last image/post URL.
function getLastImageURL(jsonData) {

    return jsonData["graphql"]["user"]["edge_owner_to_timeline_media"]["edges"][0]["node"]["display_url"];

}

// Function to get the target user's last thumbnail URL.
function getLastThumbURL(jsonData) {

    return jsonData["graphql"]["user"]["edge_owner_to_timeline_media"]["edges"][0]["node"]["thumbnail_src"];

}

// Function to get the target user's image/post description.
function getImageDescription(jsonData) {

    return jsonData["graphql"]["user"]["edge_owner_to_timeline_media"]["edges"][0]["node"]["edge_media_to_caption"]["edges"][0]["node"]["text"];

}

// Function to interact with the Discord webhook.
function webhook(jsonData) {

    try {

        // For all parameters, see https://discordapp.com/developers/docs/resources/webhook#execute-webhook.
        // For all parameters, see https://discordapp.com/developers/docs/resources/channel#embed-object.

        data = {};
        data["embeds"] = [];
        embed = {};
        embed["color"] = 15467852;
        embed["title"] = ("New pic of @" + targetInstagramUsername);
        embed["url"] = ("https://www.instagram.com/p/" + getLastPublicationURL(jsonData) + "/");
        embed["description"] = getImageDescription(jsonData);
        // embed["image"] = {"url":get_last_thumb_url(jsonData)}; // Uncomment this to send a bigger image to Discord.
        embed["thumbnail"] = {"url":getLastThumbURL(jsonData)};
        data["embeds"].append(embed);

        // Use the node-fetch module to interact with the Discord webhook.
        fetch(discordWebhookURL, {

            method: "post",
            body:    JSON.stringify(data),
            headers: { "Content-Type": "application/json" }

        });

    } catch (err) {

        console.error(err);
        console.log(chalk.blue(timeNowISO()) + chalk.red("An error occured."));

    }

}

// The main function to test for new images/posts and interact with the Discord webhook if there is/are (a) new image(s)/post(s).
async function main() {
     
    try {

        // The function to test for new images/posts.
        function test(jsonData) {

            // This compares the recorded old publication URL in the database file
            // with the newest retrieved publication URL.

            // If the recorded old publication URL is the same as the newest retrieved publication URL,
            // it most likely means that there are no new images/posts.
            if (readFromFile(database) == getLastPublicationURL(jsonData)) {

                console.log(chalk.blue(timeNowISO()) + " " + chalk.yellow("No new image(s) found."));
            
            // If the recorded old publication URL is not the same as the newest retrieved publication URL,
            // it most likely means that there is/are (a) new image(s)/post(s).
            } else {
                
                // Record the new publication URL to the database file.
                writeToFile(getLastPublicationURL(jsonData), database);
                console.log(chalk.blue(timeNowISO()) + " " + chalk.green("New image(s) found."));
                webhook(jsonData);
                        
            }

        }

        // Use the node-fetch module to retrieve the data.
        const jsonData = await fetch(targetInstagramURL).then(res => res.json());

        // Wait x seconds so there is a bigger total delay between checks for new images/posts (total: 20 seconds) and so the data can be retrieved. 
        setTimeout(function() { test(jsonData); }, delay);

    } catch (err) {

        console.error(err);
        console.log(chalk.blue(timeNowISO()) + chalk.red("An error occured."));

    }

}

// Start the main function every x seconds.
setInterval(function() { main(); }, delay);