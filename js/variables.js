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
var drawDistance  = 300;
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
