var socket;
var positions;

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
}

function draw() {
  background(220);
	DrawLines();

	mainCircle.circlePos = positions[mainCircle.gridPos[1]][mainCircle.gridPos[0]];

	ellipse(mainCircle.circlePos[0], mainCircle.circlePos[1], mainCircle.sizeX,mainCircle.sizeY);
	textSize(24);
	text(timeLeft.toString() + " until next influence", 20, height - 20);
}


//countdown runs even when setup doesn't maybe?
//thus maybe socket is undefined?
var timeLeft = 10;
function StartInfluenceTicks() {
	var timerID = setInterval(countdown, 1000);
	function countdown() {
	  if (timeLeft == 0) {
	    timeLeft = 10 ;
			loadJSON("https://tmi.twitch.tv/group/user/vinny_the_blind/chatters", GotUsers, 'jsonp')
	  } else {
	    timeLeft--;
	  }
	}
}
function GotUsers(data) {
	socket.emit('influenceTick', data);
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
	line(width/3, 0, width/3, height);
	line(2*width/3, 0, 2*width/3, height);
	line(0, height/3,width,height/3);
	line(0, 2*height/3, width, 2*height/3);
}
