const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const scoreElement = document.querySelector("#score");
const livesElement = document.querySelector("#lives");
const restartButton = document.querySelector("#restart");

const player = {
  x: 80,
  y: 190,
  size: 52,
  speed: 4,
  color: "#050505",
};

const star = {
  x: 420,
  y: 180,
  size: 24,
};

const enemy = {
  x: 300,
  y: 80,
  size: 40,
  speedX: 2.5,
  speedY: 2,
};

const keys = {};
let score = 0;
let lives = 3;
let gameWon = false;
let winTime = 0;

window.addEventListener("keydown", (event) => {
  keys[event.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;
});

restartButton.addEventListener("click", () => {
  resetGame();
});

function movePlayer() {
  if (keys.arrowleft || keys.a) player.x -= player.speed;
  if (keys.arrowright || keys.d) player.x += player.speed;
  if (keys.arrowup || keys.w) player.y -= player.speed;
  if (keys.arrowdown || keys.s) player.y += player.speed;

  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));
}

function moveEnemy() {
  enemy.x += enemy.speedX;
  enemy.y += enemy.speedY;

  if (enemy.x <= 0 || enemy.x + enemy.size >= canvas.width) {
    enemy.speedX *= -1;
  }

  if (enemy.y <= 0 || enemy.y + enemy.size >= canvas.height) {
    enemy.speedY *= -1;
  }
}

function touchesBox(box) {
  return (
    player.x < box.x + box.size &&
    player.x + player.size > box.x &&
    player.y < box.y + box.size &&
    player.y + player.size > box.y
  );
}

function touchesStar() {
  return touchesBox(star);
}

function moveStar() {
  star.x = Math.random() * (canvas.width - star.size);
  star.y = Math.random() * (canvas.height - star.size);
}

function resetGame() {
  score = 0;
  lives = 3;
  gameWon = false;
  winTime = 0;
  scoreElement.textContent = score;
  livesElement.textContent = lives;
  player.x = 80;
  player.y = 190;
  enemy.x = 300;
  enemy.y = 80;
  enemy.speedX = 2.5;
  enemy.speedY = 2;
  moveStar();
}

function resetAfterHit() {
  player.x = 80;
  player.y = 190;
  enemy.x = 300;
  enemy.y = 80;
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x + 10, player.y + 16, 25, 17);
  ctx.fillRect(player.x + 30, player.y + 10, 18, 16);
  ctx.fillRect(player.x + 12, player.y + 31, 6, 11);
  ctx.fillRect(player.x + 28, player.y + 31, 6, 11);
  ctx.fillRect(player.x + 4, player.y + 18, 10, 5);
  ctx.fillRect(player.x + 26, player.y + 4, 7, 10);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(player.x + 39, player.y + 14, 4, 4);

  ctx.fillStyle = "#ff8ca8";
  ctx.fillRect(player.x + 46, player.y + 21, 5, 4);
}

function playFireworkSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  const audioContext = new AudioContextClass();
  const startTime = audioContext.currentTime;

  for (let i = 0; i < 6; i++) {
    const oscillator = audioContext.createOscillator();
    const volume = audioContext.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(220 + i * 120, startTime + i * 0.08);
    volume.gain.setValueAtTime(0.18, startTime + i * 0.08);
    volume.gain.exponentialRampToValueAtTime(0.01, startTime + i * 0.08 + 0.35);
    oscillator.connect(volume);
    volume.connect(audioContext.destination);
    oscillator.start(startTime + i * 0.08);
    oscillator.stop(startTime + i * 0.08 + 0.35);
  }
}

function drawWinMessage() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 58px Arial";
  ctx.textAlign = "center";
  ctx.fillText("DU KLARADE DET!", canvas.width / 2, canvas.height / 2);
  ctx.textAlign = "start";
}

function drawFireworks() {
  const colors = ["#ffd84d", "#ff5c8a", "#7cf7ff", "#9cff6b"];

  for (let burst = 0; burst < 4; burst++) {
    const centerX = 150 + burst * 140;
    const centerY = 90 + (burst % 2) * 65;

    for (let spark = 0; spark < 12; spark++) {
      const angle = (Math.PI * 2 * spark) / 12 + winTime * 0.03;
      const distance = 22 + Math.sin(winTime * 0.08 + spark) * 10;
      ctx.fillStyle = colors[(burst + spark) % colors.length];
      ctx.beginPath();
      ctx.arc(
        centerX + Math.cos(angle) * distance,
        centerY + Math.sin(angle) * distance,
        4,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }
}

function drawStar() {
  ctx.fillStyle = "#ffd84d";
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? star.size / 2 : star.size / 5;
    const x = star.x + star.size / 2 + Math.cos(angle) * radius;
    const y = star.y + star.size / 2 + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawEnemy() {
  ctx.fillStyle = "#ff3b1f";
  ctx.beginPath();
  ctx.moveTo(enemy.x + 6, enemy.y + 21);
  ctx.lineTo(enemy.x + 1, enemy.y + 9);
  ctx.lineTo(enemy.x + 12, enemy.y + 14);
  ctx.lineTo(enemy.x + 17, enemy.y + 1);
  ctx.lineTo(enemy.x + 25, enemy.y + 14);
  ctx.lineTo(enemy.x + 36, enemy.y + 8);
  ctx.lineTo(enemy.x + 31, enemy.y + 21);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ff7a1a";
  ctx.beginPath();
  ctx.arc(
    enemy.x + enemy.size / 2,
    enemy.y + enemy.size / 2 + 2,
    enemy.size / 2 - 3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.fillStyle = "#ffd84d";
  ctx.beginPath();
  ctx.arc(
    enemy.x + enemy.size / 2,
    enemy.y + enemy.size / 2 + 4,
    enemy.size / 4,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStar();
  drawEnemy();
  drawPlayer();

  if (gameWon) {
    drawFireworks();
    drawWinMessage();
  }
}

function update() {
  if (!gameWon) {
    movePlayer();
    moveEnemy();

    if (touchesStar()) {
      score += 1;
      scoreElement.textContent = score;
      moveStar();

      if (score === 10) {
        gameWon = true;
        playFireworkSound();
      }
    }

    if (touchesBox(enemy)) {
      lives -= 1;
      livesElement.textContent = lives;

      if (lives <= 0) {
        resetGame();
      } else {
        resetAfterHit();
      }
    }
  } else {
    winTime += 1;
  }

  draw();
  requestAnimationFrame(update);
}

update();
