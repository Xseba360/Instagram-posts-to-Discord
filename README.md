# Instagram-posts-to-Discord-js
By [Fernando](https://github.com/dlfernando/)\
Modified and translated from Python to JavaScript by [Merrick919](https://github.com/Merrick919)\
Original repo: [https://github.com/dlfernando/Instagram-to-discord](https://github.com/dlfernando/Instagram-to-discord)

### Description

This script monitors an Instagram account and send images to a Discord channel by a webhook when new images/posts are found.

It executes 2 actions:
1. The script checks for a new image posted in an Instagram account every 20 seconds.
2. If a new image is found, the script posts the new Instagram image to a Discord channel by a webhook.

### Requirements

- Node.js
- node-fetch, fs and chalk modules

### Usage

Variables you have to change are:
1. `targetInstagramUsername`
2. `webhookID`
3. `webhookURL`
4. `delay`

For `targetInstagramUsername`, it's simply the username of the account you want to monitor.\
For `webhookID` and `webhookURL`, first create a webhook in Discord, then copy the webhook URL.\
The first part after "https://discordapp.com/api/webhooks/" is the webhook ID (some numbers).\
The second part after the webhook ID is the webhook token.\
You can just replace the `targetInstagramURL` and `webhookURL` links directly if you want.\
`delay` is the amount of time in milliseconds between checks for new images/posts.

You can run this script just by navigating to the project directory with command prompt then running the command `npm start` or `node main.js`.\
I recommend using [nodemon](https://www.npmjs.com/package/nodemon). You can run the command `nodemon main.js` if you have it.
