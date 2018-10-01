# SummerTwitchBot2018

This project runs a twitch bot via a NodeJS server to execute custom commands. The server handles all interactions with twitch and the database, and also sends information to the p5.js sketch. The sketch is the "game" view of the project, and using [Open Broadcasting Software](https://obsproject.com/), is what is streamed live to twitch for viewers to see and interact with. On a general level it shows how one could write and create their own custom twitch bot, and even utilize a database for their bot. 

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

For development, this project requires the installation of [NodeJS](https://nodejs.org/en/) and [MongoDB](https://www.mongodb.com/).  Testing can primarily be done in the twitch chat window, however to stream this live, the use of [OBS](https://obsproject.com/) or similar streaming software is required.

#### Prerequisites for Twitch

It is required to have a [Twitch.tv](https://www.twitch.tv/) account for our bot to control. In order for the server to take ccontrol of the bot, you must [generate the bot accounts OAuth password](https://twitchapps.com/tmi/). It is also very helpful to have a second account, to interact with our bot via messages and host the stream the bot will join.

#### Setting up NodeJS

Use node package manager to install the required node modules automatically through the provided package.json file. AFter installing node, navigate to the directory of the `package.json` file, located in `\src` in any CLI and use the command
````
npm install
````
[Here](https://docs.npmjs.com/getting-started/installing-npm-packages-locally) you can find more information on doing that. 

#### Setting up MongoDB Database

This project uses a local MongoDB database, [here](https://www.mongodb.com/download-center?ct=false#community) you can create a local database for free.

## Testing

#### Running the Server

Once NodeJS, MongoDB, and the Twitch account(s) are set up, just edit the info in `server.js` to your credentials. This includes the database URL and the `identity` and `channels` fields in `options`.
Now the serve is ready to be ran, while your database is running, navigate to `\src` in any CLI and use command `node server.js` to start our bot.

[![Server](https://i.gyazo.com/fafeab15d0e9527c6d91013a7bbedf36.png)](https://gyazo.com/fafeab15d0e9527c6d91013a7bbedf36 "server")

The bot should now be active in the designated stream(s), and is ready to be interacted with.

[![Stream](https://i.gyazo.com/40676d4520f904a96cbe2dc57a38cc13.png)](https://gyazo.com/40676d4520f904a96cbe2dc57a38cc13 "Bot connected")

#### The Sketch

While the server is running, open a tab in any browser and use the URL `localhost:3000` to view the sketch. Once this is open, you can use a Window Capture in OBS to stream this to the viewers.

[![Sketch](https://i.gyazo.com/ba25678fa112e250ac4ab7f6072cf99c.png)](https://gyazo.com/ba25678fa112e250ac4ab7f6072cf99c "sketch")

## Development

You are now ready to create custom functionality for yout Twitch.tv bot! 

#### Helpful Documentation

[tmi.js](https://docs.tmijs.org/) - Node module for the bot and it's interation with Twitch.
[p5.js](https://p5js.org/reference/) - For writing the sketch.

### Author

**Vincent Colano** - [LinkedIn](https://www.linkedin.com/in/vincent-colano-490a6b144/) - [Github](https://github.com/vinvinn)
