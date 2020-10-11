// Copyright (c) 2020 Fernando
// Url: https://github.com/dlfernando/
// License: MIT

// Modified and translated to JavaScript by Merrick919

// DESCRIPTION:
//
// This script executes 2 actions:
// 1. The script checks for a new image posted in an Instagram account every 20 seconds.
// 2. If a new image is found, the script posts the new Instagram image to a Discord channel by a webhook.
//
// Variables you have to change are:
// 1. targetInstagramUsername
// 2. webhookID
// 3. webhookURL
//
// For targetInstagramUsername, it's simply the username of the account you want to monitor.
// For webhookID and webhookURL, first create a webhook in Discord, then copy the webhook URL.
// The first part after "https://discordapp.com/api/webhooks/" is the webhook ID (some numbers).
// The second part after the webhook ID is the webhook token.
// You can just replace the targetInstagramURL and webhookURL links directly if you want.

// Requires the node-fetch module.
const fetch = require("node-fetch")

// Requires the fs module.
const fs = require("fs");

// Requires the chalk module.
const chalk = require("chalk");

const targetInstagramUsername = "TARGET_INSTAGRAM_USERNAME_HERE";
const targetInstagramURL = ("https://www.instagram.com/" + targetInstagramUsername + "/?__a=1");

const webhookID = "WEBHOOK_ID_HERE";
const webhookToken = "WEBHOOK_TOKEN_HERE";
const webhookURL = ("https://discordapp.com/api/webhooks/" + webhookID + "/" + webhookToken);

const database = "database.txt";

function writeToFile(content, filename) {

    let filepath = path.join(".", filename);

    fs.access(filepath, fs.constants.R_OK, (err) => {

        if (err) {

            let timeNow = new Date();
            let timeNowISO = timeNow.toISOString();

            console.error(err);
            console.log(chalk.blue(timeNowISO) + chalk.red("An error occured trying to read the file \"" + filename + "\"."));
            
        } else {
            
            fs.writeFile(filepath, content, err => {

                if (err) {

                    let timeNow = new Date();
                    let timeNowISO = timeNow.toISOString();

                    console.error(err);
                    console.log(chalk.blue(timeNowISO) + chalk.red("An error occured trying to write to the file \"" + filename + "\"."));

                }

            });
            
        }

    });

}

function readFromFile(filename) {

    let filepath = (".\\" + filename);

    fs.access(filepath, fs.constants.R_OK, (err) => {

        if (err) {

            let timeNow = new Date();
            let timeNowISO = timeNow.toISOString();

            console.error(err);
            console.log(chalk.blue(timeNowISO) + chalk.red("An error occured trying to read the file \"" + filename + "\"."));
            
        } else {
            
            fs.readFile(filepath, "utf8", (err, data) => {

                if (err) {

                    let timeNow = new Date();
                    let timeNowISO = timeNow.toISOString();

                    console.error(err)
                    console.log(chalk.blue(timeNowISO) + chalk.red("An error occured trying to read the file \"" + filename + "\"."));

                } else {

                    return data;

                }

            });
            
        }

    });
    
}

function getUserFullName(jsonData) {

    return jsonData["graphql"]["user"]["full_name"];

}

function  getTotalPhotos(jsonData) {

    return Math.round(jsonData["graphql"]["user"]["edge_owner_to_timeline_media"]["count"]);

}

function getLastPublicationURL(jsonData) {

    return jsonData["graphql"]["user"]["edge_owner_to_timeline_media"]["edges"][0]["node.shortcode"];

}

function getLastPhotoURL(jsonData) {

    return jsonData["graphql"]["user"]["edge_owner_to_timeline_media"]["edges"][0]["node"]["display_url"];

}

function getLastThumbURL(jsonData) {

    return jsonData["graphql"]["user"]["edge_owner_to_timeline_media"]["edges"][0]["node"]["thumbnail_src"];

}
    
function getDescriptionPhoto(jsonData) {

    return jsonData["graphql"]["user"]["edge_owner_to_timeline_media"]["edges"][0]["node"]["edge_media_to_caption"]["edges"][0]["node"]["text"];

}

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
        embed["description"] = getDescriptionPhoto(jsonData);
        // embed["image"] = {"url":get_last_thumb_url(jsonData)}; // Uncomment this to send a bigger image to Discord.
        embed["thumbnail"] = {"url":getLastThumbURL(jsonData)};
        data["embeds"].append(embed);

        fetch(webhookURL, {

            method: "post",
            body:    JSON.stringify(data),
            headers: { "Content-Type": "application/json" }

        });

    } catch (err) {

        let timeNow = new Date();
        let timeNowISO = timeNow.toISOString();

        console.error(err);
        console.log(chalk.blue(timeNowISO) + chalk.red("An error occured."));

    }

}

async function main() {
     
    try {

        function test(jsonData) {
            
            let timeNow = new Date();
            let timeNowISO = timeNow.toISOString();

            if (readFromFile(database) == getLastPublicationURL(jsonData)) {

                console.log(chalk.blue(timeNowISO) + " No new image(s) found.");
                
            } else {
                        
                writeToFile(getLastPublicationURL(jsonData), database);
                console.log(chalk.blue(timeNowISO) + " New image(s) found.");
                webhook(jsonData);
                        
            }

        }

        const jsonData = await fetch(targetInstagramURL).then(res => res.json());

        setTimeout(function() { test(jsonData); }, 20000);

    } catch (err) {

        let timeNow = new Date();
        let timeNowISO = timeNow.toISOString();

        console.error(err);
        console.log(chalk.blue(timeNowISO) + chalk.red("An error occured."));

    }

}

// Start testing for new images every 20 seconds.
setInterval(function() { main(); }, 20000);