//For Canvas
let CANVAS_WIDTH = window.innerWidth-100 || document.body.clientWidth-100;
let CANVAS_HEIGHT = window.innerHeight-100 || document.body.clientHeight-100;
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
canvas.height = CANVAS_HEIGHT;
canvas.width = CANVAS_WIDTH;

let fieldOfView   = 100; // angle (degrees) for field of view
let cameraHeight  =1250;// z height of camera
let cameraDepth   = 0.8;// z distance camera is from screen (computed) calculated using d=1/tan(fav/2)
let position = 0;

//For Track
let segmentLength=550;
let rumbleLength = 3;
let drawDistance = 200;
let roadWidth = 2000;
let lanes = 2;

let COLOR={
	GRASS_DARK:'#007f00',
  GRASS_LIGHT:'#00b200',
	ROAD:'grey',
	RUMBLE_DARK:'red',
	RUMBLE_LIGHT:'yellow',
	LANE_DARK:'grey',
	LANE_LIGHT:'yellow'
}

var Util = {
  percentRemaining: function(n, total)          { return (n%total)/total;                                         },
  toInt:            function(obj, def)          { if (obj !== null) { var x = parseInt(obj, 10); if (!isNaN(x)) return x; } return Util.toInt(def, 0); },
  interpolate:      function(a,b,percent)       { return a + (b-a)*percent                                        },
  easeIn:           function(a,b,percent)       { return a + (b-a)*Math.pow(percent,2);                           },
  easeOut:          function(a,b,percent)       { return a + (b-a)*(1-Math.pow(1-percent,2));                     },
  easeInOut:        function(a,b,percent)       { return a + (b-a)*((-Math.cos(percent*Math.PI)/2) + 0.5);        }
}


//For Player
let playerX = 0;
let playerZ = null;

let segments=[];


function addSegment(curve,u){
	let index = segments.length;

	segments.push({
		'index':index,
		'p1':{
			'camera':{},
			'screen':{},
			'world':{y:lastY(),z:index*segmentLength}
		},
		'p2':{
			'camera':{},
			'screen':{},
			'world':{y:u,z:(index+1)*segmentLength}
    },
    'curve': curve,
		'color':{
			'road':COLOR.ROAD,
			'grass':Math.floor(index/rumbleLength)&1?COLOR.GRASS_DARK:COLOR.GRASS_LIGHT,
			'rumble':Math.floor(index/rumbleLength)&1?COLOR.RUMBLE_DARK:COLOR.RUMBLE_LIGHT,
			'lane':Math.floor(index/rumbleLength)&1?COLOR.LANE_DARK:COLOR.LANE_LIGHT
		}
	});
}


function lastY(){
  return (segments.length == 0) ? 0 : segments[segments.length-1].p2.world.y;
}



function addRoad(enter, hold, leave, curve,y) {
  var n;
  var total = enter + hold +leave;
  var startY = lastY();
  var endY =  startY + (Util.toInt(y, 0) * segmentLength);

  for(n = 0 ; n < enter ; n++)
    addSegment(Util.easeIn(0, curve, n/enter), Util.easeInOut(startY, endY, n/total));
  for(n = 0 ; n < hold  ; n++)
    addSegment(curve, Util.easeInOut(startY, endY, (enter+n)/total));
  for(n = 0 ; n < leave ; n++)
    addSegment(Util.easeInOut(curve, 0, n/leave), Util.easeInOut(startY, endY, (enter+hold+n)/total));

}

var ROAD = {
  LENGTH: { NONE: 0, SHORT:  25, MEDIUM:  50, LONG:  100 },
  HILL:   { NONE: 0, LOW:    20, MEDIUM:  40, HIGH:   60 },
  CURVE:  { NONE: 0, EASY:    2, MEDIUM:   4, HARD:    6 }
};



function addStraight(num) {
  num = num || ROAD.LENGTH.MEDIUM;
  addRoad(num, num, num, 0);
}

