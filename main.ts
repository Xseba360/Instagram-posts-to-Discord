// Requiring this allows access to the environment variables of the running node process.
import { HexColorString } from 'discord.js'

require("dotenv").config();

// Sets the target Instagram username.
const targetInstagramUsernames = process.env.TARGET_INSTAGRAM_USERNAMES.split(',');

// Sets the Discord webhook ID.
const discordWebhook: Discord.WebhookClientDataIdWithToken = {
  id: process.env.DISCORD_WEBHOOK_ID,
  token: process.env.DISCORD_WEBHOOK_TOKEN
};

// Sets the delay.
// The delay has to be same for all locations that use this variable
// or the timing will be incorrect.
const delay = Number(process.env.DELAY);

// Sets the Discord embed colour.
const discordEmbedColour = process.env.DISCORD_EMBED_COLOUR as HexColorString;

// Requires the node-fetch module.
import fetch from 'node-fetch'

// Requires the discord.js module.
import Discord = require('discord.js')

// Requires the fs module.
import fs = require('fs')

// Requires the chalk module.
import chalk from 'chalk'

// Create a new webhook client.
const discordWebhookClient = new Discord.WebhookClient(discordWebhook);

// The database file (just a text file).
const database = "database.txt";

// Set the database file path.
const filepath = (".\\" + database);

// If delay is too small, shortDelay will be even smaller
// and this will probably not work.
const shortDelay = delay * 0.5;

// Function to get a random integer.
function getRndInteger(min: number, max: number): number {

  return Math.floor(Math.random() * (max - min) ) + min;

}

// Function to get the current time in the ISO format.
function timeNowISO(): string {

  let timeNow = new Date();
  return timeNow.toISOString();

}

// Function to log a message to the console.
function consoleLog (threadID: string, message: number | string): void {

  console.log(chalk.blue(timeNowISO()) + " " + chalk.magenta(threadID) + " " + message);

}

// You can use this to get the target user's full name.
/*
// Function to get the target user's full name.
function getUserFullName(threadID, jsonData) {

    consoleLog(threadID, "Retrieving the target user's full name…");

    return jsonData["graphql"]["user"]["full_name"];

}
*/

// Function to get the target user's avatar URL.
function getAvatarURL(threadID: string, jsonData: any): string {

  consoleLog(threadID, 'Retrieving the target user\'s avatar URL…');

  return jsonData["graphql"]["user"]["profile_pic_url_hd"];

}

// Function to get the target user's last post URL.
function getLastPostURL(threadID: string, jsonData: any): string {

  consoleLog(threadID, 'Retrieving the target user\'s last post URL…');

  return jsonData["graphql"]["user"]["edge_owner_to_timeline_media"]["edges"][0]["node"]["shortcode"];

}

// Function to get the target user's last image URL.
function getLastImageURL(threadID: string, jsonData: any): string {

  consoleLog(threadID, 'Retrieving the target user\'s last image URL…');

  return jsonData["graphql"]["user"]["edge_owner_to_timeline_media"]["edges"][0]["node"]["display_url"];

}

// You can use this to get the target user's last post thumbnail URL.
/*
// Function to get the target user's last post thumbnail URL.
function getLastThumbURL(threadID, jsonData) {

    consoleLog(threadID, "Retrieving the target user's last post thumbnail URL…");

    return jsonData["graphql"]["user"]["edge_owner_to_timeline_media"]["edges"][0]["node"]["thumbnail_src"];

}
*/

// Function to get the target user's last post caption.
// There might not be a caption.
function getImageCaption(threadID: string, jsonData: any): string|false {

  consoleLog(threadID, 'Retrieving the target user\'s last post caption…');

  try {

    return jsonData["graphql"]["user"]["edge_owner_to_timeline_media"]["edges"][0]["node"]["edge_media_to_caption"]["edges"][0]["node"]["text"];

  } catch (err) {

    consoleLog(threadID, 'No caption for the last post was found.');

    return false;

  }

}

// Function to send an embed to Discord.
async function sendEmbed(threadID: string, jsonData: any, username: string) {

  try {

    // For more information about embeds, read the discord.js documentation at https://discord.js.org/#/docs/main/stable/class/MessageEmbed.

    let color = discordEmbedColour;
    let author = username;
    let authorAvatarURL = getAvatarURL(threadID, jsonData);
    let authorURL = ("https://www.instagram.com/" + username + "/");
    let title = ("New post by @" + username);
    let url = ("https://www.instagram.com/p/" + getLastPostURL(threadID, jsonData) + "/");
    let caption = getImageCaption(threadID, jsonData);
    let image = getLastImageURL(threadID, jsonData);
    let embed:Discord.MessageEmbed
    // Create the embed.
    if (!caption) {

      // If there is no caption, don't include it.
      embed = new Discord.MessageEmbed()
        .setColor(color)
        .setAuthor(author, authorAvatarURL, authorURL)
        .setTitle(title)
        .setURL(url)
        .setImage(image)
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
        .setTimestamp();

    }

    // Send the embed.
    await discordWebhookClient.send({
      username: username,
      avatarURL: getAvatarURL(threadID, jsonData),
      embeds: [embed],
    });

    consoleLog(threadID, chalk.green('Embed sent to Discord.'));

  } catch (err) {

    console.error(err);
    consoleLog(threadID, chalk.red('An error occurred.'));

  }

}

