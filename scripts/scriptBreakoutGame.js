const canvas = document.getElementById("breakout");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 500;
document.body.appendChild(canvas);

// add border to canvas
canvas.style.border = "5px solid #000";

// make line thik when drawing to canvas
ctx.lineWidth = 7;	

// game variables and constans
const PADDLE_WIDTH = 100;
const PADDLE_MARGIN_BOTTOM = 50;
const PADDLE_HEIGHT = 20;
const BALL_RADIUS = 8;
let LIFE = 5; // player has x lives
let SCORE = 0;
const SCORE_UNIT = 10;
let LEVEL = 1;
const MAX_LEVEL = 7;	
let GAME_OVER = false;
let leftArrow = false;
let rightArrow = false;

// create paddle
const paddle = {
    x : canvas.width/2 - PADDLE_WIDTH/2,
    y : canvas.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT,
    width : PADDLE_WIDTH,
    height : PADDLE_HEIGHT,
    dx :5
}

// draw paddle
function drawPaddle(){
    ctx.fillStyle = "#2e3548";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
}

// control paddle
document.addEventListener("keydown", function(event){
   if(event.keyCode == 37){
       leftArrow = true;
   }else if(event.keyCode == 39){
       rightArrow = true;
   }
});
document.addEventListener("keyup", function(event){
   if(event.keyCode == 37){
       leftArrow = false;
   }else if(event.keyCode == 39){
       rightArrow = false;
   }
});

// move paddle
function movePaddle(){
    if(rightArrow && paddle.x + paddle.width < canvas.width){
        paddle.x += paddle.dx;
    }else if(leftArrow && paddle.x > 0){
        paddle.x -= paddle.dx;
    }
}

// create the ball
const ball = {
    x : canvas.width/2,
    y : paddle.y - BALL_RADIUS,
    radius : BALL_RADIUS,
    speed : 4,
    dx : 3 * (Math.random() * 2 - 1),
    dy : -3
}

// draw the ball
function drawBall(){
    ctx.beginPath();
    
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = "#fff";
    ctx.fill();
	
//  ctx.strokeStyle = "#2e3548";
//  ctx.stroke();	
    
    ctx.closePath();
}

// move the ball
function moveBall(){
    ball.x += ball.dx;
    ball.y += ball.dy;
}

// ball and wall collision detection
function ballWallCollision(){
    if(ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0){
        ball.dx = - ball.dx;
        WALL_HIT.play();
    }
    
    if(ball.y - ball.radius < 0){
        ball.dy = -ball.dy;
        WALL_HIT.play();
    }
    
    if(ball.y + ball.radius > canvas.height){
        LIFE--; // lose life
        LIFE_LOST.play();
        resetBall();
    }
}

// reset the ball
function resetBall(){
    ball.x = canvas.width/2;
    ball.y = paddle.y - BALL_RADIUS;
    ball.dx = 3 * (Math.random() * 2 - 1);
    ball.dy = -3;
}

// ball and paddle collision
function ballPaddleCollision(){
    if(ball.x < paddle.x + paddle.width && ball.x > paddle.x && paddle.y < paddle.y + paddle.height && ball.y > paddle.y){
        
        // play sound
        PADDLE_HIT.play();
        
        // check where the ball hit the paddle
        let collidePoint = ball.x - (paddle.x + paddle.width/2);
        
        // normalize the values
        collidePoint = collidePoint / (paddle.width/2);
        
        // calculate the angle of the ball
        let angle = collidePoint * Math.PI/3;
            
            
        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = - ball.speed * Math.cos(angle);
    }
}

// create bricks
const brick = {
    row : 1,
    column : 5,
    width : 55,
    height : 20,
    offSetLeft : 20,
    offSetTop : 20,
    marginTop : 40,
    fillColor : "#73767d",
//  strokeColor : "#fff"
}

let bricks = [];

function createBricks(){
    for(let r = 0; r < brick.row; r++){
        bricks[r] = [];
        for(let c = 0; c < brick.column; c++){
            bricks[r][c] = {
                x : c * ( brick.offSetLeft + brick.width ) + brick.offSetLeft,
                y : r * ( brick.offSetTop + brick.height ) + brick.offSetTop + brick.marginTop,
                status : true
            }
        }
    }
}

createBricks();

