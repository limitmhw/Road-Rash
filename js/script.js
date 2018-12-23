//update function
function update(dt) {


  var n, car, carW,bike,bikeW,sprite, spriteW;
  var playerSegment = findSegment(position+playerZ);
  var speedPercent  = speed/maxSpeed;
  var dx            = dt * 2 * speedPercent;
  // var unow = AllFn.timestamp();
  var playerW       = SPRITES.PLAYER_STRAIGHT.w * SPRITES.SCALE;

  // var startPosition = position;

  position = AllFn.increase(position, dt * speed, trackLength);
  currentPosition += dt * speed;

  if (currentPosition > trackLength) {
    crossFinish = true;
  }

  skyOffset  = AllFn.increase(skyOffset,  skySpeed  * playerSegment.curve * speedPercent, 1);
  hillOffset = AllFn.increase(hillOffset, hillSpeed * playerSegment.curve * speedPercent, 1);
  treeOffset = AllFn.increase(treeOffset, treeSpeed * playerSegment.curve * speedPercent, 1);

// console.log(countdown);

  if(!crossFinish){

    updateBikes(dt,playerSegment, playerW);
    updateCars(dt, playerSegment,playerW);

    updatePlayerPosition();

    if (keyLeft)
      playerX = playerX - dx;
    else if (keyRight)
      playerX = playerX + dx;

    playerX = playerX - (dx * speedPercent * playerSegment.curve * centrifugal);

    if (keyFaster){
      bikeForward.play();
      // bikeForward.loop = true;
      speed = AllFn.accelerate(speed, accel, dt);


    }
    else if (keySlower){
      speed = AllFn.accelerate(speed, breaking, dt);
      bikeForward.pause();
      }
    else
      speed = AllFn.accelerate(speed, decel, dt);
  }
  else{
    speed = 0;
    // ctx.fillStyle = "black";
    // ctx.font = "80px PerfectDark";
    // text_width= ctx.measureText("GAME OVER!").width;
    // ctx.fillText("GAME OVER!",1280/2 - text_width,320);
    // speed=AllFn.accelerate(speed,breaking,dt);
  }



  if (((playerX < -1) || (playerX > 1)) && (speed > offRoadLimit))
    speed = AllFn.accelerate(speed, offRoadDecel, dt);

  if ((playerX < -1) || (playerX > 1)) {

    if (speed > offRoadLimit)
      speed = AllFn.accelerate(speed, offRoadDecel, dt);

    for(n = 0 ; n < playerSegment.sprites.length ; n++) {
      sprite  = playerSegment.sprites[n];
      spriteW = sprite.source.w * SPRITES.SCALE;
      if (AllFn.overlap(playerX, playerW, sprite.offset + spriteW/2 * (sprite.offset > 0 ? 1 : -1), spriteW)) {
        crash.play();
        speed = maxSpeed/5;
        position = AllFn.increase(playerSegment.p1.world.z, -playerZ, trackLength);
        break;
      }
    }
  }


  for(n = 0 ; n < playerSegment.cars.length ; n++) {
    car  = playerSegment.cars[n];
    carW = car.sprite.w * SPRITES.SCALE;
    if (speed > car.speed) {
      if (AllFn.overlap(playerX, playerW, car.offset, carW, 0.8)) {
        crash.play();
        speed    = car.speed * (car.speed/speed);
        position = AllFn.increase(car.z, -playerZ, trackLength);
        break;
      }
    }
  }


  for(n = 0 ; n < playerSegment.bikes.length ; n++) {
    bike  = playerSegment.bikes[n];
    bikeW = bike.sprite.w * SPRITES.SCALE;
    if (speed > bike.speed) {
      if (AllFn.overlap(playerX, playerW, bike.offset, bikeW, 0.8)) {

        if(playerX < bike.offset && keyC){
          kick.play();
          bike.offset += 0.5;
        }

        if(playerX > bike.offset && keyZ){
          kick.play();
          bike.offset -= 0.5;
        }
        crash.play();
        speed    = bike.speed * (bike.speed/speed);
        position = AllFn.increase(bike.z, -playerZ, trackLength);
        break;
      }
    }
  }



  playerX = AllFn.limit(playerX, -2, 2);
  speed   = AllFn.limit(speed, 0, maxSpeed);


  // console.log(AllFn.toInt(position));
  // if(position < playerZ){
  //   console.log(player);
  //   // if(gmOv>4){
  //   //   // gameOver();
  //   //   // console.log(gmOv);
  //   // }
  //   // else
  //     gmOv++;
  // }


}





