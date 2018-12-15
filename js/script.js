
var KEY = {
  LEFT:  37,UP:    38,RIGHT: 39,DOWN:  40,A:     65,D:     68,
  S:     83,
  W:     87
};

var COLORS = {
  SKY:  '#72D7EE',
  TREE: '#005108',
  LIGHT:  { road: '#696969', grass: '#10AA10', rumble: 'yellow', lane: 'yellow'  },
  DARK:   { road: '#696969', grass: '#009A00', rumble: 'red'                   },
  START:  { road: 'white',   grass: 'white',   rumble: 'white'                     },
  FINISH: { road: 'black',   grass: 'black',   rumble: 'black'                     }
};

var BACKGROUND = {
  HILLS: { x:   5, y:   5, w: 1280, h: 480 },
  SKY:   { x:   5, y: 495, w: 1280, h: 480 },
  TREES: { x:   5, y: 985, w: 1280, h: 480 }
};

var SPRITES = {

  PLAYER_UPHILL_LEFT:     {x:  27, y:  0, w:   25, h:   50 },
  PLAYER_UPHILL_STRAIGHT: { x: 0, y:  0, w:   21, h:   50 },
  PLAYER_UPHILL_RIGHT:    {x:  58, y:  0, w:   25, h:   50},
  PLAYER_LEFT:            { x:  27, y:  0, w:   25, h:   50 },
  PLAYER_STRAIGHT:        { x: 0, y:  0, w:   21, h:   50 },
  PLAYER_RIGHT:           { x:  58, y:  0, w:   25, h:   50 }
};
// var SPRITES = {

//   PLAYER_UPHILL_LEFT:     {x:  27, y:  0, w:   69, h:   136 },
//   PLAYER_UPHILL_STRAIGHT: { x: 0, y:  0, w:   58, h:   136 },
//   PLAYER_UPHILL_RIGHT:    {x:  127, y:  0, w:   69, h:   136},
//   PLAYER_LEFT:            { x:  27, y:  0, w:   69, h:   136 },
//   PLAYER_STRAIGHT:        { x: 58, y:  0, w:   58, h:   136 },
//   PLAYER_RIGHT:           { x:  127, y:  0, w:   69, h:   136 }
// };
SPRITES.SCALE = 0.1 * (1/SPRITES.PLAYER_STRAIGHT.w)



//update function


function update(dt) {

  var playerSegment = findSegment(position+playerZ);
  var speedPercent  = speed/maxSpeed;
  var dx            = dt * 2 * speedPercent;

  position = Util.increase(position, dt * speed, trackLength);

  skyOffset  = Util.increase(skyOffset,  skySpeed  * playerSegment.curve * speedPercent, 1);
  hillOffset = Util.increase(hillOffset, hillSpeed * playerSegment.curve * speedPercent, 1);
  treeOffset = Util.increase(treeOffset, treeSpeed * playerSegment.curve * speedPercent, 1);

  if (keyLeft)
    playerX = playerX - dx;
  else if (keyRight)
    playerX = playerX + dx;

  playerX = playerX - (dx * speedPercent * playerSegment.curve * centrifugal);

  if (keyFaster)
    speed = Util.accelerate(speed, accel, dt);
  else if (keySlower)
    speed = Util.accelerate(speed, breaking, dt);
  else
    speed = Util.accelerate(speed, decel, dt);

  if (((playerX < -1) || (playerX > 1)) && (speed > offRoadLimit))
    speed = Util.accelerate(speed, offRoadDecel, dt);

  playerX = Util.limit(playerX, -2, 2);
  speed   = Util.limit(speed, 0, maxSpeed);

}

//render game 

function render() {

  var baseSegment   = findSegment(position);
  var basePercent   = Util.percentRemaining(position, segmentLength);
  var playerSegment = findSegment(position+playerZ);
  var playerPercent = Util.percentRemaining(position+playerZ, segmentLength);
  var playerY       = Util.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);
  var maxy          = height;

  var x  = 0;
  var dx = - (baseSegment.curve * basePercent);

  ctx.clearRect(0, 0, width, height);

  Render.background(ctx, background, width, height, BACKGROUND.SKY,   skyOffset,  resolution * skySpeed  * playerY);
  Render.background(ctx, background, width, height, BACKGROUND.HILLS, hillOffset, resolution * hillSpeed * playerY);
  Render.background(ctx, background, width, height, BACKGROUND.TREES, treeOffset, resolution * treeSpeed * playerY);

  var n, segment;

  for(n = 0 ; n < drawDistance ; n++) {

    segment        = segments[(baseSegment.index + n) % segments.length];
    segment.looped = segment.index < baseSegment.index;

    Util.project(segment.p1, (playerX * roadWidth) - x,      playerY + cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);
    Util.project(segment.p2, (playerX * roadWidth) - x - dx, playerY + cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);

    x  = x + dx;
    dx = dx + segment.curve;

    if ((segment.p1.camera.z <= cameraDepth)         ||
        (segment.p2.screen.y >= segment.p1.screen.y) ||
        (segment.p2.screen.y >= maxy))
      continue;

    Render.segment(ctx, width, lanes,
                   segment.p1.screen.x,
                   segment.p1.screen.y,
                   segment.p1.screen.w,
                   segment.p2.screen.x,
                   segment.p2.screen.y,
                   segment.p2.screen.w,
                   segment.fog,
                   segment.color);

    maxy = segment.p2.screen.y;
  }

  Render.player(ctx, width, height, resolution, roadWidth, sprites, speed/maxSpeed,
                cameraDepth/playerZ,
                width/2,
                (height/2) - (cameraDepth/playerZ * Util.interpolate(playerSegment.p1.camera.y, playerSegment.p2.camera.y, playerPercent) * height/2),
                speed * (keyLeft ? -1 : keyRight ? 1 : 0),
                playerSegment.p2.world.y - playerSegment.p1.world.y);
}


