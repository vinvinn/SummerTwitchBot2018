
/* 
  Author: Vincent Colano
  Github: https://github.com/vinvinn/SummerTwitchBot2018
  -----------------
  server.js
  -----------------
  This script runs a server to handle interaction with
  twitch via funcionality from tmi.js. Thus allowing
  the creation of custom bot commands with functions 
  written in this file.

  For my project, I've implemented interaction with a
  Mongo database and a p5.js sketch to allow users to
  accumulate points by staying in the twitch stream. 
  They can then "vote" on teams displayed in the sketch,
  and see the team values change on the stream.
*/

  /* The node packages this program uses */
var tmi = require("tmi.js");
var validator = require("validator");
var sketchFile = require("./public/sketch.js");
var express = require("express");
var mongo = require("mongodb").MongoClient();
var objectID = require("mongodb").ObjectID();
var assert = require("assert");
var socket = require("socket.io");
var fs = require("fs");

var dbURL = "mongodb://localhost:27017/twitchbot";

  /* Initializing the server communication with the sketch */
var mainSocket;
var app = express();
var server = app.listen(3000);
app.use(express.static("public"));
var io = socket(server);

io.sockets.on("connection", NewConnection);
function NewConnection(socket) {
  console.log("new connection " + socket.id);
  mainSocket = socket;

  mainSocket.on("influenceTick", RecieveInfluenceTick);
  function RecieveInfluenceTick(data) {
    console.log("--Influence Tick--");
    var newData = JSON.parse(JSON.stringify(data));
    currentViewers = newData.data.chatters.viewers;
    //Combine mods and viewers in one array
    currentViewers.push.apply(currentViewers, newData.data.chatters.moderators);
    var numViewers = currentViewers.length;

    for(var i = 0; i < numViewers; i++) {
      GiveInfluence(currentViewers[i]);
    }
  }
}

/*
  I keep my bots password OauthKey in a private file.
  If you're code remained private you could simply replace
  the oathKey variable with your own twitch oathKey.
*/
var oauthKey = fs.readFileSync("PrivateOauthKey.txt").toString();

var options = {
  options: {
    debug: true
  },
  connection: {
    cluster: "aws",
    recconts: true
  },
  identity: {
    username: "vinvinnBot",
    password: oauthKey,
  },
  channels: ["vinny_the_blind"]
}
var client = new tmi.client(options);
client.connect();

client.on("connected", function(address, port) {
  UpdateTeamPoints();
  client.action("vinny_the_blind", "Howdy ho neighborooni, it's me, " + options.identity.username +"!");
})

/* 
  The client.on whisper and chat functions handle
  user whispers and chats. Currently all outgoing
  messages from teh bot are sent via whispers.
*/

client.on("whisper", function (from, user, message, self) {
  if (self) return;

  //These are the messages users can PM the bot to "play"
  if (message === "register") SearchDBForUser(user, Register);
  else if (message === "status") UserStatusUpdate(user);
  else if (message.startsWith("vote ")) VoteForTeam(user, message);
  else client.whisper(user.username, "Hey there, I didn't understand that! :) Check the the stream panels for help!");
});

client.on("chat", function(channel, user, message, self){
  if(self) return;

  if(!validator.contains(message, "!")) return
  if(message.charAt(0) === "!") message = message.substr(1);
  if(!validator.isAlpha(message)) return;

  else if (message === "register") SearchDBForUser(user, Register);
})

//Checks if the given user is already in the database
function SearchDBForUser(user, func) {
  mongo.connect(dbURL, function(err, db) {
    assert.equal(null, err);
    var data = db.collection("users").findOne({"username":user.username},
    function(err, doc) {
      if (doc == null) SearchCallBack(false, user, func);
      else if (user.username == doc.username) SearchCallBack(true, user, func);
      else SearchCallBack(false, user, func);
      db.close()
    });
  });
}

//This CallBack is used to ensure the desired function waits for the response from the db
function SearchCallBack(found, data, func) {
  func(data, found);
}

//Allows users to check their income and influence
function UserStatusUpdate(user) {
  mongo.connect(dbURL, function(err, db) {
    assert.equal(null, err);
    var data = db.collection("users").findOne({"username":user.username},
    function(err, doc) {
      if (user.username == doc.username) client.whisper(user.username, "Influence: " + doc.influence + "    Income: " + doc.influenceIncome);
      else client.whisper(user.username, "You aren't registered! Respond with 'register' to do so");
      db.close()
    });
  });
}

