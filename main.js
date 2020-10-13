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

// Create a new webhook client.
const discordWebhookClient = new Discord.WebhookClient(discordWebhookID, discordWebhookToken);

// The target Instagram URL.
const targetInstagramURL = ("https://www.instagram.com/" + targetInstagramUsername + "/?__a=1");

// The database file (just a text file).
const database = "database.txt";

// Set the database file path.
const filepath = (".\\" + database);

// Function to get the current time in ISO format.
function timeNowISO() {

	let timeNow = new Date();
	let timeNowISO = timeNow.toISOString();
	
	return timeNowISO;

}

// Function to log a message to the console.
function consoleLog(message) {

    console.log(chalk.blue(timeNowISO()) + " " + message);

}

// You can use this to get the target user's full name.
/*
// Function to get the target user's full name.
function getUserFullName(jsonData) {

    consoleLog("Retrieving the target user's full name…");

    return jsonData["graphql"]["user"]["full_name"];

}
*/

// Function to get the target user's avatar URL.
function getAvatarURL(jsonData) {

    consoleLog("Retrieving the target user's avatar URL…");

    return jsonData["graphql"]["user"]["profile_pic_url_hd"];

}

// Function to get the target user's last post URL.
function getLastPostURL(jsonData) {

    consoleLog("Retrieving the target user's last post URL…");

    return jsonData["graphql"]["user"]["edge_owner_to_timeline_media"]["edges"][0]["node"]["shortcode"];

}

// Function to get the target user's last image URL.
function getLastImageURL(jsonData) {

    consoleLog("Retrieving the target user's last image URL…");

    return jsonData["graphql"]["user"]["edge_owner_to_timeline_media"]["edges"][0]["node"]["display_url"];

}

// You can use this to get the target user's last post thumbnail URL.
/*
// Function to get the target user's last post thumbnail URL.
function getLastThumbURL(jsonData) {

    consoleLog("Retrieving the target user's last post thumbnail URL…");

    return jsonData["graphql"]["user"]["edge_owner_to_timeline_media"]["edges"][0]["node"]["thumbnail_src"];

}
*/

// Function to get the target user's last post caption.
// There might not be a caption.
function getImageCaption(jsonData) {

    consoleLog("Retrieving the target user's last post caption…");

    try {

        return jsonData["graphql"]["user"]["edge_owner_to_timeline_media"]["edges"][0]["node"]["edge_media_to_caption"]["edges"][0]["node"]["text"];

    } catch (err) {

        consoleLog("No caption for the last post was found.");

        return false;

    }

}

// Function to send an embed to Discord.
function sendEmbed(jsonData) {

    try {

        // For more information about embeds, read the discord.js documentation at https://discord.js.org/#/docs/main/stable/class/MessageEmbed.

        let color = discordEmbedColour;
        let author = targetInstagramUsername;
        let authorAvatarURL = getAvatarURL(jsonData);
        let authorURL = ("https://www.instagram.com/" + targetInstagramUsername + "/");
        let title = ("New post by @" + targetInstagramUsername);
        let url = ("https://www.instagram.com/p/" + getLastPostURL(jsonData) + "/");
        let caption = getImageCaption(jsonData);
        let image = getLastImageURL(jsonData);
        let footer = "Instagram-posts-to-Discord";
        let footerIconURL = "https://i.imgur.com/WhdOxpN.png";

        // Create the embed.
        if (!caption) {

            // If there is no caption, don't include it.
            embed = new Discord.MessageEmbed()
                .setColor(color)
                .setAuthor(author, authorAvatarURL, authorURL)
                .setTitle(title)
                .setURL(url)
                .setImage(image)
                .setFooter(footer, footerIconURL)
                .setTimestamp();

        } else {

            // If there is a caption, include it.
            embed = new Discord.MessageEmbed()
                .setColor(color)
                .setAuthor(author, authorAvatarURL, authorURL)
                .setTitle(title)
                .setURL(url)
                .setDescription(caption)
                .setImage(image)
                .setFooter(footer, footerIconURL)
                .setTimestamp();

        }

        // Send the embed.
        discordWebhookClient.send({
            username: targetInstagramUsername,
            avatarURL: getAvatarURL(jsonData),
            embeds: [embed],
        });

        consoleLog(chalk.green("Embed sent to Discord."));

    } catch (err) {

        console.error(err);
        consoleLog(chalk.red("An error occured."));

    }

}

// The main function to test for new images/posts and interact with the Discord webhook if there is/are (a) new post(s).
async function main() {
     
    try {

        // The function to test for new images/posts.
        async function test(jsonData) {

            // This compares the recorded old publication URL in the database file
            // with the newest retrieved publication URL.

            // Check if file access is okay first.
            fs.access(filepath, fs.constants.R_OK, (err) => {
        
                if (err) {
        
                    console.error(err);
                    consoleLog(chalk.red("An error occured trying to read the file \"" + filename + "\"."));
                    
                } else {

                    // Read data from the database file.
                    fs.readFile(filepath, "utf8", (err, data) => {
        
                        if (err) {
        
                            console.error(err)
                            consoleLog(chalk.red("An error occured trying to read the file \"" + filename + "\"."));
        
                        } else {
                            
                            consoleLog("Data read from " + filepath + ".");

                            oldData = data;
        
                        }
        
                    });
                    
                }
        
            });

            let newData = getLastPostURL(jsonData);

            async function testData(oldData, newData) {

                consoleLog("Old data: " + oldData);
                consoleLog("New data: " + newData);

                // If the recorded old publication URL is the same as the newest retrieved publication URL,
                // it most likely means that there are no new posts.
                if (oldData == newData) {

                    consoleLog(chalk.yellow("No new post(s) found."));
                
                // If the recorded old publication URL is not the same as the newest retrieved publication URL,
                // it most likely means that there is/are (a) new post(s).
                } else {
                    
                    // Record the new publication URL to the database file.
                    consoleLog(chalk.green("New post(s) found."));

                    sendEmbed(jsonData);

                    // Check if file access is okay first.
                    fs.access(filepath, fs.constants.R_OK, (err) => {
                
                        if (err) {
                
                            console.error(err);
                            consoleLog(chalk.red("An error occured trying to read the file \"" + filename + "\"."));
                            
                        } else {
                            
                            // Write the new data to the database file.
                            fs.writeFile(filepath, newData, (err) => {
                
                                if (err) {
                
                                    console.error(err);
                                    consoleLog(chalk.red("An error occured trying to write to the file \"" + filename + "\"."));
                
                                } else {

                                    consoleLog("New data written to " + filepath + ".");

                                }
                
                            });
                            
                        }
                
                    });
                    
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
        consoleLog(chalk.red("An error occured."));

    }

}

consoleLog("Script started.")

// Start the main function every x milliseconds.
setInterval(function() { main(); }, delay);