//mathematical calculations

var AllFn = {

  timestamp:        function()                  { return new Date().getTime();                                    },
  toInt:            function(obj, def)          {
    if (obj !== null) {
     var x = parseInt(obj, 10);
     if (!isNaN(x))
      return x;
    }
      return AllFn.toInt(def, 0); },

  //to limit values
  limit:            function(value, min, max)   { return Math.max(min, Math.min(value, max));                     },
  randomInt:        function(min, max)          { return Math.round(AllFn.interpolate(min, max, Math.random()));   },
  randomChoice:     function(options)           { return options[AllFn.randomInt(0, options.length-1)];            },

  percentRemaining: function(n, total)          { return (n%total)/total;                                         },

  //acceleration
  accelerate:       function(v, accel, dt)      { return v + (accel * dt);                                        },

  //for smooth transition in curves
  interpolate:      function(a,b,percent)       { return a + (b-a)*percent                                        },
  transIn:           function(a,b,percent)       { return a + (b-a)*Math.pow(percent,2);                           },
  transInOut:        function(a,b,percent)       { return a + (b-a)*((-Math.cos(percent*Math.PI)/2) + 0.5);        },

  increase:  function(start, increment, max) {
    var result = start + increment;
    while (result >= max)
      result -= max;
    while (result < 0)
      result += max;
    return result;
  },

  //projection
  project: function(p, cameraX, cameraY, cameraZ, cameraDepth, width, height, roadWidth) {
    p.camera.x     = (p.world.x || 0) - cameraX;
    p.camera.y     = (p.world.y || 0) - cameraY;
    p.camera.z     = (p.world.z || 0) - cameraZ;
    p.screen.scale = cameraDepth/p.camera.z;
    p.screen.x     = Math.round((width/2)  + (p.screen.scale * p.camera.x  * width/2));
    p.screen.y     = Math.round((height/2) - (p.screen.scale * p.camera.y  * height/2));
    p.screen.w     = Math.round(             (p.screen.scale * roadWidth   * width/2));
  },

//for collision avoidance
  overlap: function(x1, w1, x2, w2, percent) {
    var half = (percent || 1)/2;
    var min1 = x1 - (w1*half);
    var max1 = x1 + (w1*half);
    var min2 = x2 - (w2*half);
    var max2 = x2 + (w2*half);
    return ! ((max1 < min2) || (min1 > max2));
  }

}
