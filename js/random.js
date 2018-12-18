for(i = 0 ; i < segment.bikes.length ; i++) {
  bike        = segment.bikes[i];
  sprite      = bike.sprite;
  spriteScale = Util.interpolate(segment.p1.screen.scale, segment.p2.screen.scale, bike.percent);
  spriteX     = Util.interpolate(segment.p1.screen.x,     segment.p2.screen.x,     bike.percent) + (spriteScale * bike.offset * roadWidth * width/2);
  spriteY     = Util.interpolate(segment.p1.screen.y,     segment.p2.screen.y,     bike.percent);
  Render.sprite(ctx, width, height, resolution, roadWidth, sprites, bike.sprite, spriteScale, spriteX, spriteY, -0.5, -1, segment.clip);
}