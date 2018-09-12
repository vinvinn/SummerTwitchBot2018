# SummerTwitchBot2018

This project runs a twitch bot via a NodeJS server to execute custom commands. The server handles all interactions with twitch and the database, and also sends information to the p5.js sketch. The sketch is the "game" view of the project, and using [Open Broadcasting Software](https://obsproject.com/), is what is streamed live to twitch for viewers to see and interact with. On a general level it shows how one could write and create their own custom twitch bot, and even utilize a database for their bot. 

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

For development, this project requires the installation of [NodeJS](https://nodejs.org/en/) and [MongoDB](https://www.mongodb.com/).  Testing can primarily be done in the twitch chat window, however to stream this live, the use of [OBS](https://obsproject.com/) or similar streaming software is required.

#### Setting up NodeJS

Use node package manager to install the required node modules automatically through the provided package.json file. [Here](https://docs.npmjs.com/getting-started/installing-npm-packages-locally) you can find a guide on doing that.
