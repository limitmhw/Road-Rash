
//update function

function update(dt) { 
  var n, car, carW,bike,bikeW,sprite, spriteW;
  var playerSegment = findSegment(position+playerZ);
  var speedPercent  = speed/maxSpeed;
  var dx            = dt * 2 * speedPercent;

  var playerW       = SPRITES.PLAYER_STRAIGHT.w * SPRITES.SCALE;

  var startPosition = position;
  updateBikes(dt,playerSegment, playerW);
  updateCars(dt, playerSegment,playerW);

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

  // if (((playerX < -1) || (playerX > 1)) && (speed > offRoadLimit))
  //   speed = Util.accelerate(speed, offRoadDecel, dt);

  if ((playerX < -1) || (playerX > 1)) {

    if (speed > offRoadLimit)
      speed = Util.accelerate(speed, offRoadDecel, dt);

    for(n = 0 ; n < playerSegment.sprites.length ; n++) {
      sprite  = playerSegment.sprites[n];
      spriteW = sprite.source.w * SPRITES.SCALE;
      if (Util.overlap(playerX, playerW, sprite.offset + spriteW/2 * (sprite.offset > 0 ? 1 : -1), spriteW)) {
        speed = maxSpeed/5;
        position = Util.increase(playerSegment.p1.world.z, -playerZ, trackLength); // stop in front of sprite (at front of segment)
        break;
      }
    }
  }


  for(n = 0 ; n < playerSegment.cars.length ; n++) {
    car  = playerSegment.cars[n];
    carW = car.sprite.w * SPRITES.SCALE;
    if (speed > car.speed) {
      if (Util.overlap(playerX, playerW, car.offset, carW, 0.8)) {
        speed    = car.speed * (car.speed/speed);
        position = Util.increase(car.z, -playerZ, trackLength);
        break;
      }
    }
  }


  for(n = 0 ; n < playerSegment.bikes.length ; n++) {
    bike  = playerSegment.bikes[n];
    bikeW = bike.sprite.w * SPRITES.SCALE;
    if (speed > bike.speed) {
      if (Util.overlap(playerX, playerW, bike.offset, bikeW, 0.8)) {
        speed    = bike.speed * (bike.speed/speed);
        position = Util.increase(bike.z, -playerZ, trackLength);
        break;
      }
    }
  }
  playerX = Util.limit(playerX, -2, 2);
  speed   = Util.limit(speed, 0, maxSpeed);



}

function updateBikes(dt, playerSegment, playerW){
  // console.log('joshua');
  var m,bike, oldSegment, newSegment;
  for(m = 0; m< bikes.length; m++){
    bike        = bikes[m];
    oldSegment  = findSegment(bike.z);
    bike.offset = bike.offset + updateBikeOffset(bike, oldSegment, playerSegment, playerW);
    bike.z      = Util.increase(bike.z, dt * bike.speed, trackLength);
    bike.percent= Util.percentRemaining(bike.z, segmentLength);
    newSegment  = findSegment(bike.z);
    if(oldSegment != newSegment){
      index = oldSegment.bikes.indexOf(bike);
      oldSegment.bikes.splice(index,1);
      newSegment.bikes.push(bike);
    }
  }

}

function updateBikeOffset(bike, bikeSegment, playerSegment, playerW){

  var i,j,dir,segment,otherbike, otherbikeW, lookahead = 20, bikeW = bike.sprite.w * SPRITES.SCALE;

  //optimization

  if((bikeSegment.index - playerSegment.index)>drawDistance)
    return 0;

  for(i=1 ; i < lookahead; i++){
    segment = segments[(bikeSegment.index+i)%segments.length];

    if ((segment === playerSegment) && (bike.speed > speed) && (Util.overlap(playerX, playerW, bike.offset, bikeW, 1.2))) {
      if (playerX > 0.5)
        dir = -1;
      else if (playerX < -0.5)
        dir = 1;
      else
        dir = (bike.offset > playerX) ? 1 : -1;
      return dir * 1/i * (bike.speed-speed)/maxSpeed; // the closer the cars (smaller i) and the greated the speed ratio, the larger the offset
    }
    // console.log('joshua');
    for(j = 0 ; j < segment.bikes.length ; j++) {
      otherbike  = segment.bikes[j];
      otherbikeW = otherbike.sprite.w * SPRITES.SCALE;
      if ((bike.speed > otherbike.speed) && Util.overlap(bike.offset, bikeW, otherbike.offset, otherbikeW, 1.2)) {
        if (otherbike.offset > 0.5)
          dir = -1;
        else if (otherbike.offset < -0.5)
          dir = 1;
        else
          dir = (bike.offset > otherbike.offset) ? 1 : -1;
        return dir * 1/i * (bike.speed-otherbike.speed)/maxSpeed;
      }
    }
  }


  if (bike.offset < -0.9)
  return 0.1;
else if (bike.offset > 0.9)
  return -0.1;
else
  return 0;
}

