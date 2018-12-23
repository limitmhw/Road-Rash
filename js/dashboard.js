function speedoMeter(sp){


  ctx.beginPath();
  ctx.strokeStyle = bgcolor;
  ctx.lineWidth = 30;
  ctx.arc(130, 130, 100, -Math.PI, 0, false);
  ctx.stroke();


  var cp =5 * Math.round(sp/500);

 if(cp <100)
    color = "green";
  else
    color = "red";


  var radians = cp * Math.PI / 180  * 1.5;
  radians -= Math.PI;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 30;
  ctx.arc(130, 130, 100, -Math.PI ,radians  , false);
  ctx.stroke();



  //text part
  ctx.fillStyle = color;
  // ctx.font = "50px bariol_regular";
  ctx.font = "50px PerfectDark";
  text_width = ctx.measureText(cp).width;
  ctx.fillText(cp, 130 - text_width/2, 125);

  ctx.fillStyle = "black";
  ctx.font = "30px bariol_regular";
  text_width = ctx.measureText("MPH").width;
  ctx.fillText("MPH",130 - text_width/2,75);
}


function displayCountdown(c){

  ctx.fillStyle = "black";
  ctx.font = "80px PerfectDark";
  text_width= ctx.measureText(c).width;
  ctx.fillText(c,1280/2 - text_width,300,500);

}


function displayRank(a,b){
  // console.log(a+"/"+b);
ctx.fillStyle = "orange";
ctx.font = "80px PerfectDark";

ctx.fillText(a+"/"+b,width/2-80,145);
}
