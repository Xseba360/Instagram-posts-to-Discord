# Instagram-posts-to-Discord
By [Fernando](https://github.com/dlfernando/)\
Modified and translated from Python to JavaScript by [Merrick919](https://github.com/Merrick919)\
Original repo: [https://github.com/dlfernando/Instagram-to-discord](https://github.com/dlfernando/Instagram-to-discord)

### Description

This script monitors an Instagram account and send images to a Discord channel by a webhook, in an embed, when new posts are found.

It executes 2 actions:
1. The script checks for a new post in an Instagram account every 20 seconds.
2. If a new post is found, the script sends the new Instagram image to a Discord channel by a webhook, in an embed.

### Requirements

- Node.js
- dotenv, node-fetch, discord.js and chalk modules

### Usage

You should create a .env file with the variables listed below:
1. `TARGET_INSTAGRAM_USERNAME`
2. `DISCORD_WEBHOOK_ID`
3. `DISCORD_WEBHOOK_TOKEN`
4. `DELAY`
5. `DISCORD_EMBED_COLOUR`

.env file example (this is just an example and will not work):
```
TARGET_INSTAGRAM_USERNAME=xxxxxx
DISCORD_WEBHOOK_ID=0123456789
DISCORD_WEBHOOK_TOKEN=qwertyASDF012345
DELAY=20000
DISCORD_EMBED_COLOUR=5851DB
```

For `TARGET_INSTAGRAM_USERNAME`, it's simply the username of the account you want to monitor.\
For `DISCORD_WEBHOOK_ID` and `DISCORD_WEBHOOK_TOKEN`, first create a webhook in Discord, then copy the webhook URL.\
In the webhook URL below, "0123456789" is the `DISCORD_WEBHOOK_ID` and "qwertyASDF012345" is the `DISCORD_WEBHOOK_TOKEN`. This is just an example and will not work.\
https://discordapp.com/api/webhooks/0123456789/qwertyASDF012345
`DELAY` is the amount of time in milliseconds between checks for new posts. If the delay is too short it might not work. Also note that the delay before the first check will be tripled.\
`DISCORD_EMBED_COLOUR` is the hex code of a colour (without the hash (#)).

You can run this script just by navigating to the project directory with command prompt then running the command `npm start` or `node main.js`.\
I recommend you use [nodemon](https://www.npmjs.com/package/nodemon). You can run the command `nodemon main.js` if you have it.
