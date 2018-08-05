var socket;

var teamPoints = {
	red: 0,
	blue: 0,
	green: 0,
	yellow: 0
};

function setup() {
  createCanvas(400, 400);

	socket = io.connect('http://localhost:3000');
	StartInfluenceTicks();

	socket.on('teamPointsUpdate',
	function(points) {
		teamPoints.red = points.red;
		teamPoints.blue = points.blue;
		teamPoints.green = points.green;
		teamPoints.yellow = points.yellow;
	}
);
}

function draw() {
  	background(220);
	DrawLines();

	textSize(24);
	text(timeLeft.toString() + " until next influence", 20, height - 20);
	DisplayTeams();
}

var timeLeft = 20;
function StartInfluenceTicks() {
	var timerID = setInterval(countdown, 1000);
	function countdown() {
	  if (timeLeft == 0) {
	    timeLeft = 20 ;
		loadJSON("https://tmi.twitch.tv/group/user/vinny_the_blind/chatters", GotUsers, 'jsonp')
	  } else {
	    timeLeft--;
	  }
	}
}
function GotUsers(data) {
	socket.emit('influenceTick', data);
	console.log(data);
}

function DisplayTeams() {
	textAlign(CENTER);
	fill("Red");
	text("Red\n" + teamPoints.red, width/4, height/4);
	fill("Blue");
	text("Blue\n" + teamPoints.blue, 3*width/4, height/4);
	fill("Green");
	text("Green\n" + teamPoints.green, width/4, 3*height/4);
	fill("Yellow");
	text("Yellow\n" + teamPoints.yellow, 3*width/4, 3*height/4);
	fill("Black");
	textAlign(LEFT);
}

function DrawLines() {
	line(width/2, 0, width/2, height);
	line(0, height/2,width,height/2);
}
