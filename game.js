const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 12;
const WINNING_SCORE = 5;
const PLAYER_X = 20;
const AI_X = canvas.width - PADDLE_WIDTH - 20;

// Game objects
let playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let aiY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 5 * (Math.random() < 0.5 ? 1 : -1);
let ballSpeedY = (Math.random() * 4 - 2);
let playerScore = 0;
let aiScore = 0;
let gameOver = false;

// Screen shake
let shakeDuration = 0;
let shakeIntensity = 5;

function triggerShake(duration, intensity) {
    shakeDuration = duration;
    shakeIntensity = intensity;
}

// Particles
let particles = [];
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 4 + 2;
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 4 - 2;
        this.life = 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 0.05;
    }

    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function createParticles(x, y, color) {
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// Sound effects
const hitSound = new Audio('https://kenney.nl/media/pages/assets/digital-audio/cd01f555fb-1677590265/kenney_digital-audio/phaserUp6.wav');
const scoreSound = new Audio('https://kenney.nl/media/pages/assets/digital-audio/cd01f555fb-1677590265/kenney_digital-audio/powerUp1.wav');
const wallSound = new Audio('https://kenney.nl/media/pages/assets/digital-audio/cd01f555fb-1677590265/kenney_digital-audio/phaserUp1.wav');

function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
}

// Mouse control for left paddle
canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    playerY = e.clientY - rect.top - PADDLE_HEIGHT / 2;
    playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
});

canvas.addEventListener('click', function() {
    if (gameOver) {
        resetGame();
    }
});

// Draw everything
function draw() {
    // Screen shake
    if (shakeDuration > 0) {
        ctx.save();
        const dx = (Math.random() - 0.5) * shakeIntensity;
        const dy = (Math.random() - 0.5) * shakeIntensity;
        ctx.translate(dx, dy);
        shakeDuration--;
    }

    // Background (with trail effect)
    ctx.fillStyle = "rgba(17, 17, 17, 0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Middle line
    ctx.strokeStyle = "#555";
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, 0);
    ctx.lineTo(canvas.width/2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Player paddle
    ctx.fillStyle = "#0f0";
    ctx.fillRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // AI paddle
    ctx.fillStyle = "#f00";
    ctx.fillRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI*2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    // Scores
    ctx.font = "36px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(playerScore, canvas.width/2 - 50, 50);
    ctx.fillText(aiScore, canvas.width/2 + 20, 50);

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }

    // Restore context after shake
    if (shakeDuration > 0) {
        ctx.restore();
    }

    // Game Over screen
    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#fff";
        ctx.font = "60px Arial";
        ctx.textAlign = "center";

        let message = (playerScore >= WINNING_SCORE) ? "You Win!" : "Game Over";
        ctx.fillText(message, canvas.width / 2, canvas.height / 2 - 40);

        ctx.font = "24px Arial";
        ctx.fillText("Click to Restart", canvas.width / 2, canvas.height / 2 + 20);
    }
}

// Ball and paddle collision detection
function update() {
    // Move ball
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Wall collision (top/bottom)
    if (ballY - BALL_RADIUS < 0) {
        ballY = BALL_RADIUS;
        ballSpeedY = -ballSpeedY;
        playSound(wallSound);
    }
    if (ballY + BALL_RADIUS > canvas.height) {
        ballY = canvas.height - BALL_RADIUS;
        ballSpeedY = -ballSpeedY;
        playSound(wallSound);
    }

    // Paddle collision (player)
    if (
        ballX - BALL_RADIUS < PLAYER_X + PADDLE_WIDTH &&
        ballY > playerY &&
        ballY < playerY + PADDLE_HEIGHT
    ) {
        ballX = PLAYER_X + PADDLE_WIDTH + BALL_RADIUS;
        ballSpeedX = -ballSpeedX;
        ballSpeedY += ((ballY - (playerY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2)) * 3;
        playSound(hitSound);
        createParticles(ballX, ballY, "#0f0");
    }

    // Paddle collision (AI)
    if (
        ballX + BALL_RADIUS > AI_X &&
        ballY > aiY &&
        ballY < aiY + PADDLE_HEIGHT
    ) {
        ballX = AI_X - BALL_RADIUS;
        ballSpeedX = -ballSpeedX;
        ballSpeedY += ((ballY - (aiY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2)) * 3;
        playSound(hitSound);
        createParticles(ballX, ballY, "#f00");
    }

    // AI movement - simple follows ball with some lag
    const aiCenter = aiY + PADDLE_HEIGHT / 2;
    if (aiCenter < ballY - 20) {
        aiY += 6;
    } else if (aiCenter > ballY + 20) {
        aiY -= 6;
    }
    aiY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, aiY));

    // Score update and reset
    if (ballX - BALL_RADIUS < 0) {
        aiScore++;
        if (aiScore >= WINNING_SCORE) {
            gameOver = true;
        } else {
            resetBall();
        }
    }
    if (ballX + BALL_RADIUS > canvas.width) {
        playerScore++;
        if (playerScore >= WINNING_SCORE) {
            gameOver = true;
        } else {
            resetBall();
        }
    }
}

// Reset ball to center
function resetBall() {
    playSound(scoreSound);
    triggerShake(20, 10);
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = 5 * (Math.random() < 0.5 ? 1 : -1);
    ballSpeedY = (Math.random() * 4 - 2);
}

// Reset the full game
function resetGame() {
    playerScore = 0;
    aiScore = 0;
    gameOver = false;
    resetBall();
}

// Main game loop
function loop() {
    if (!gameOver) {
        update();
    }
    draw();
    requestAnimationFrame(loop);
}

loop();