// Requiring this allows access to the environment variables of the running node process.
require("dotenv").config();

// Sets the target Instagram username.
const targetInstagramUsername = process.env.TARGET_INSTAGRAM_USERNAME;

// Sets the Discord webhook ID.
const discordWebhookID = process.env.DISCORD_WEBHOOK_ID;

// Sets the Discord webhook token.
const discordWebhookToken = process.env.DISCORD_WEBHOOK_TOKEN;

// Sets the delay.
// The delay has to be same for all locations that use this variable
// or the timing will be incorrect.
const delay = process.env.DELAY;

// Sets the Discord embed colour.
const discordEmbedColour = process.env.DISCORD_EMBED_COLOUR;

// Requires the node-fetch module.
const fetch = require("node-fetch");

// Requires the discord.js module.
const Discord = require('discord.js');

// Requires the fs module.
const fs = require("fs");

// Requires the chalk module.
const chalk = require("chalk");

// The target Instagram URL.
const targetInstagramURL = ("https://www.instagram.com/" + targetInstagramUsername + "/?__a=1");

// The database file (just a text file).
const database = "database.txt";

// Create a new webhook client.
const discordWebhookClient = new Discord.WebhookClient(discordWebhookID, discordWebhookToken);

// Function to get the current time in ISO format.
function timeNowISO() {

	let timeNow = new Date();
	let timeNowISO = timeNow.toISOString();
	
	return timeNowISO;

}

// Function to read data from the database file.
async function readFromFile(filename) {

    let filepath = (".\\" + filename);

    fs.access(filepath, fs.constants.R_OK, (err) => {

        if (err) {

            console.error(err);
            console.log(chalk.blue(timeNowISO()) + " " + chalk.red("An error occured trying to read the file \"" + filename + "\"."));
            
        } else {
            
            fs.readFile(filepath, "utf8", (err, data) => {

                if (err) {

                    console.error(err)
                    console.log(chalk.blue(timeNowISO()) + " " + chalk.red("An error occured trying to read the file \"" + filename + "\"."));

                } else {

                    return data;

                }

            });
            
        }

    });
    
}

// Function to write data to the database file.
async function writeToFile(filename, content) {

    let filepath = (".\\" + filename);

    fs.access(filepath, fs.constants.R_OK, (err) => {

        if (err) {

            console.error(err);
            console.log(chalk.blue(timeNowISO()) + " " + chalk.red("An error occured trying to read the file \"" + filename + "\"."));
            
        } else {
            
            fs.writeFile(filepath, content, err => {

                if (err) {

                    console.error(err);
                    console.log(chalk.blue(timeNowISO()) + " " + chalk.red("An error occured trying to write to the file \"" + filename + "\"."));

                }

            });
            
        }

    });

}

// Function to get the target user's full name.
function getUserFullName(jsonData) {

    return jsonData["graphql"]["user"]["full_name"];

}

// Function to get the target user's avatar URL.
function getAvatarURL(jsonData) {

    return jsonData["graphql"]["user"]["profile_pic_url_hd"];

}

// Function to get the target user's total image/post count.
function getTotalImages(jsonData) {

    return Math.round(jsonData["graphql"]["user"]["edge_owner_to_timeline_media"]["count"]);

}

// Function to get the target user's last publication URL.
function getLastPublicationURL(jsonData) {

    return jsonData["graphql"]["user"]["edge_owner_to_timeline_media"]["edges"][0]["node"]["shortcode"];

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

// Function to send an embed to Discord.
function sendEmbed(jsonData) {

    try {

        // Create the embed.
        let embed = new Discord.MessageEmbed()
            .setColor(discordEmbedColour)
            .setAuthor(targetInstagramUsername, getAvatarURL(jsonData), ("https://www.instagram.com/" + targetInstagramUsername + "/"))
            .setTitle("New post by @" + targetInstagramUsername)
            .setURL("https://www.instagram.com/p/" + getLastPublicationURL(jsonData) + "/")
            .setDescription(getImageDescription(jsonData))
            .setImage(getLastThumbURL(jsonData))
            .setFooter("Instagram-posts-to-Discord")
            .setTimestamp();

        // Send the embed.
        discordWebhookClient.send({
            username: targetInstagramUsername,
            avatarURL: getAvatarURL(jsonData),
            embeds: [embed],
        });

    } catch (err) {

        console.error(err);
        console.log(chalk.blue(timeNowISO()) + " " + chalk.red("An error occured."));

    }

}

// The main function to test for new images/posts and interact with the Discord webhook if there is/are (a) new image(s)/post(s).
async function main() {
     
    try {

        // The function to test for new images/posts.
        async function test(jsonData) {

            // This compares the recorded old publication URL in the database file
            // with the newest retrieved publication URL.

            let oldData = await readFromFile(database);
            let newData = await getLastPublicationURL(jsonData);

            async function testData(oldData, newData) {

                // If the recorded old publication URL is the same as the newest retrieved publication URL,
                // it most likely means that there are no new images/posts.
                if (oldData == newData) {

                    console.log(chalk.blue(timeNowISO()) + " " + chalk.yellow("No new image(s)/post(s) found."));
                
                // If the recorded old publication URL is not the same as the newest retrieved publication URL,
                // it most likely means that there is/are (a) new image(s)/post(s).
                } else {
                    
                    // Record the new publication URL to the database file.
                    writeToFile(database, newData);
                    console.log(chalk.blue(timeNowISO()) + " " + chalk.green("New image(s)/post(s) found."));
                    sendEmbed(jsonData);
                            
                }

            }
            
            // Wait x milliseconds so the data can be retrieved.
            setTimeout(function() { testData(oldData, newData); }, delay);

        }

        // Use the node-fetch module to retrieve the data.
        let jsonData = await fetch(targetInstagramURL).then(res => res.json());

        // Wait x milliseconds so the data can be retrieved. 
        setTimeout(function() { test(jsonData); }, delay);

    } catch (err) {

        console.error(err);
        console.log(chalk.blue(timeNowISO()) + " " + chalk.red("An error occured."));

    }

}

// Start the main function every x milliseconds.
setInterval(function() { main(); }, delay);