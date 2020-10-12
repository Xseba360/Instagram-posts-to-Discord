# IS NOT WORKING CURRENTLY, I'M STILL FIXING IT

# Instagram-posts-to-Discord
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
- dotenv, node-fetch, webhook-discord, fs and chalk modules

### Usage

You should create a .env file with the variables listed below:
1. `TARGET_INSTAGRAM_USERNAME`
2. `DISCORD_WEBHOOK_URL`
3. `DELAY`
4. `DISCORD_EMBED_COLOUR`

.env file example:
```
TARGET_INSTAGRAM_USERNAME=xxx
DISCORD_WEBHOOK_URL=xxx
DELAY=20000
DISCORD_EMBED_COLOUR=7fffd4
```

For `TARGET_INSTAGRAM_USERNAME`, it's simply the username of the account you want to monitor.\
For `DISCORD_WEBHOOK_URL`, first create a webhook in Discord, then copy the webhook URL.\
`DELAY` is the amount of time in milliseconds between checks for new images/posts (the delay before the first check will be tripled).\
`DISCORD_EMBED_COLOUR` is the hex code of a colour (an integer).

You can run this script just by navigating to the project directory with command prompt then running the command `npm start` or `node main.js`.\
I recommend using [nodemon](https://www.npmjs.com/package/nodemon). You can run the command `nodemon main.js` if you have it.
