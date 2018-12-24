
var bikeForward = new Audio('./music/bike_forward.mp3');
var kick = new Audio('./music/kick.mp3');
var crash = new Audio('./music/bike_crash.mp3');


var playerFinish = false ;
var crossFinish = false;
var enemyFinish= [];

var lastPosition = 0;

var playerPosition = 0;
var currentPosition=0;



var fps           = 60;
var step          = 1/fps;
var width         = 1280;
var height        = 720;
var centrifugal   = 0.3;
var offRoadDecel  = 0.99;
var skySpeed      = 0.001;
var hillSpeed     = 0.002;
var treeSpeed     = 0.003;
var skyOffset     = 0;
var hillOffset    = 0;
var treeOffset    = 0;
var segments      = [];

var cars           = [];
var totalCars = 30;

var bikes         =[];
var totalBikes = 8;



var background    = null;
var sprites       = null;
var resolution    = null;
var roadWidth     = 2000;
var segmentLength = 200;
var rumbleLength  = 3;
var trackLength   = null;
var lanes         = 2;
var fieldOfView   = 100;
var cameraHeight  = 1000;
var cameraDepth   = null;
var drawDistance  = 400;
var playerX       = 0;
var playerZ       = null;

var position      = 0;
var speed         = 0;
var maxSpeed      = segmentLength/step;
var accel         =  maxSpeed/5;
var breaking      = -maxSpeed;
var decel         = -maxSpeed/5;
var offRoadDecel  = -maxSpeed/2;
var offRoadLimit  =  maxSpeed/4;

var keyLeft       = false;
var keyRight      = false;
var keyFaster     = false;
var keySlower     = false;
var keyQ = false;
var keyE = false;
var keyZ = false;
var keyC = false;

var initialCD = false;


var countdown = 3;
var gameStart = false;
var gameOver = false;
var gmOv = 0;
// var crossFinish = false;

var rank = 0 ;
var KEY = {
  LEFT:  37,
  UP:    38,
  RIGHT: 39,
  DOWN:  40,
  A:     65,
  D:     68,
  S:     83,
  W:     87,
  Q:     81,
  E:     69,
  Z:     90,
  C:     67,
};

var COLORS = {
  SKY:  '#72D7EE',
  TREE: '#005108',
  LIGHT:  { road: '#696969',  rumble: 'white', lane: 'white'},
  DARK:   { road: '#696969',  rumble: 'grey' },
  START:  { road: 'white',   grass: 'white',   rumble: 'white'},
  FINISH: { road: 'black',   grass: 'black',   rumble: 'red'}
};

var BACKGROUND = {
  HILLS: { x:   10, y:   5, w: 1280, h: 480 },
  SKY:   { x:   5, y: 495, w: 1280, h: 480 },
  TREES: { x:   5, y: 985, w: 1280, h: 480 }
};

var SPRITES = {
  BIKE01: {x: 111,y:  0,w:  21, h:50},
  BIKE02: {x: 132,y:  0,w:  23, h:50},
  BIKE03: {x: 155,y:  0,w:  24, h:50},

  GROUND:{x:  0,y:  103,w:  79,h: 13},

  BOAT01: {x:354,y:0,w:118,h:45},
  BOAT02: {x:497,y:0,w:89,h:37},
  BOAT03: {x:354,y:82,w:156,h:41},

  LIGHTHOUSE:{x:541,y:54,w:28,h:69},


  CAR01:  {x: 260,y:  0,w:  86,h: 70},
  CAR02:  {x: 179,y:  65,w: 82,h: 75},

  BUILDING_LEFT: {x:1148, y: 3, w: 558, h: 965},
  BUILDING_RIGHT: {x:549, y:158,w: 549, h: 740},

  PLAYER_KICK_LEFT:       { x:  179, y:  0, w:   34,h:  50 },
  PLAYER_KICK_RIGHT:      { x:  213, y:  0, w:   34,h:  50 },
  PLAYER_LEFT:            { x:  27 , y:  0, w:   25,h:  50 },
  PLAYER_STRAIGHT:        { x:  0  , y:  0, w:   21,h:  50 },
  PLAYER_RIGHT:           { x:  58 , y:  0, w:   25,h:  50 }
};

SPRITES.SCALE = 0.1 * (1/SPRITES.PLAYER_STRAIGHT.w) //scaling the images

SPRITES.CARS       = [SPRITES.CAR01, SPRITES.CAR02];
SPRITES.BIKES      = [SPRITES.BIKE01, SPRITES.BIKE02, SPRITES.BIKE03];
SPRITES.SHIPS      = [SPRITES.BOAT01,SPRITES.BOAT02,SPRITES.BOAT03];
SPRITES.BUILDINGS  = [SPRITES.BUILDING_LEFT,SPRITES.BUILDING_RIGHT];


var getOn = {
  get:  function(id){
    return ((id instanceof HTMLElement) || (id === document)) ? id : document.getElementById(id);
  },
  on:   function(ele, type, fn, capture) {
    getOn.get(ele).addEventListener(type, fn, capture);
  },
}

  var canvas        = getOn.get('canvas');
  var ctx           = canvas.getContext('2d');

  // var degrees = 0;
  // var new_degrees = 0;
  // var difference = 0;
  var color ;
  var bgcolor = "#222";
  var text;