// draw the bricks
function drawBricks(){
    for(let r = 0; r < brick.row; r++){
        for(let c = 0; c < brick.column; c++){
            let b = bricks[r][c];
            // if the brick isn't broken
            if(b.status){
                ctx.fillStyle = brick.fillColor;
                ctx.fillRect(b.x, b.y, brick.width, brick.height);
                
//              ctx.strokeStyle = brick.strokeColor;
//              ctx.strokeRect(b.x, b.y, brick.width, brick.height);
            }
        }
    }
}

// ball brick collision
function ballBrickCollision(){
    for(let r = 0; r < brick.row; r++){
        for(let c = 0; c < brick.column; c++){
            let b = bricks[r][c];
            // if the brick isn't broken
            if(b.status){
                if(ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + brick.width && ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + brick.height){
                    BRICK_HIT.play();
                    ball.dy = - ball.dy;
                    b.status = false; // the brick is broken
                    SCORE += SCORE_UNIT;
                }
            }
        }
    }
}

// show game stats
function showGameStats(text, textX, textY, img, imgX, imgY){
    // draw text
    ctx.fillStyle = "#FFF";
    ctx.font = "25px Consolas";
    ctx.fillText(text, textX, textY);
    
    // draw image
    ctx.drawImage(img, imgX, imgY, width = 25, height = 25);
}

// draw function
function draw(){
    drawPaddle();
    
    drawBall();
    
    drawBricks();
    
    // display score
    showGameStats(SCORE, 35, 25, SCORE_IMG, 5, 5);
    // display lives
    showGameStats(LIFE, canvas.width - 25, 25, LIFE_IMG, canvas.width-55, 5); 
    // display level
    showGameStats(LEVEL, canvas.width/2, 25, LEVEL_IMG, canvas.width/2 - 30, 5);
}

// game over
function gameOver(){
    if(LIFE <= 0){
        showYouLose();
        GAME_OVER = true;
    }
}

// level up
function levelUp(){
    let isLevelDone = true;
    
    // check if all the bricks are broken
    for(let r = 0; r < brick.row; r++){
        for(let c = 0; c < brick.column; c++){
            isLevelDone = isLevelDone && ! bricks[r][c].status;
        }
    }
    
    if(isLevelDone){
        WIN.play();
        
        if(LEVEL >= MAX_LEVEL){
            showYouWin();
            GAME_OVER = true;
            return;
        }
        brick.row++;
        createBricks();
        ball.speed += 0.5;
        resetBall();
        LEVEL++;
    }
}

// update game function
function update(){
    movePaddle();
    
    moveBall();
    
    ballWallCollision();
    
    ballPaddleCollision();
    
    ballBrickCollision();
    
    gameOver();
    
    levelUp();
}

// game loop
function loop(){
    // clear the canvas
    ctx.drawImage(BG_IMG, 0, 0);
    
    draw();
    
    update();
    
    if(! GAME_OVER){
        requestAnimationFrame(loop);
    }
}
loop();


// select element sounds
const soundElement  = document.getElementById("sound");

soundElement.addEventListener("click", audioManager);

function audioManager(){
    // change image sound_on/off
    let imgSrc = soundElement.getAttribute("src");
    let SOUND_IMG = imgSrc == "images/SOUND_ON.png" ? "images/SOUND_OFF.png" : "images/SOUND_ON.png";
    
    soundElement.setAttribute("src", SOUND_IMG);
    
    // mute unmute sounds
    WALL_HIT.muted = WALL_HIT.muted ? false : true;
    PADDLE_HIT.muted = PADDLE_HIT.muted ? false : true;
    BRICK_HIT.muted = BRICK_HIT.muted ? false : true;
    WIN.muted = WIN.muted ? false : true;
    LIFE_LOST.muted = LIFE_LOST.muted ? false : true;
}

// show game over message
const gameover = document.getElementById("gameover");
const youwin = document.getElementById("youwin");
const youlose = document.getElementById("youlose");
const restart = document.getElementById("restart");

// click on play again button
restart.addEventListener("click", function(){
    location.reload(); // reload the page
})

// display win
function showYouWin(){
    gameover.style.display = "block";
    youwon.style.display = "block";
}

// display lose
function showYouLose(){
    gameover.style.display = "block";
    youlose.style.display = "block";
}


// buttons touchscreen
function moveleft() {
	leftArrow = 1;
}

function moveright() {
	rightArrow = 1;
}

function clearmove() {
	leftArrow = 0;
	rightArrow = 0;
}