//Handles user vote requests
function VoteForTeam(user, message) {
  var team = message.substr(5);
  if (team.startsWith("red")) {
    var points = parseInt(team.substr(4));
    team = "red";
  } else if (team.startsWith("blue")) {
    var points = parseInt(team.substr(5));
    team = "blue";
  } else if (team.startsWith("yellow")) {
    var points = parseInt(team.substr(7));
    team = "yellow";
  } else if (team.startsWith("green")) {
    var points = parseInt(team.substr(6));
    team = "green";
  } else {
    client.whisper(user.username, "Invalid vote comand, try 'vote team points'");
    return;
  }
  if (!points > 0 || points < 0) {
    client.whisper(user.username, "Invalid influnce value");
    return;
  }

  SufficientInfluenceCheck(user, points).then(function(value) {
    if(!value) {
      client.whisper(user.username, "You don't have that much influence!");
      return;
    } else {
      client.whisper(user.username, "Voting " + points + " for " + team +"!");
      TakeInfluence(user, points);
      GiveTeamPoints(team, points);
      UpdateTeamPoints(user.username, points, team);
    }
  }, function(reason) {
    console.log("Promise log: Rejected for: " + reason);
    client.whisper(user.username, "Error occured");
    return;
  })
}

//Determines if a given user has enough poitns for the requested action
async function SufficientInfluenceCheck(user, amount) {
  let db = await mongo.connect(dbURL);
    let data = await db.collection("users").findOne({"username":user.username});
    await db.close();
    if (data.influence >= amount) return true;
    return false;
}

//Returns the current points of a team
async function GetTeamPoints(team){
  let db = await mongo.connect(dbURL);
    let data = await db.collection("teams").findOne({"name":team});
    await db.close();
    return data.points;
}

//Changes the point value of a team in the database
function GiveTeamPoints(team, amount) {
  mongo.connect(dbURL, function(err, db) {
    assert.equal(null, err);
    db.collection("teams").find({"name":team}).snapshot().forEach(
      function (elem) {
        db.collection("teams").update(
          { name: team },//This is our search query
            {
              $set: { points: elem.points + amount } //the change we want to make
            }
        );
      }
    );
  });
}

//Updates the point values to the sketch
function UpdateTeamPoints(user, points, votedForTeam){
  var data = {
    teamPoints: {
      red: 0,
      blue: 0,
      green: 0,
      yellow: 0
    },
    username: user,
    amount: points,
    team: votedForTeam
  };

  Promise.all([
    GetTeamPoints("yellow").then(function(value) {
      data.teamPoints.yellow = value;
    }, function(reason) {
      console.log("Promise log: Rejected");
    }),
    GetTeamPoints("red").then(function(value) {
      data.teamPoints.red = value;
    }, function(reason) {
      console.log("Promise log: Rejected");
    }),
    GetTeamPoints("blue").then(function(value) {
      data.teamPoints.blue = value;
    }, function(reason) {
      console.log("Promise log: Rejected");
    }),
    GetTeamPoints("green").then(function(value) {
      data.teamPoints.green = value;
    }, function(reason) {
      console.log("Promise log: Rejected");
    })
  ]).then(function() {//This function will run when all 4 previous promises have resolved
      //Emit team point values to the sketch
      io.sockets.emit("teamPointsUpdate", data);
  })
  
}

//Substracts a registered user influence (points), when they spend them
function TakeInfluence(user, amount) {
  mongo.connect(dbURL, function(err, db) {
    assert.equal(null, err);
    db.collection("users").find({"username":user.username}).snapshot().forEach(
      function (elem) {
        db.collection("users").update(
          { username: user.username }, //This is our search query
            {
              $set: { influence: elem.influence - amount } //the change we want to make
            }
        );
      }
    );
  });
}

//Gives a registered user influence (points)
function GiveInfluence(user) {
  mongo.connect(dbURL, function(err, db) {
    assert.equal(null, err);
    db.collection("users").find({"username":user}).snapshot().forEach(
      function (elem) {
        db.collection("users").update(
          { username: user }, //This is our search query
            {
              $set: { influence: elem.influence + elem.influenceIncome } //the change we want to make
            }
        );
      }
    );
  });
}

//Registers a user in the database
function Register(user, found) {
  if (!found) {
    mongo.connect(dbURL, function(err, db) {
      assert.equal(null, err);
      var userInfo = {
        username: user.username,
        userID: user.user_id,//User_id is a twitch thing, but it just hasn't worked for me appparently
        influence: 20,
        influenceIncome: 1
      }
      db.collection("users").insertOne(userInfo, function(err, res){
        assert.equal(null, err);
        db.close();
      });
    });
    client.whisper(user.username, "Welcome " + user.username + "!");
  } else client.whisper(user.username, "You've already registered!");

}