function addHill(num, height) {
  num    = num    || ROAD.LENGTH.MEDIUM;
  height = height || ROAD.HILL.MEDIUM;
  addRoad(num, num, num, 0, height);
}

function addCurve(num, curve) {
  num    = num    || ROAD.LENGTH.MEDIUM;
  curve  = curve  || ROAD.CURVE.MEDIUM;
  addRoad(num, num, num, curve);
}

function addLowRollingHills(num, height) {
  num    = num    || ROAD.LENGTH.SHORT;
  height = height || ROAD.HILL.LOW;
  addRoad(num, num, num,  0,  height/2);
  addRoad(num, num, num,  0, -height);
  addRoad(num, num, num,  0,  height);
  addRoad(num, num, num,  0,  0);
  addRoad(num, num, num,  0,  height/2);
  addRoad(num, num, num,  0,  0);
}
    
function addSCurves() {
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY);
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.MEDIUM);
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.EASY);
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY);
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.MEDIUM);
}

function setInitialSegments(){
	 for(let i=0;i<500;i++){
    addSegment(0,40);
    addStraight(ROAD.LENGTH.SHORT/2);
    addHill(ROAD.LENGTH.SHORT, ROAD.HILL.LOW);
    addLowRollingHills();
    addCurve(ROAD.LENGTH.LONG, -ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM);
    addCurve(ROAD.LENGTH.MEDIUM, ROAD.CURVE.MEDIUM, ROAD.HILL.LOW);
    addLowRollingHills();
    addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM);
    addStraight();
    
    addHill(ROAD.LENGTH.LONG, ROAD.HILL.HIGH);
    addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM, -ROAD.HILL.LOW);
    addHill(ROAD.LENGTH.LONG, -ROAD.HILL.MEDIUM);
    addStraight();
	 }
}

function findSegment(z) {
  return segments[Math.floor(z/segmentLength) % segments.length];
}

function renderRoad(){


	// var baseSegment = findSegment(position);
	// var maxy        = CANVAS_HEIGHT;
	// var n, segment;

	// for(n = 0 ; n <drawDistance ; n++) {

	//   segment = segments[(baseSegment.index + n) % segments.length];

	//   project(segment.p1, (playerX * roadWidth), cameraHeight, position, cameraDepth, CANVAS_WIDTH, CANVAS_HEIGHT, roadWidth);
	//   project(segment.p2, (playerX * roadWidth), cameraHeight, position, cameraDepth, CANVAS_WIDTH, CANVAS_HEIGHT, roadWidth);

	//   if ((segment.p1.camera.z <= cameraDepth) || // behind us
	//       (segment.p2.screen.y >= CANVAS_HEIGHT)) {
	//   	continue;
	//   }
	//   drawRoadSegment(ctx, CANVAS_WIDTH, lanes,
  //            segment.p1.screen.x,
  //            segment.p1.screen.y,
  //            segment.p1.screen.w,
  //            segment.p2.screen.x,
  //            segment.p2.screen.y,
  //            segment.p2.screen.w,
  //            segment.color);

	//   maxy = segment.p2.screen.y;
  // }      
  var playerSegment = findSegment(position+playerZ);
  var playerPercent = Util.percentRemaining(position+playerZ, segmentLength);
  var baseSegment = findSegment(position);
  var basePercent = Util.percentRemaining(position, segmentLength);
  var maxy = CANVAS_HEIGHT;
  var playerY       = Util.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);
  
  var x  = 0;
  var dx = - (baseSegment.curve * basePercent);
  for(n = 0 ; n < drawDistance ; n++) {

    segment = segments[(baseSegment.index + n) % segments.length];

    project(segment.p1, (playerX * roadWidth) - x,playerY + cameraHeight, position, cameraDepth, canvas.width, canvas.height, roadWidth);
    project(segment.p2, (playerX * roadWidth) - x - dx, playerY + cameraHeight, position, cameraDepth, canvas.width, canvas.height, roadWidth);

    x  = x + dx;
    dx = dx + segment.curve;

    if ((segment.p1.camera.z <= cameraDepth)  ||
        (segment.p2.screen.y >= CANVAS_HEIGHT)||
        (segment.p2.screen.y >= maxy)) {
	  	continue;
	  }
	  drawRoadSegment(ctx, CANVAS_WIDTH, lanes,
             segment.p1.screen.x,
             segment.p1.screen.y,
             segment.p1.screen.w,
             segment.p2.screen.x,
             segment.p2.screen.y,
             segment.p2.screen.w,
             segment.color);

	          maxy = segment.p2.screen.y;

  }


  
}


