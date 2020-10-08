// Copyright (c) 2020 Fernando
// Url: https://github.com/dlfernando/
// License: MIT

// Modified and translated to JavaScript by Merrick

// DESCRIPTION:
// This script executes 2 actions:
// 1.) Monitors for new image posted in a instagram account (create a cronjob).
// 2.) If found new image, a bot posts new instagram image in a discord channel.

// Requiring this allows access to the environment variables of the running node process
require('dotenv').config();

// Sets the token
const token = process.env.BOT_TOKEN;

// Sets the prefix
const prefix = process.env.BOT_PREFIX;

// Sets the version
const version = process.env.BOT_VERSION;

// Requires the fs module
const fs = require('fs');

// Requires the path module
const path = require('path');

// Requires the chalk module
const chalk = require('chalk');

const targetInstagramUsername = "mattiec.photography";
const webhookURL = "WEBHOOK_URL_PLACEHOLDER_HERE";
const database = "database.txt";

function writeToFile(content, filename) {

    let filepath = ('./' + filename);

    fs.access(filepath, fs.constants.R_OK, (err) => {

        if (err) {

            console.error(err);
            console.log("An error occured trying to read the file \"" + filename + "\".");
            
        } else {
            
            fs.writeFile(filepath, content, err => {

                if (err) {

                    console.error(err);
                    console.log("An error occured trying to write to the file \"" + filename + "\".");

                }

            });
            
        }

    });

}

function readFromFile(filename) {

    let filepath = ('./' + filename);

    fs.access(filepath, fs.constants.R_OK, (err) => {

        if (err) {

            console.error(err);
            console.log("An error occured trying to read the file \"" + filename + "\".");
            
        } else {
            
            fs.readFile(filepath, 'utf8', (err, data) => {

                if (err) {

                    console.error(err)
                    console.log("An error occured trying to read the file \"" + filename + "\".");

                } else {

                    return data;

                }

            });
            
        }

    });
    
}

function getUserFullName(html) {

    return html.graphql.user.full_name;

}

function  getTotalPhotos(html) {

    return Math.round(html.graphql.user.edge_owner_to_timeline_media.count);

}

function getLastPublicationURL(html) {

    return html.graphql.user.edge_owner_to_timeline_media.edges[0].node.shortcode;

}

function getLastPhotoURL(html) {

    return html.graphql.user.dge_owner_to_timeline_media.edges[0].node.display_url;

}

function getLastThumbURL(html) {

    return html.graphql.user.edge_owner_to_timeline_media.edges[0].node.thumbnail_src;

}
    
function getDescriptionPhoto(html) {

    return html.graphql.user.edge_owner_to_timeline_media.edges[0].node.edge_media_to_caption.edges[0].node.text;

}

function webhook(webhook_url, html) {

    // for all params, see https://discordapp.com/developers/docs/resources/webhook#execute-webhook
    // for all params, see https://discordapp.com/developers/docs/resources/channel#embed-object

    data = {};
    data["embeds"] = [];
    embed = {};
    embed["color"] = 15467852;
    embed["title"] = ("New pic of @" + targetInstagramUsername);
    embed["url"] = ("https://www.instagram.com/p/" + getLastPublicationURL(html) + "/");
    embed["description"] = getDescriptionPhoto(html);
    // embed["image"] = {"url":get_last_thumb_url(html)}; // uncomment to send a bigger image
    embed["thumbnail"] = {"url":getLastThumbURL(html)};
    data["embeds"].append(embed);
    result = requests.post(webhook_url, data=json.dumps(data), headers={"Content-Type": "application/json"});
    
    /*

    try {

        result.raise_for_status();

    } catch (err) {

        // except requests.exceptions.HTTPError as err:
        console.error(err);
        console.log("An error occured.");
        return;

    }
    
    console.log("Image successfully sent to Discod, code {}.".format(result.status_code))

    */

}

function getInstagramHTML(targetInstagramUsername) {

    html = requests.get("https://www.instagram.com/" + targetInstagramUsername + "/?__a=1");
    return html;

}

function main() {
    
    try {

        html = getInstagramHTML(targetInstagramUsername);

        if (readFromFile(database) == getLastPublicationURL(html)) {

            console.log("No new image(s) to send to Discord.");

        } else {
        
            writeToFile(getLastPublicationURL(html), database);
            console.log("New image(s) to send to Discord.");
            webhook(webhookURL, getInstagramHTML(targetInstagramUsername));
        
        }

    } catch (err) {

        console.error(err);
        console.log("An error occured.");

    }

}


if (__name__ == "__main__") {

    main();

}