function updateCars(dt, playerSegment, playerW) {
  var n, car, oldSegment, newSegment;
  for(n = 0 ; n < cars.length ; n++) {
    car         = cars[n];
    oldSegment  = findSegment(car.z);
    car.offset  = car.offset + updateCarOffset(car, oldSegment, playerSegment, playerW);
    car.z       = Util.increase(car.z, dt * car.speed, trackLength);
    car.percent = Util.percentRemaining(car.z, segmentLength); // useful for interpolation during rendering phase
    newSegment  = findSegment(car.z);
    if (oldSegment != newSegment) {
      index = oldSegment.cars.indexOf(car);
      oldSegment.cars.splice(index, 1);
      newSegment.cars.push(car);
    }
  }
}

function updateCarOffset(car, carSegment, playerSegment, playerW) {

  var i, j, dir, segment, othercar, othercarW, lookahead = 20, carW = car.sprite.w * SPRITES.SCALE;

  // optimization, dont bother steering around other cars when 'out of sight' of the player
  if ((carSegment.index - playerSegment.index) > drawDistance)
    return 0;

  for(i = 1 ; i < lookahead ; i++) {
    segment = segments[(carSegment.index+i)%segments.length];

    if ((segment === playerSegment) && (car.speed > speed) && (Util.overlap(playerX, playerW, car.offset, carW, 1.2))) {
      if (playerX > 0.5)
        dir = -1;
      else if (playerX < -0.5)
        dir = 1;
      else
        dir = (car.offset > playerX) ? 1 : -1;
      return dir * 1/i * (car.speed-speed)/maxSpeed; // the closer the cars (smaller i) and the greated the speed ratio, the larger the offset
    }

    for(j = 0 ; j < segment.cars.length ; j++) {
      othercar  = segment.cars[j];
      othercarW = othercar.sprite.w * SPRITES.SCALE;
      if ((car.speed > othercar.speed) && Util.overlap(car.offset, carW, othercar.offset, othercarW, 1.2)) {
        if (othercar.offset > 0.5)
          dir = -1;
        else if (othercar.offset < -0.5)
          dir = 1;
        else
          dir = (car.offset > othercar.offset) ? 1 : -1;
        return dir * 1/i * (car.speed-othercar.speed)/maxSpeed;
      }
    }
  }

  // if no cars ahead, but I have somehow ended up off road, then steer back on
  if (car.offset < -0.9)
    return 0.1;
  else if (car.offset > 0.9)
    return -0.1;
  else
    return 0;
}




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

  var n, i, segment, car,bike, sprite, spriteScale, spriteX, spriteY;

  for(n = 0 ; n < drawDistance ; n++) {

    segment        = segments[(baseSegment.index + n) % segments.length];
    segment.looped = segment.index < baseSegment.index;
    segment.clip   = maxy;

    Util.project(segment.p1, (playerX * roadWidth) - x,      playerY + cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);
    Util.project(segment.p2, (playerX * roadWidth) - x - dx, playerY + cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);

    x  = x + dx;
    dx = dx + segment.curve;

    if ((segment.p1.camera.z <= cameraDepth)         || // behind us
        (segment.p2.screen.y >= segment.p1.screen.y) || // back face cull
        (segment.p2.screen.y >= maxy))                  // clip by (already rendered) hill
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

    maxy = segment.p1.screen.y;
  }

  for(n = (drawDistance-1) ; n > 0 ; n--) {
    segment = segments[(baseSegment.index + n) % segments.length];

    

    
    for(i = 0 ; i < segment.cars.length ; i++) {
      car        = segment.cars[i];
      sprite      = car.sprite;
      spriteScale = Util.interpolate(segment.p1.screen.scale, segment.p2.screen.scale, car.percent);
      spriteX     = Util.interpolate(segment.p1.screen.x,     segment.p2.screen.x,     car.percent) + (spriteScale * car.offset * roadWidth * width/2);
      spriteY     = Util.interpolate(segment.p1.screen.y,     segment.p2.screen.y,     car.percent);
      Render.sprite(ctx, width, height, resolution, roadWidth, sprites, car.sprite, spriteScale, spriteX, spriteY, -0.5, -1, segment.clip);
    }
    for(i = 0 ; i < segment.bikes.length ; i++) {
      bike        = segment.bikes[i];
      sprite      = bike.sprite;
      // console.log(sprite);
      spriteScale = Util.interpolate(segment.p1.screen.scale, segment.p2.screen.scale, bike.percent);
      spriteX     = Util.interpolate(segment.p1.screen.x,     segment.p2.screen.x,     bike.percent) + (spriteScale * bike.offset * roadWidth * width/2);
      spriteY     = Util.interpolate(segment.p1.screen.y,     segment.p2.screen.y,     bike.percent);
      Render.sprite(ctx, width, height, resolution, roadWidth, sprites, bike.sprite, spriteScale, spriteX, spriteY, -0.5, -1, segment.clip);
    }
    for(i = 0 ; i < segment.sprites.length ; i++) {
      sprite      = segment.sprites[i];
      spriteScale = segment.p1.screen.scale;
      spriteX     = segment.p1.screen.x + (spriteScale * sprite.offset * roadWidth * width/2);
      spriteY     = segment.p1.screen.y;
      Render.sprite(ctx, width, height, resolution, roadWidth, sprites, sprite.source, spriteScale, spriteX, spriteY, (sprite.offset < 0 ? -1 : 0), -1, segment.clip);
    }

    if (segment == playerSegment) {
      Render.player(ctx, width, height, resolution, roadWidth, sprites, speed/maxSpeed,
                    cameraDepth/playerZ,
                    width/2,
                    (height/2) - (cameraDepth/playerZ * Util.interpolate(playerSegment.p1.camera.y, playerSegment.p2.camera.y, playerPercent) * height/2),
                    speed * (keyLeft ? -1 : keyRight ? 1 : 0),
                    playerSegment.p2.world.y - playerSegment.p1.world.y);
    }




  }


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
     sprites: [],
     cars: [],
     bikes: [],
     color: Math.floor(n/rumbleLength)%2 ? COLORS.DARK : COLORS.LIGHT
  });
}