function drawRoadSegment(ctx, width, lanes, x1, y1, w1, x2, y2, w2, color) {

	// let r1 = w1 / 10, r2 = w2 / 10,
 //            l1 = w1 / 40, l2 = w2 / 40;
	var r1 = getRumbleWidth(w1, lanes),
	    r2 = getRumbleWidth(w2, lanes),
	    l1 = getLaneMarkerWidth(w1, lanes),
	    l2 = getLaneMarkerWidth(w2, lanes);
	let    lanew1, lanew2, lanex1, lanex2, lane;
	
  ctx.fillStyle = color.grass;
  

	ctx.fillRect(0, y2, width, y1 - y2);

	drawPolygon(ctx, x1-w1-r1, y1, x1-w1, y1, x2-w2, y2, x2-w2-r2, y2, color.rumble);
	drawPolygon(ctx, x1+w1+r1, y1, x1+w1, y1, x2+w2, y2, x2+w2+r2, y2, color.rumble);
	drawPolygon(ctx, x1-w1,    y1, x1+w1, y1, x2+w2, y2, x2-w2,    y2, color.road);

	if (color.lane) {
	  lanew1 = w1*2/lanes;
	  lanew2 = w2*2/lanes;
	  lanex1 = x1 - w1 + lanew1;
	  lanex2 = x2 - w2 + lanew2;
	  for(lane = 1 ; lane < lanes ; lanex1 += lanew1, lanex2 += lanew2, lane++)
	    drawPolygon(ctx, lanex1 - l1/2, y1, lanex1 + l1/2, y1, lanex2 + l2/2, y2, lanex2 - l2/2, y2, color.lane);
	}

}

function getRumbleWidth(projectedRoadWidth, lanes) { 
	return projectedRoadWidth/Math.max(6,  2*lanes); 
}
function getLaneMarkerWidth(projectedRoadWidth, lanes) { 
	return projectedRoadWidth/Math.max(32, 8*lanes); 
}


function drawPolygon(ctx, x1, y1, x2, y2, x3, y3, x4, y4, color) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.lineTo(x3, y3);
	ctx.lineTo(x4, y4);
	ctx.closePath();
	ctx.fill();
}

function project(p, cameraX, cameraY, cameraZ, cameraDepth, width, height, roadWidth) {
  p.camera.x     = (p.world.x || 0) - cameraX;
  p.camera.y     = (p.world.y || 0) - cameraY;
  p.camera.z     = (p.world.z || 0) - cameraZ;
  p.screen.scale = cameraDepth/p.camera.z;
  p.screen.x     = Math.round((width/2)  + (p.screen.scale * p.camera.x  * width/2));
  p.screen.y     = Math.round((height/2) - (p.screen.scale * p.camera.y  * height/2));
  p.screen.w     = Math.round((p.screen.scale * roadWidth   * width/2));
}


setInitialSegments();
function frame(time) {
	renderRoad();
	position+=segmentLength;
	position=position%(segmentLength*drawDistance);
	for(let i=0;i<1000;i++){

  }  
  requestAnimationFrame(frame);
}

frame();