//build the road 

function lastY() {
  return (segments.length == 0) ? 0 : segments[segments.length-1].p2.world.y;
  }

function addSegment(curve, y) {
  var n = segments.length;
  segments.push({
     index: n,
        p1: { world: { y: lastY(), z:  n   *segmentLength }, camera: {}, screen: {} },
        p2: { world: { y: y,       z: (n+1)*segmentLength }, camera: {}, screen: {} },
     curve: curve,
     color: Math.floor(n/rumbleLength)%2 ? COLORS.DARK : COLORS.LIGHT
  });
}

function addRoad(enter, hold, leave, curve, y) {
  var startY   = lastY();
  var endY     = startY + (Util.toInt(y, 0) * segmentLength);
  var n, total = enter + hold + leave;
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
  addRoad(num, num, num, 0, 0);
}

function addHill(num, height) {
  num    = num    || ROAD.LENGTH.MEDIUM;
  height = height || ROAD.HILL.MEDIUM;
  addRoad(num, num, num, 0, height);
}

function addCurve(num, curve, height) {
  num    = num    || ROAD.LENGTH.MEDIUM;
  curve  = curve  || ROAD.CURVE.MEDIUM;
  height = height || ROAD.HILL.NONE;
  addRoad(num, num, num, curve, height);
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
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY,    ROAD.HILL.NONE);
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.MEDIUM,  ROAD.HILL.MEDIUM);
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.EASY,   -ROAD.HILL.LOW);
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY,    ROAD.HILL.MEDIUM);
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.MEDIUM, -ROAD.HILL.MEDIUM);
}

function addDownhillToEnd(num) {
  num = num || 200;
  addRoad(num, num, num, -ROAD.CURVE.EASY, -lastY()/segmentLength);
}

function resetRoad() {
  segments = [];

  addStraight(ROAD.LENGTH.SHORT/2);
  addStraight();
  addStraight();
  addStraight();
  addHill(ROAD.LENGTH.SHORT, ROAD.HILL.LOW);
  addLowRollingHills();
  // addCurve(ROAD.LENGTH.MEDIUM, ROAD.CURVE.MEDIUM, ROAD.HILL.LOW);
  // addLowRollingHills();
  // addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM);
  addStraight();
  // addCurve(ROAD.LENGTH.LONG, -ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM);
  addHill(ROAD.LENGTH.LONG, ROAD.HILL.HIGH);
  // addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM, -ROAD.HILL.LOW);
  addHill(ROAD.LENGTH.LONG, -ROAD.HILL.MEDIUM);
  addStraight();
  addDownhillToEnd();

  segments[findSegment(playerZ).index + 2].color = COLORS.START;
  segments[findSegment(playerZ).index + 3].color = COLORS.START;
  for(var n = 0 ; n < rumbleLength ; n++)
    segments[segments.length-1-n].color       = COLORS.FINISH;

  trackLength = segments.length * segmentLength;
}

function findSegment(z) {
  return segments[Math.floor(z/segmentLength) % segments.length]; 
}

//game loop 

Game.run({
  canvas: canvas,
  render: render,
  update: update,
  step: step,
  images: ["background", "sprites"],
  keys: [
    { keys: [KEY.LEFT,  KEY.A], mode: 'down', action: function() { keyLeft   = true;  } },
    { keys: [KEY.RIGHT, KEY.D], mode: 'down', action: function() { keyRight  = true;  } },
    { keys: [KEY.UP,    KEY.W], mode: 'down', action: function() { keyFaster = true;  } },
    { keys: [KEY.DOWN,  KEY.S], mode: 'down', action: function() { keySlower = true;  } },
    { keys: [KEY.LEFT,  KEY.A], mode: 'up',   action: function() { keyLeft   = false; } },
    { keys: [KEY.RIGHT, KEY.D], mode: 'up',   action: function() { keyRight  = false; } },
    { keys: [KEY.UP,    KEY.W], mode: 'up',   action: function() { keyFaster = false; } },
    { keys: [KEY.DOWN,  KEY.S], mode: 'up',   action: function() { keySlower = false; } }
  ],
  ready: function(images) {
    background = images[0];
    sprites    = images[1];
    reset();
  }
});

function reset(options) {
  options       = options || {};
  canvas.width  = width  = Util.toInt(options.width,          width);
  canvas.height = height = Util.toInt(options.height,         height);
  lanes                  = Util.toInt(options.lanes,          lanes);
  roadWidth              = Util.toInt(options.roadWidth,      roadWidth);
  cameraHeight           = Util.toInt(options.cameraHeight,   cameraHeight);
  drawDistance           = Util.toInt(options.drawDistance,   drawDistance);
  fieldOfView            = Util.toInt(options.fieldOfView,    fieldOfView);
  segmentLength          = Util.toInt(options.segmentLength,  segmentLength);
  rumbleLength           = Util.toInt(options.rumbleLength,   rumbleLength);
  cameraDepth            = 1 / Math.tan((fieldOfView/2) * Math.PI/180);
  playerZ                = (cameraHeight * cameraDepth);
  resolution             = height/480;

  if ((segments.length==0) || (options.segmentLength) || (options.rumbleLength))
    resetRoad();
}
