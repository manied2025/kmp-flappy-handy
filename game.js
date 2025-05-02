
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");
const gameOverScreen = document.getElementById("game-over-screen");
const scoreDisplay = document.getElementById("score");
const highscoreDisplay = document.getElementById("highscore");
const restartButton = document.getElementById("restart-button");

let gameStarted = false;
let gameOver = false;
let score = 0;
let highscore = 0;

const gravity = 0.25;
const jumpStrength = -8; // constant pixel jump
let velocity = 0;
let phoneY = canvas.height / 2;

const phoneImage = new Image();
phoneImage.src = "images/handy.png";

let pipes = [];
const pipeWidth = 70;
const pipeGap = 160;
let pipeSpeed = 2.2;
let pipeInterval = 90;
let frameCount = 0;

let clouds = [
  { x: 100, y: 100 },
  { x: 300, y: 150 }
];

function drawPhone() {
  ctx.drawImage(phoneImage, 100, phoneY, 60, 60);
}

function drawClouds() {
  ctx.fillStyle = "#ffffff";
  clouds.forEach(cloud => {
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, 20, 0, Math.PI * 2);
    ctx.arc(cloud.x + 20, cloud.y - 10, 25, 0, Math.PI * 2);
    ctx.arc(cloud.x + 40, cloud.y, 20, 0, Math.PI * 2);
    ctx.fill();
    cloud.x -= 0.3;
    if (cloud.x + 60 < 0) cloud.x = canvas.width + 50;
  });
}

function drawPipes() {
  pipes.forEach(pipe => {
    let grd = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
    grd.addColorStop(0, "#81C784");
    grd.addColorStop(1, "#388E3C");
    ctx.fillStyle = grd;
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 10;
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.fillRect(pipe.x, pipe.top + pipeGap, pipeWidth, canvas.height);
    ctx.shadowBlur = 0;
  });
}

function updatePipes() {
  if (frameCount % pipeInterval === 0) {
    const top = Math.floor(Math.random() * (canvas.height - pipeGap - 200)) + 100;
    pipes.push({ x: canvas.width, top: top, passed: false });
  }
  pipes.forEach(pipe => {
    pipe.x -= pipeSpeed;
    if (!pipe.passed && pipe.x + pipeWidth < 100) {
      score++;
      pipe.passed = true;
      if (score % 10 === 0) pipeSpeed += 0.3;
    }
  });
  pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
}

function checkCollision() {
  for (let pipe of pipes) {
    if (
      100 < pipe.x + pipeWidth &&
      100 + 60 > pipe.x &&
      (phoneY < pipe.top || phoneY + 60 > pipe.top + pipeGap)
    ) {
      return true;
    }
  }
  return false;
}

canvas.addEventListener("touchstart", jump);
canvas.addEventListener("mousedown", jump);

function jump() {
  if (!gameStarted) return;
  velocity = jumpStrength;
}

startButton.addEventListener("click", () => {
  startScreen.classList.remove("active");
  gameOverScreen.classList.remove("active");
  gameStarted = true;
  resetGame();
  gameLoop();
});

restartButton.addEventListener("click", () => {
  gameOverScreen.classList.remove("active");
  gameStarted = true;
  resetGame();
  gameLoop();
});

function resetGame() {
  phoneY = canvas.height / 2;
  velocity = 0;
  score = 0;
  frameCount = 0;
  pipes = [];
  pipeSpeed = 2.2;
  gameOver = false;
}

function gameLoop() {
  if (!gameStarted || gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#b3e5fc";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawClouds();
  velocity += gravity;
  phoneY += velocity;
  drawPhone();

  updatePipes();
  drawPipes();

  ctx.fillStyle = "black";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, 10, 30);

  if (checkCollision() || phoneY > canvas.height || phoneY < 0) {
    endGame();
    return;
  }

  frameCount++;
  requestAnimationFrame(gameLoop);
}

function endGame() {
  gameOver = true;
  gameStarted = false;
  gameOverScreen.classList.add("active");
  scoreDisplay.textContent = score;
  if (score > highscore) highscore = score;
  highscoreDisplay.textContent = highscore;
}

startScreen.classList.add("active");
