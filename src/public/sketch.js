var socket;
var positions;

var teamPoints = {
	red: 0,
	blue: 0,
	green: 0,
	yellow: 0
};

var mainCircle = {
	sizeX: 50,
	sizeY: 50,
	circlePos: [0, 0],
	gridPos: [0, 0]
};

function setup() {
  createCanvas(400, 400);

	positions = [ [ [width/6, 	height/6], [3*width/6, 	 height/6], [5*width/6, 	height/6]],
								[ [width/6, 3*height/6], [3*width/6, 3*height/6], [5*width/6, 3*height/6]],
								[ [width/6, 5*height/6], [3*width/6, 5*height/6], [5*width/6, 5*height/6]]];

	mainCircle.circlePos = positions[0][0];

	socket = io.connect('http://localhost:3000');
	StartInfluenceTicks();
	//Incoming message named circle
	socket.on('moveRequest',
		function(direction) {
			console.log("Request for: " + direction);
			if (direction == "left") MoveLeft(mainCircle);
			if (direction == "right") MoveRight(mainCircle);
			if (direction == "up") MoveUp(mainCircle);
			if (direction == "down") MoveDown(mainCircle);
		}
	);
	socket.on('teamPointsUpdate',
	function(points) {
		teamPoints.red += points.red;
		teamPoints.blue += points.blue;
		teamPoints.green += points.green;
		teamPoints.yellow += points.yellow;
	}
);
}

function draw() {
  background(220);
	DrawLines();

	// /mainCircle.circlePos = positions[mainCircle.gridPos[1]][mainCircle.gridPos[0]];
	//ellipse(mainCircle.circlePos[0], mainCircle.circlePos[1], mainCircle.sizeX,mainCircle.sizeY);
	
	textSize(24);
	text(timeLeft.toString() + " until next influence", 20, height - 20);
	DisplayTeams();
}


//countdown runs even when setup doesn't maybe?
//thus maybe socket is undefined?
var timeLeft = 10;
function StartInfluenceTicks() {
	var timerID = setInterval(countdown, 1000);
	function countdown() {
	  if (timeLeft == 0) {
	    timeLeft = 10 ;
			//loadJSON("https://tmi.twitch.tv/group/user/vinny_the_blind/chatters", GotUsers, 'jsonp')
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

function MoveLeft(circle) {
	if (circle.gridPos[0] == 0) circle.gridPos[0] = 2;
	else circle.gridPos[0] = circle.gridPos[0]-1;
}
function MoveRight(circle) {
	if (circle.gridPos[0] == 2) circle.gridPos[0] = 0;
	else circle.gridPos[0] = circle.gridPos[0]+1;
}
function MoveUp(circle) {
	if (circle.gridPos[1] == 0) circle.gridPos[1] = 2;
	else circle.gridPos[1] = circle.gridPos[1]-1;
}
function MoveDown(circle) {
	if (circle.gridPos[1] == 2) circle.gridPos[1] = 0;
	else circle.gridPos[1] = circle.gridPos[1]+1;
}

function DrawLines() {
	line(width/2, 0, width/2, height);
	//line(2*width/3, 0, 2*width/3, height);
	line(0, height/2,width,height/2);
	//line(0, 2*height/3, width, 2*height/3);
}
