var tmi = require('tmi.js');
var validator = require('validator');
var sketchFile = require('./public/sketch.js');
var express = require('express');
var mongo = require('mongodb').MongoClient();
var objectID = require('mongodb').ObjectID();
var assert = require('assert');
var socket = require('socket.io');

var dbURL = 'mongodb://localhost:27017/twitchbot';
var mainSocket;

var app = express();
var server = app.listen(3000);
app.use(express.static('public'));

var io = socket(server);
io.sockets.on('connection', NewConnection);
function NewConnection(socket) {
  console.log('new connection ' + socket.id);
  mainSocket = socket;

  mainSocket.on('influenceTick', RecieveInfluenceTick);
  function RecieveInfluenceTick(data) {
    console.log("Recieved Influence Tick!");
    var newData = JSON.parse(JSON.stringify(data));
    currentViewers = newData.data.chatters.viewers;
    //Combine mods+viewers in one array
    currentViewers.push.apply(currentViewers, newData.data.chatters.moderators);
    var numViewers = currentViewers.length;
    //TODO:apply influence income
    for(var i = 0; i< numViewers; i++) {
      console.log(currentViewers[i]);
      GiveInfluence(currentViewers[i]);
    }
    
  }
}

var options = {
  options: {
    debug: true
  },
  connection: {
    cluster: "aws",
    recconts: true
  },
  identity: {
    username: "TheBotName",
    password: "oauth:1wmlsd4v0ruv4co20le8ffne7g3ckg"
  },
  channels: ["vinny_the_blind"]
}

var client = new tmi.client(options);
client.connect();

client.on("whisper", function (from, user, message, self) {
  if (self) return;

  if (message === "register") SearchDBForUser(user, Register);
  else if (message == "myinfluence") {
    client.whisper(user.username, "Your message");
  }
});

client.on('chat', function(channel, user, message, self){
  if(self) return;

  if(!validator.contains(message, "!")) return
  if(message.charAt(0) === '!') message = message.substr(1);
  if(!validator.isAlpha(message)) return;

  if (message === "left" || message === "right" || message === "up" || message === "down") {
    moveCircleRequest(message);
    client.action("vinny_the_blind", message + " it is!");
  } else if (message === "register") SearchDBForUser(user, Register);
  else if (message == "myinfluence") {
    client.whisper(user.username, "Your message");
  }
})

function SearchDBForUser(user, func) {
  mongo.connect(dbURL, function(err, db) {
    assert.equal(null, err);
    var data = db.collection('users').findOne({"username":user.username},
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

function GiveInfluence(user) {//Now functional as far as I can tell
  mongo.connect(dbURL, function(err, db) {
    assert.equal(null, err);
    db.collection('users').find({"username":user}).snapshot().forEach(
      function (elem) {
        db.collection('users').update(
          { username: user }, //This is our search query 
            { 
              $set: { influence: elem.influence + elem.influenceIncome } //the change we want to make
            }
        );
      }
    );
  });
}
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
      db.collection('users').insertOne(userInfo, function(err, res){
        assert.equal(null, err);
        db.close();
      });
    });
    client.whisper(user.username, "Welcome " + user.username + "!");
  } else client.whisper(user.username, "You've already registered!");

}

client.on('connected', function(address, port) {
  client.action("vinny_the_blind", "Howdy ho neighborooni, it's me, vinvinnBot!");
})

function moveCircleRequest(direction) {
  io.sockets.emit('moveRequest', direction);
  console.log('Moved circle at:  ' + socket.id);
}