async function logData(threadID: string, oldData: string, newData: string) {

  consoleLog(threadID, ('Old data: ' + oldData));
  consoleLog(threadID, ('New data: ' + newData));

}

async function testData(threadID: string, oldData: string, newData: string, jsonData: any, username: string) {

  // If the recorded old publication URL is the same as the newest retrieved publication URL,
  // it most likely means that there are no new posts.
  if (oldData == newData) {

    consoleLog(threadID, chalk.yellow('No new post(s) found.'));

    // If the recorded old publication URL is not the same as the newest retrieved publication URL,
    // it most likely means that there is/are (a) new post(s).
  } else {

    // Record the new publication URL to the database file.
    consoleLog(threadID, chalk.green('New post(s) found.'));

    await sendEmbed(threadID, jsonData, username);

    // Check if file access is okay first.
    fs.access(filepath, fs.constants.R_OK, (err) => {

      if (err) {

        console.error(err);
        consoleLog(threadID, chalk.red('An error occurred trying to read the file "' + filepath + '".'));

      } else {

        // Write the new data to the database file.
        fs.writeFile(filepath, newData, (err) => {

          if (err) {

            console.error(err);
            consoleLog(threadID, chalk.red('An error occurred trying to write to the file "' + filepath + '".'));

          } else {

            consoleLog(threadID, ('New data written to ' + filepath + '.'));

          }

        });

      }

    });

  }

}

// The function to test for new images/posts.
async function test (threadID: string, jsonData: any, username: string) {

  // This compares the recorded old publication URL in the database file
  // with the newest retrieved publication URL.

  let oldData: string;

  // Wait shortDelay so the data read will be after the data write of the last thread/check.
  setTimeout(() => {

    // Check if file access is okay first.
    fs.access(filepath, fs.constants.R_OK, (err) => {

      if (err) {

        console.error(err);
        consoleLog(threadID, chalk.red('An error occurred trying to read the file "' + filepath + '".'));

      } else {

        // Read data from the database file.
        fs.readFile(filepath, "utf8", (err, data) => {

          if (err) {

            console.error(err)
            consoleLog(threadID, chalk.red('An error occurred trying to read the file "' + filepath + '".'));

          } else {

            consoleLog(threadID, ('Data read from ' + filepath + '.'));

            oldData = data;

          }

        });

      }

    });

  }, (shortDelay));

  let newData = getLastPostURL(threadID, jsonData);

  // Wait x milliseconds so the data can be retrieved.
  setTimeout(() => {

    logData(threadID, oldData, newData);
    testData(threadID, oldData, newData, jsonData, username);

  }, delay);

}

// The main function to test for new images/posts and interact with the Discord webhook if there is/are (a) new post(s).
async function main (threadID: string, username: string) {

  try {

    // Use the node-fetch module to retrieve the data.

    let options = false;

    // Set the options for retrieval.
    // If you get "FetchError: invalid json response body at https://www.instagram.com/accounts/login/ reason: Unexpected token < in JSON at position 0",
    // uncomment the section below and make sure you provided a cookie value in the .env file.
    /*
    options = {
        headers: {
            "cookie": process.env.COOKIE
        }
    };
    */

    let jsonData;

    // Retrieve the data.
    if (!options) {
      const res = await fetch(`https://www.instagram.com/${username}/?__a=1`)
      jsonData = await res.json()

    } else {

      const res = await fetch(`https://www.instagram.com/${username}/?__a=1`, options)
      jsonData = await res.json()

    }

    // Wait x milliseconds so the data can be retrieved.
    setTimeout(() => {

      test(threadID, jsonData, username);

    }, delay);

  } catch (err) {

    console.error(err);
    consoleLog(threadID, chalk.red("An error occurred."));

  }

}

consoleLog('0000', 'Script initialised.');

// Start the main function every x milliseconds.
setInterval(() => {

  for (let i = 0; i < targetInstagramUsernames.length; i++) {
    // threadID for debugging.
    let threadID = getRndInteger(1000, 9999).toString();

    setTimeout(async () => {

      await main(threadID, targetInstagramUsernames[i]);

    }, shortDelay * i+1);
  }

}, delay * targetInstagramUsernames.length);