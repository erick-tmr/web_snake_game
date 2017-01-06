var game = {
  playing: false,
  score: 0,
  playableArea: {
    minX: 0,
    minY: 0,
    maxX: 53,
    maxY: 29
  },
  directions: {
    left: 0,
    up: 1,
    right: 2,
    down: 3
  },
  ended: false,
  control: 2,
  mainLoop: function() {
    if(game.playing){
      game.clear();
      dot.init();
      snake.draw();
      dot.draw();
      game.drawScore();
      game.detectInput();
      snake.ignoreImpossibleDirection();
      snake.move();
      snake.checkCollision();
      snake.checkDot();
    }
    else{
      if(game.ended){
        game.drawGameOver();
        game.reset();
      }
      game.drawStartMessage();
    }
    setTimeout(function() {
      requestAnimationFrame(game.mainLoop);
    },1000 / snake.speed);
  },
  mapValuesToMargin: function(pos) {
    marginX = pos[0]*20;
    marginY = pos[1]*20;
    return [marginX, marginY];
  },
  start: function(){
    game.playing = true;  
  },
  detectArrow: function(event){
    switch(event.keyCode){
      case 37:
        return game.directions.left;
        break;
      case 38:
        return game.directions.up;
        break;
      case 39:
        return game.directions.right;
        break;
      case 40:
        return game.directions.down;
        break;
    }
    return game.directions.right;
  },
  detectSpace: function(event) {
    if(event.keyCode == 32){
      return true;
    }
    return false;
  },
  endGame: function() {
    game.playing = false;
    game.ended = true;
  },
  clear: function() {
    $("div").remove();
  },
  drawScore: function(){
    var divElement = `<div class='score'>Score: ${game.score}</div>`;
    $("body").append(divElement);
  },
  drawStartMessage: function(){
    var divElement = `<div class='start'>Press Space to start the game!</div>`;
    $("body").append(divElement);
  },
  drawGameOver: function(){
    var divElement = `<div class='game-over'>You Lose, if you want to play again,</div>`;
    $("body").append(divElement);
  },
  detectInput: function(){
    snake.body[0].lastMoved = snake.body[0].moving;
    snake.body[0].moving = game.control;
  },
  reset: function(){
    snake.body = [{ x: 2, y: 0, moving: game.directions.right, lastMoved: game.directions.right}, { x: 1, y: 0}, { x: 0, y: 0}];
    snake.speed = 8;
    game.score = 0;
    dot.create();
  }
};

var snake = {
  body: [{ x: 2, y: 0, moving: game.directions.right, lastMoved: game.directions.right}, { x: 1, y: 0}, { x: 0, y: 0}],
  speed: 8,
  move: function(){
    var temp = [];
    for(i=0; i < snake.body.length; i++){
      temp.push([snake.body[i].x, snake.body[i].y]);
    }
    for(i=1; i < snake.body.length; i++){
      snake.body[i].x = temp[i-1][0];
      snake.body[i].y = temp[i-1][1];
    }
    switch(snake.body[0].moving){
      case game.directions.left:
        snake.body[0].x -= 1;
        break;
      case game.directions.up:
        snake.body[0].y -= 1;
        break;
      case game.directions.right:
        snake.body[0].x += 1;
        break;
      case game.directions.down:
        snake.body[0].y += 1;
        break;
    }
  },
  draw: function(){
    var realPos = [];
    for (i = 0; i < snake.body.length; i++) {
      realPos.push(game.mapValuesToMargin([snake.body[i].x, snake.body[i].y]));
      var divElement = `<div class='snake-active' id='snake-part-${i}' style='margin-left: ${realPos[i][0]}px; margin-top: ${realPos[i][1]}px;'></div>`;
      $("body").append(divElement);
    }
  },
  checkCollision: function() {
    var collidedWithWall = snake.body[0].x < game.playableArea.minX || snake.body[0].x > game.playableArea.maxX || snake.body[0].y < game.playableArea.minY || snake.body[0].y > game.playableArea.maxY;
    var collidedWithBody = false;
    for(i = 1; i < snake.body.length; i++){
      if(snake.body[0].x == snake.body[i].x && snake.body[0].y == snake.body[i].y){
        collidedWithBody = true;
        break;
      }
    }
    if(collidedWithWall || collidedWithBody) {
      game.endGame();
    }
  },
  ignoreImpossibleDirection: function() {
    var inverseDirection = false;
    switch(snake.body[0].moving){
      case game.directions.left:
        if(snake.body[0].lastMoved == game.directions.right){
          inverseDirection = true;
        }
        break;
      case game.directions.up:
        if(snake.body[0].lastMoved == game.directions.down){
          inverseDirection = true;
        }
        break;
      case game.directions.right:
        if(snake.body[0].lastMoved == game.directions.left){
          inverseDirection = true;
        }
        break;
      case game.directions.down:
        if(snake.body[0].lastMoved == game.directions.up){
          inverseDirection = true;
        }
        break;
    }
    if(inverseDirection){
      snake.body[0].moving = snake.body[0].lastMoved;
    }
  },
  checkDot: function() {
    if(snake.body[0].x == dot.pos[0] && snake.body[0].y == dot.pos[1]){
      game.score += 1;
      snake.grow();
      dot.create();
    }
  },
  grow: function() {
    snake.body.push({
      x: snake.body[snake.body.length - 1].x,
      y: snake.body[snake.body.length - 1].y
    });
    if(snake.speed <= 25){
      snake.speed += 0.5; 
    }
  }
};

var dot = {
  pos: [0,0],
  initiated: false,
  init: function() {
    if(!dot.initiated){
      dot.create();
      dot.initiated = true;
    }
  },
  create: function() {
    randomX = Math.floor(Math.random() * game.playableArea.maxX);
    randomY = Math.floor(Math.random() * game.playableArea.maxY);
    while(dot.checkSnakeBody(randomX, randomY)){
      randomX = Math.floor(Math.random() * game.playableArea.maxX);
      randomY = Math.floor(Math.random() * game.playableArea.maxY);
    }
    dot.pos = [randomX, randomY];
  },
  draw: function(){
    var realPos = game.mapValuesToMargin(dot.pos);
    var divElement = `<div class='dot-active' style='margin-left: ${realPos[0]}px; margin-top: ${realPos[1]}px;'></div>`;
    $("body").append(divElement);
  },
  checkSnakeBody: function(posX, posY) {
    var onSnake = false;
    for(i=0; i < snake.body.length; i++){
      if(snake.body[i].x == posX && snake.body[i].y == posY){
        onSnake = true;
        break;
      }
    }
    return onSnake;
  }
};

$(document).ready(function() {
  $(document).keydown(function(event) {
    if (event.which == 13) {
      event.preventDefault();
    }
    game.control = game.detectArrow(event);
    var start = game.detectSpace(event);
    if(game.playing == false && start){
      game.start();
    }
  });
  
  requestAnimationFrame(game.mainLoop);
});