function updateBikes(dt, playerSegment, playerW){

  // console.log(playerSegment);
  var m,bike, oldSegment, newSegment;
  for(m = 0; m< bikes.length; m++){
    bike        = bikes[m];
    oldSegment  = findSegment(bike.z);
    bike.offset = bike.offset + handleBikeDirection(bike, oldSegment, playerSegment, playerW);
    bike.z      = AllFn.increase(bike.z, dt * bike.speed, trackLength);
    bike.percent= AllFn.percentRemaining(bike.z, segmentLength);
    newSegment  = findSegment(bike.z);
    if(oldSegment != newSegment){
      index = oldSegment.bikes.indexOf(bike);
      oldSegment.bikes.splice(index,1);
      newSegment.bikes.push(bike);
    }
  }

}

function handleBikeDirection(bike, bikeSegment, playerSegment, playerW){

  var i,j,dir,segment,otherbike, otherbikeW, lookahead = 20, bikeW = bike.sprite.w * SPRITES.SCALE;
  if((bikeSegment.index - playerSegment.index)>drawDistance)
    return 0;

  for(i=1 ; i < lookahead; i++){
    segment = segments[(bikeSegment.index+i)%segments.length];

    if ((segment === playerSegment) && (bike.speed > speed) && (AllFn.overlap(playerX, playerW, bike.offset, bikeW, 1.2))) {
      if (playerX > 0.5)
        dir = -1;
      else if (playerX < -0.5)
        dir = 1;
      else
        dir = (bike.offset > playerX) ? 1 : -1;
      return dir * 1/i * (bike.speed-speed)/maxSpeed;
    }

    for(j = 0 ; j < segment.bikes.length ; j++) {
      otherbike  = segment.bikes[j];
      otherbikeW = otherbike.sprite.w * SPRITES.SCALE;
      if ((bike.speed > otherbike.speed) && AllFn.overlap(bike.offset, bikeW, otherbike.offset, otherbikeW, 1.2)) {
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
    car.offset  = car.offset + handleCarDirection(car, oldSegment, playerSegment, playerW);
    car.z       = AllFn.increase(car.z, dt * car.speed, trackLength);
    car.percent = AllFn.percentRemaining(car.z, segmentLength);
    newSegment  = findSegment(car.z);
    if (oldSegment != newSegment) {
      index = oldSegment.cars.indexOf(car);
      oldSegment.cars.splice(index, 1);
      newSegment.cars.push(car);
    }
  }
}

function handleCarDirection(car, carSegment, playerSegment, playerW) {

  var i, j, dir, segment, othercar, othercarW, lookahead = 20, carW = car.sprite.w * SPRITES.SCALE;

  //when out of render distance, no need to handle the offset
  if ((carSegment.index - playerSegment.index) > drawDistance)
    return 0;

  for(i = 1 ; i < lookahead ; i++) {
    segment = segments[(carSegment.index+i)%segments.length];

    if ((segment === playerSegment) && (car.speed > speed) && (AllFn.overlap(playerX, playerW, car.offset, carW, 1.2))) {
      if (playerX > 0.5)
        dir = -1;
      else if (playerX < -0.5)
        dir = 1;
      else
        dir = (car.offset > playerX) ? 1 : -1;
      return dir * 1/i * (car.speed-speed)/maxSpeed;
    }

    for(j = 0 ; j < segment.cars.length ; j++) {
      othercar  = segment.cars[j];
      othercarW = othercar.sprite.w * SPRITES.SCALE;
      if ((car.speed > othercar.speed) && AllFn.overlap(car.offset, carW, othercar.offset, othercarW, 1.2)) {
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

  if (car.offset < -0.9)
    return 0.1;
  else if (car.offset > 0.9)
    return -0.1;
  else
    return 0;
}


function render() {

  var baseSegment   = findSegment(position);
  var basePercent   = AllFn.percentRemaining(position, segmentLength);
  var playerSegment = findSegment(position+playerZ);
  var playerPercent = AllFn.percentRemaining(position+playerZ, segmentLength);
  var playerY       = AllFn.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);
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

    AllFn.project(segment.p1, (playerX * roadWidth) - x,      playerY + cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);
    AllFn.project(segment.p2, (playerX * roadWidth) - x - dx, playerY + cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);

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
                   segment.color,
                   sprites);

    maxy = segment.p1.screen.y;
  }


  for(n = (drawDistance-1) ; n > 0 ; n--) {
    segment = segments[(baseSegment.index + n) % segments.length];




    for(i = 0 ; i < segment.cars.length ; i++) {
      car        = segment.cars[i];
      sprite      = car.sprite;
      spriteScale = AllFn.interpolate(segment.p1.screen.scale, segment.p2.screen.scale, car.percent);
      spriteX     = AllFn.interpolate(segment.p1.screen.x,     segment.p2.screen.x,     car.percent) + (spriteScale * car.offset * roadWidth * width/2);
      spriteY     = AllFn.interpolate(segment.p1.screen.y,     segment.p2.screen.y,     car.percent);
      Render.sprite(ctx, width, height, resolution, roadWidth, sprites, car.sprite, spriteScale, spriteX, spriteY, -0.5, -1, segment.clip);
    }

    for(i = 0 ; i < segment.bikes.length ; i++) {
      bike        = segment.bikes[i];
      sprite      = bike.sprite;
      // console.log(sprite);
      spriteScale = AllFn.interpolate(segment.p1.screen.scale, segment.p2.screen.scale, bike.percent);
      spriteX     = AllFn.interpolate(segment.p1.screen.x,     segment.p2.screen.x,     bike.percent) + (spriteScale * bike.offset * roadWidth * width/2);
      spriteY     = AllFn.interpolate(segment.p1.screen.y,     segment.p2.screen.y,     bike.percent);


      Render.sprite(ctx, width, height, resolution, roadWidth, sprites, bike.sprite, spriteScale, spriteX, spriteY, -0.5, -1, segment.clip);
    }

    for(i = 0 ; i < segment.sprites.length ; i++) {
      sprite      = segment.sprites[i];
      spriteScale = 4 * segment.p1.screen.scale;
      // console.log(spriteScale);
      spriteX     = segment.p1.screen.x + (spriteScale * sprite.offset * roadWidth * width/2);
      spriteY     = segment.p1.screen.y;
      Render.sprite(ctx, width, height, resolution, roadWidth, sprites, sprite.source, spriteScale, spriteX, spriteY, (sprite.offset < 0 ? -1 : 0), -1, segment.clip);
    }


    if (segment == playerSegment) {
      Render.player(ctx, width, height, resolution, roadWidth, sprites, speed/maxSpeed,
                    cameraDepth/playerZ,
                    width/2,
                    (height/2) - (cameraDepth/playerZ * AllFn.interpolate(playerSegment.p1.camera.y, playerSegment.p2.camera.y, playerPercent) * height/2),
                    speed * (keyLeft ? -1 : keyRight ? 1 : 0),
                    playerSegment.p2.world.y - playerSegment.p1.world.y);
    }

  }
  speedoMeter(speed);
  displayRank(rank,bikes.length+1);

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
  var endY     = startY + (AllFn.toInt(y, 0) * segmentLength);
  var n, total = enter + hold + leave;
  for(n = 0 ; n < enter ; n++)
    addSegment(AllFn.transIn(0, curve, n/enter), AllFn.transInOut(startY, endY, n/total));
  for(n = 0 ; n < hold  ; n++)
    addSegment(curve, AllFn.transInOut(startY, endY, (enter+n)/total));
  for(n = 0 ; n < leave ; n++)
    addSegment(AllFn.transInOut(curve, 0, n/leave), AllFn.transInOut(startY, endY, (enter+hold+n)/total));
}

function addStraight(x) {
  x = x || 50;
  addRoad(x, x, x, 0, 0);
}

function addHill(x, height) {
  x    = x    || 50;
  height = height || 40;
  addRoad(x, x, x, 0, height);
}

function addCurve(x, curve, height) {
  x    = x    || 50;
  curve  = curve  || 4;
  height = height || 0;
  addRoad(x, x, x, curve, height);
}

function addLowRollingHills(x, height) {
  x    = x    || 25;
  height = height || 20;
  addRoad(x, x, x,  0,  height/2);
  addRoad(x, x, x,  0, -height);
  addRoad(x, x, x,  0,  height);
  addRoad(x, x, x,  0,  0);
  addRoad(x, x, x,  0,  height/2);
  addRoad(x, x, x,  0,  0);
}

function addSCurves() {
  addRoad(50, 50, 50,  -2,    0);
  addRoad(50, 50, 50,   4,  40);
  addRoad(50, 50, 50,   2,   -20);
  addRoad(50, 50, 50,  -2,    40);
  addRoad(50, 50, 50,  -4, -40);
}

function addDownhillToEnd(x) {
  x = x || 200;
  addRoad(x, x, x, -2, -lastY()/segmentLength);
}

function resetRoad() {
  segments = [];

  addStraight(25/2);
  addStraight();
  addStraight();
  addStraight();
  addHill(25, 20);
  addLowRollingHills();
  addCurve(50, 4, 20);
  addLowRollingHills();
  addCurve(100, 4, 40);
  addStraight();
  addCurve(100, -4, 40);
  addHill(100, 60);
  addCurve(100, 4, -20);
  addHill(100, -40);
  addStraight();
  addDownhillToEnd();

  resetSprites();
  resetBikes();
  resetCars();

  segments[findSegment(playerZ).index + 2].color = COLORS.START;
  segments[findSegment(playerZ).index + 3].color = COLORS.START;
  for(var n = 0 ; n < rumbleLength ; n++)
    segments[segments.length-1-n].color       = COLORS.FINISH;

  trackLength = segments.length * segmentLength;
}

function findSegment(z) {
  return segments[Math.floor(z/segmentLength) % segments.length];
}

//playerposition


function updatePlayerPosition(){
  if(true){ //to be checked if  crossFinish is true or not=================================================


      var playerPosition=[];
      var alreadyFinished=0;

      for (var i = 0; i < bikes.length; i++) {
          if(bikes[i].crossFinish){
              alreadyFinished++;
          }
          else{
              var key='enemy'+i;
              playerPosition.push({'name':key,
                  'position' : bikes[i].z});
          }

      }
      playerPosition.push({'name':'player',
          'position':position});

      playerPosition.sort((a,b)=>{
          return b.position-a.position;
      });

      for(var i=0;i<playerPosition.length;i++){
          if(playerPosition[i].name=='player'){
              var pposition=i+1+alreadyFinished;
              rank = pposition;
              // console.log(pposition, bikes.length+1);
              lastPosition=pposition;
              break;
          }
      }
  }
  else{
      console.log(lastPosition,enemies.length + 1);
  }

}


function resetCars() {
  cars = [];
  var n, car, segment, offset, z, sprite, speed;
  for (var n = 0 ; n < totalCars ; n++) {
    offset = Math.random() * AllFn.randomChoice([-0.8, 0.8]);
    z      = Math.floor(Math.random() * segments.length) * segmentLength;
    sprite = AllFn.randomChoice(SPRITES.CARS);
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
  // offset = 0;
  for (var n = 0 ; n < totalBikes ; n++) {
    offset = Math.random() * AllFn.randomChoice([-0.8, 0.8]);
    z = (cameraHeight * cameraDepth) + 5 * segmentLength;
    sprite = AllFn.randomChoice(SPRITES.BIKES);
    speed  = maxSpeed/(Math.random() * AllFn.randomChoice([2,4]));
    bike = { offset: offset, z: z, sprite: sprite, speed: speed };
    segment = findSegment(bike.z);
    segment.bikes.push(bike);
    bikes.push(bike);
  }
}


function resetSprites() {
  var n,i;
  for(n=20;n<4000;n++){

    // addSprite(n,SPRITES.BUILDING_LEFT,-1);
    // addSprite(n,SPRITES.BUILDING_RIGHT,1);
    // n+=19;
    if(n%60 == 0)
      addSprite(n,SPRITES.LIGHTHOUSE,3);
    if(n%80 == 0)
      addSprite(n,SPRITES.LIGHTHOUSE,-2);
  }

  for(i = 200 ; i < segments.length ; i += 3) {
    addSprite(i, AllFn.randomChoice(SPRITES.SHIPS), AllFn.randomChoice([1,-1]) * (2 + Math.random() * 5));
  }


}


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
  canvas.width  = width  = AllFn.toInt(options.width,          width);
  canvas.height = height = AllFn.toInt(options.height,         height);
  lanes                  = AllFn.toInt(options.lanes,          lanes);
  roadWidth              = AllFn.toInt(options.roadWidth,      roadWidth);
  cameraHeight           = AllFn.toInt(options.cameraHeight,   cameraHeight);
  drawDistance           = AllFn.toInt(options.drawDistance,   drawDistance);
  fieldOfView            = AllFn.toInt(options.fieldOfView,    fieldOfView);
  segmentLength          = AllFn.toInt(options.segmentLength,  segmentLength);
  rumbleLength           = AllFn.toInt(options.rumbleLength,   rumbleLength);
  cameraDepth            = 1 / Math.tan((fieldOfView/2) * Math.PI/180);
  playerZ                = (cameraHeight * cameraDepth);
  resolution             = height/480;

  if ((segments.length==0) || (options.segmentLength) || (options.rumbleLength))
    resetRoad();
}
