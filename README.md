# Instagram-posts-to-Discord
Original script by [Fernando](https://github.com/dlfernando/)\
Modified and translated from Python to JavaScript by [Merrick919](https://github.com/Merrick919)\
Original repo: [https://github.com/dlfernando/Instagram-to-discord](https://github.com/dlfernando/Instagram-to-discord)

### Description

This script monitors an Instagram account and send images to a Discord channel by a webhook, in an embed, when new posts are found.

1. The script checks for a new post in an Instagram account every x seconds (the recommended length is 20 seconds).
2. If a new post is found, the script sends the new Instagram image to a Discord channel by a webhook, in an embed.

Below is an example of an embed in Discord (the Instagram post can be found [here](https://www.instagram.com/p/CKRd2fJjx-7/)).

![](https://i.imgur.com/GYqI8Pu.png)

### Requirements

- Node.js
- dotenv, node-fetch, discord.js and chalk modules

### Usage

You should edit the .env file with the variables listed below:
1. `TARGET_INSTAGRAM_USERNAME`
2. `DISCORD_WEBHOOK_ID`
3. `DISCORD_WEBHOOK_TOKEN`
4. `DELAY`
5. `DISCORD_EMBED_COLOUR`
6. `COOKIE`

.env file example (this is just an example and will not work):
```
TARGET_INSTAGRAM_USERNAME=xxxxxx
DISCORD_WEBHOOK_ID=0123456789
DISCORD_WEBHOOK_TOKEN=qwertyASDF012345
DELAY=20000
DISCORD_EMBED_COLOUR=5851DB
COOKIE=exampleCookieValue
```

For `TARGET_INSTAGRAM_USERNAME`, it's simply the username of the account you want to monitor.

For `DISCORD_WEBHOOK_ID` and `DISCORD_WEBHOOK_TOKEN`, first create a webhook in Discord, then copy the webhook URL.

In the webhook URL below, "0123456789" is the `DISCORD_WEBHOOK_ID` and "qwertyASDF012345" is the `DISCORD_WEBHOOK_TOKEN`. This is just an example and will not work.\
https://<!--comment to unlink-->discordapp.com/api/webhooks/0123456789/qwertyASDF012345

`DELAY` is the amount of time in milliseconds between checks for new posts. If the delay is too short it might not work. Also note that the delay before the first possible embed sent will be 3.5 times longer.

`DISCORD_EMBED_COLOUR` is the hex code of a colour (without the hash (#)).

`COOKIE` is required if you get a specific error (see the Errors section for more information).

You can run this script just by navigating to the project directory with command prompt then running the command `npm start` or `node main.js`.

I recommend you use [nodemon](https://www.npmjs.com/package/nodemon). You can run the command `nodemon main.js` if you have it.

### Errors

You might get `FetchError: invalid json response body at https://www.instagram.com/accounts/login/ reason: Unexpected token < in JSON at position 0`.

If so, make sure you provided a cookie value in the .env file and uncomment the section at line 339 in the main.js file.

To get a cookie value, log in to the Instagram website on a browser.

Open the developer console and navigate to the "Network" tab (or anything that can track requests and responses).

Reload the page and view the request information for the main webpage file (www<!--comment to unlink-->.instagram.com).

The cookie value should be displayed in the cookie header of the request headers.

To uncomment the section, remove the `/*` at the top of the section and the `*/` at the bottom of the section.

Below is the section which should be uncommented if you get the error:
```
let options = {
    headers: {
        "cookie": cookie
    }
};
```