function addSprite(n, sprite, offset) {
  segments[n].sprites.push({ source: sprite, offset: offset });
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
  addCurve(ROAD.LENGTH.MEDIUM, ROAD.CURVE.MEDIUM, ROAD.HILL.LOW);
  addLowRollingHills();
  addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM);
  addStraight();
  addCurve(ROAD.LENGTH.LONG, -ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM);
  addHill(ROAD.LENGTH.LONG, ROAD.HILL.HIGH);
  addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM, -ROAD.HILL.LOW);
  addHill(ROAD.LENGTH.LONG, -ROAD.HILL.MEDIUM);
  addStraight();
  addDownhillToEnd();

  resetBikes();
  resetCars();
  // resetBikes();

  segments[findSegment(playerZ).index + 2].color = COLORS.START;
  segments[findSegment(playerZ).index + 3].color = COLORS.START;
  for(var n = 0 ; n < rumbleLength ; n++)
    segments[segments.length-1-n].color       = COLORS.FINISH;

  trackLength = segments.length * segmentLength;
}

function findSegment(z) {
  return segments[Math.floor(z/segmentLength) % segments.length]; 
}

function resetCars() {
  cars = [];
  var n, car, segment, offset, z, sprite, speed;
  for (var n = 0 ; n < totalCars ; n++) {
    offset = Math.random() * Util.randomChoice([-0.8, 0.8]);
    z      = Math.floor(Math.random() * segments.length) * segmentLength;
    sprite = Util.randomChoice(SPRITES.CARS);
    speed  = maxSpeed/4;
    //  + Math.random() * maxSpeed/(sprite == SPRITES.SEMI ? 4 : 2);
    car = { offset: offset, z: z, sprite: sprite, speed: speed };
    segment = findSegment(car.z);
    segment.cars.push(car);
    cars.push(car);
  }
}

function resetBikes() {
  bikes = [];
  var n, bike, segment, offset, z, sprite, speed;
  for (var n = 0 ; n < totalBikes ; n++) {
    offset = Math.random() * Util.randomChoice([-0.8, 0.8]);
    z      = Math.floor(Math.random() * segments.length) * segmentLength;
    sprite = Util.randomChoice(SPRITES.BIKES);
    speed  = maxSpeed/4;
    //  + Math.random() * maxSpeed/(sprite == SPRITES.SEMI ? 4 : 2);
    bike = { offset: offset, z: z, sprite: sprite, speed: speed };
    segment = findSegment(bike.z);
    segment.bikes.push(bike);
    bikes.push(bike);
  }
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
    { keys: [KEY.Q],            mode: 'down', action: function() { keyQ      = true;  } },
    { keys: [KEY.E],            mode: 'down', action: function() { keyE      = true;  } },
    { keys: [KEY.Z],            mode: 'down', action: function() { keyZ      = true;  } },
    { keys: [KEY.C],            mode: 'down', action: function() { keyC      = true;  } },
    { keys: [KEY.LEFT,  KEY.A], mode: 'up',   action: function() { keyLeft   = false; } },
    { keys: [KEY.RIGHT, KEY.D], mode: 'up',   action: function() { keyRight  = false; } },
    { keys: [KEY.UP,    KEY.W], mode: 'up',   action: function() { keyFaster = false; } },
    { keys: [KEY.DOWN,  KEY.S], mode: 'up',   action: function() { keySlower = false; } },
    { keys: [KEY.Q],            mode: 'up',   action: function() { keyQ      = false; } },
    { keys: [KEY.E],            mode: 'up',   action: function() { keyE      = false; } },
    { keys: [KEY.Z],            mode: 'up',   action: function() { keyZ      = false; } },
    { keys: [KEY.C],            mode: 'up',   action: function() { keyC      = false; } },
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
