//game start/loop

var Game = {



  run: function(options) {

    Game.loadImages(options.images, function(images) {

      options.ready(images);

      Game.setKeyListener(options.keys);

      var canvas = options.canvas,
          update = options.update,
          render = options.render,
          step   = options.step,
          now    = null,
          last   = AllFn.timestamp(),
          dt     = 0,
          gdt    = 0;

// console.log(last);
      function frame() {
        now = AllFn.timestamp();

        if(gameStart){



          dt  = Math.min(1, (now - last) / 1000);
          gdt = gdt + dt;
          while (gdt > step) {
            gdt = gdt - step;
            update(step);
          }
          render();
          last = now;
          if(speed == 0 && crossFinish){
            ctx.fillStyle = "black";
            ctx.font = "80px PerfectDark";
            text_width= ctx.measureText("GAME OVER!").width;
            ctx.fillText("GAME OVER!",1280/2 - text_width,320);
            // speed=AllFn.accelerate(speed,breaking,dt);
          }
        }
        else{

          if(now - last >= 1000){
            render();
            if(countdown == 0){
              displayCountdown("GO!");
              gameStart = true;
            }
            else  {
              displayCountdown(countdown);
              countdown--;

            }
            last = now;
          }
        }
        requestAnimationFrame(frame, canvas);
      }
      frame();
      });
  },

  loadImages: function(names, callback) {
    var result = [];
    var count  = names.length;

    var onload = function() {
      if (--count == 0)
        callback(result);
    };

    for(var n = 0 ; n < names.length ; n++) {
      var name = names[n];
      result[n] = document.createElement('img');
      getOn.on(result[n], 'load', onload);
      result[n].src = "images/" + name + ".png";
    }
  },

  //---------------------------------------------------------------------------

  setKeyListener: function(keys) {
    var onkey = function(keyCode, mode) {
      var n, k;
      for(n = 0 ; n < keys.length ; n++) {
        k = keys[n];
        k.mode = k.mode || 'up';
        if ((k.key == keyCode) || (k.keys && (k.keys.indexOf(keyCode) >= 0))) {
          if (k.mode == mode) {
            k.action.call();
          }
        }
      }
    };

    getOn.on(document, 'keydown', function(ev) { onkey(ev.keyCode, 'down'); } );
    getOn.on(document, 'keyup',   function(ev) { onkey(ev.keyCode, 'up');   } );
  },

}
