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
var totalBikes = 50;

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
var keyC  = false;

var initialCD = false;



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
  LIGHT:  { road: '#696969', grass: '#10AA10', rumble: 'white', lane: 'white'},
  DARK:   { road: '#696969', grass: '#10AA10', rumble: 'grey'                   },
  START:  { road: 'white',   grass: 'white',   rumble: 'white'                 },
  FINISH: { road: 'black',   grass: 'black',   rumble: 'red'                 }
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


  // BIKE01: { x:  0  , y:  0, w:   21,h:  50 },
  // BIKE02: { x:  0  , y:  0, w:   21,h:  50 },
  // BIKE03:{ x:  0  , y:  0, w:   21,h:  50 },


  // BAR01:  {x: 260,y:  70,w:  86,h: 70},
  // BAR02:  {x: 96,y:  65,w: 83,h: 75},

  CAR01:  {x: 260,y:  0,w:  86,h: 70},
  CAR02:  {x: 179,y:  65,w: 82,h: 75},

  PLAYER_KICK_LEFT:       { x:  179, y:  0, w:   34,h:  50 },
  PLAYER_KICK_RIGHT:      { x:  213, y:  0, w:   34,h:  50 },
  PLAYER_UPHILL_LEFT:     { x:  27 , y:  0, w:   25,h:  50 },
  PLAYER_UPHILL_STRAIGHT: { x:  0  , y:  0, w:   21,h:  50 },
  PLAYER_UPHILL_RIGHT:    { x:  58 , y:  0, w:   25,h:  50 },
  PLAYER_LEFT:            { x:  27 , y:  0, w:   25,h:  50 },
  PLAYER_STRAIGHT:        { x:  0  , y:  0, w:   21,h:  50 },
  PLAYER_RIGHT:           { x:  58 , y:  0, w:   25,h:  50 }
};

SPRITES.SCALE = 0.1 * (1/SPRITES.PLAYER_STRAIGHT.w) //scaling the bike sprite

SPRITES.CARS       = [SPRITES.CAR01, SPRITES.CAR02];
SPRITES.BIKES      = [SPRITES.BIKE01, SPRITES.BIKE02, SPRITES.BIKE03];

// const NO_OF_ENEMIES = 5;
// const ENEMY_ACCELERATION_FACTOR = 80;
// const ENEMY_COLLISION_SPEED_DECREASE_FACTOR = 1.4;
// const ENEMY_IMAGES = [ 
  
//   {
//     BIKE:{x: 111,y:0,w:21,h:50}
//   },
//   {
//     BIKE:{x:132,y:0,w:23,h:50}
//   },
//   {
//     BIKE:{x:155,y:0,w:24,h:50}
//   }
// ];











var Dom = {

  get:  function(id)                     { return ((id instanceof HTMLElement) || (id === document)) ? id : document.getElementById(id); },
  set:  function(id, html)               { Dom.get(id).innerHTML = html;                        },
  on:   function(ele, type, fn, capture) { Dom.get(ele).addEventListener(type, fn, capture);    },
  un:   function(ele, type, fn, capture) { Dom.get(ele).removeEventListener(type, fn, capture); },
  show: function(ele, type)              { Dom.get(ele).style.display = (type || 'block');      },
  blur: function(ev)                     { ev.target.blur();                                    },

  addClassName:    function(ele, name)     { Dom.toggleClassName(ele, name, true);  },
  removeClassName: function(ele, name)     { Dom.toggleClassName(ele, name, false); },
  toggleClassName: function(ele, name, on) {
    ele = Dom.get(ele);
    var classes = ele.className.split(' ');
    var n = classes.indexOf(name);
    on = (typeof on == 'undefined') ? (n < 0) : on;
    if (on && (n < 0))
      classes.push(name);
    else if (!on && (n >= 0))
      classes.splice(n, 1);
    ele.className = classes.join(' ');
  },

  storage: window.localStorage || {}

}

var canvas        = Dom.get('canvas');
var ctx           = canvas.getContext('2d');




// const ENEMY_WIDTH_MULTIPLIER = 13;
// const ENEMY_Z_WIDTH = 200;

// const NO_OF_ENEMIES = 3;
// const ENEMY_ACCELERATION_FACTOR = 80;
// const ENEMY_COLLISION_SPEED_DECREASE_FACTOR = 1.4;
// const ENEMY_IMAGES = [
//   {x: 111,y:0,w:21,h:50},
//   {x:132,y:0,w:23,h:50},
//   {x:155,y:0,w:24,h:50},
// ];