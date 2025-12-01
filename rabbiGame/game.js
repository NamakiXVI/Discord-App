// SUBWAY RABBI - The Kosher Runner Game v2
// Enhanced with better jumping, hitboxes, and exaggerated stereotypes

// Game variables
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const finalScoreElement = document.getElementById('final-score');
const distanceElement = document.getElementById('distance');
const speedElement = document.getElementById('speed');
const blessingsElement = document.getElementById('blessings');

// Game screens
const startScreen = document.getElementById('start-screen');
const pauseScreen = document.getElementById('pause-screen');
const gameOverScreen = document.getElementById('gameover-screen');
const instructionsScreen = document.getElementById('instructions-screen');
const newHighScoreElement = document.getElementById('new-high-score');

// Buttons
const startBtn = document.getElementById('start-btn');
const instructionsBtn = document.getElementById('instructions-btn');
const resumeBtn = document.getElementById('resume-btn');
const restartBtn = document.getElementById('restart-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const menuBtn = document.getElementById('menu-btn');
const backBtn = document.getElementById('back-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const jumpBtn = document.getElementById('jump-btn');
const pauseMobileBtn = document.getElementById('pause-mobile-btn');
const themeToggle = document.getElementById('theme-toggle');
const soundToggle = document.getElementById('sound-toggle');

// Audio elements
const coinSound = document.getElementById('coin-sound');
const jumpSound = document.getElementById('jump-sound');
const collisionSound = document.getElementById('collision-sound');
const blessingSound = document.getElementById('blessing-sound');
const backgroundMusic = document.getElementById('background-music');

// Game constants
const LANES = 3;
const LANE_WIDTH = canvas.width / LANES;
const PLAYER_WIDTH = 60;
const PLAYER_HEIGHT = 100;
const PLAYER_JUMP_HEIGHT = 150;
const PLAYER_START_LANE = 1;
const GROUND_HEIGHT = 50;
const COIN_SIZE = 30;
const OBSTACLE_MIN_HEIGHT = 50;
const OBSTACLE_MAX_HEIGHT = 120;
const GAME_SPEED_START = 5;
const GAME_SPEED_INCREMENT = 0.001;
const COIN_SPAWN_RATE = 0.03;
const OBSTACLE_SPAWN_RATE = 0.02;
const BLESSING_COIN_THRESHOLD = 10;

// New game constants for improved jumping
const JUMP_VELOCITY = -18; // Negative because canvas Y goes down
const GRAVITY = 0.8;
const JUMP_BUFFER_TIME = 100; // ms to buffer jump input

// Game state
let gameState = {
    running: false,
    paused: false,
    gameOver: false,
    score: 0,
    highScore: localStorage.getItem('subwayRabbiHighScore') || 0,
    distance: 0,
    speed: GAME_SPEED_START,
    blessings: 0,
    coinsCollected: 0,
    player: {
        x: 0,
        y: canvas.height - GROUND_HEIGHT - PLAYER_HEIGHT,
        lane: PLAYER_START_LANE,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        jumping: false,
        velocityY: 0,
        jumpRequested: false,
        jumpRequestTime: 0
    },
    coins: [],
    obstacles: [],
    backgroundOffset: 0,
    frames: 0,
    soundEnabled: true,
    darkMode: false,
    stereotypes: [
        "Oy vey!",
        "Mazel tov!",
        "What's a nice boy like you?",
        "Eat! Eat!",
        "You should meet my daughter!",
        "Are you fasting?",
        "A sheynem dank!",
        "Next year in Jerusalem!"
    ],
    currentStereotype: ""
};

// Initialize high score display
highScoreElement.textContent = gameState.highScore;

// Game objects
class Coin {
    constructor(lane) {
        this.lane = lane;
        this.x = canvas.width + Math.random() * 100;
        this.y = canvas.height - GROUND_HEIGHT - COIN_SIZE / 2;
        this.width = COIN_SIZE;
        this.height = COIN_SIZE;
        this.collected = false;
        this.spin = 0;
        this.type = Math.random() > 0.9 ? 'special' : 'normal'; // 10% chance for special coin
    }
    
    update() {
        this.x -= gameState.speed;
        this.spin += 0.1;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.spin);
        
        // Draw gold coin
        if (this.type === 'special') {
            // Special diamond coin
            ctx.fillStyle = '#4ecdc4';
            ctx.beginPath();
            ctx.moveTo(0, -this.width/2);
            ctx.lineTo(this.width/2, 0);
            ctx.lineTo(0, this.width/2);
            ctx.lineTo(-this.width/2, 0);
            ctx.closePath();
            ctx.fill();
            
            ctx.fillStyle = '#1a1a2e';
            ctx.font = `${this.width / 2}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💎', 0, 0);
        } else {
            // Normal gold coin
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#FFB142';
            ctx.beginPath();
            ctx.arc(0, 0, this.width / 3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(-this.width / 6, -this.width / 6, this.width / 6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#1a1a2e';
            ctx.font = `${this.width / 2}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('₪', 0, 0);
        }
        
        ctx.restore();
    }
}

class Obstacle {
    constructor(lane, type) {
        this.lane = lane;
        this.type = type || Math.floor(Math.random() * 6); // 0=bagel, 1=challah, 2=torah, 3=dreidel, 4=matzah, 5=schmear
        this.x = canvas.width + Math.random() * 200;
        this.height = OBSTACLE_MIN_HEIGHT + Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT);
        this.y = canvas.height - GROUND_HEIGHT - this.height;
        this.width = this.type === 5 ? 80 : 60; // Schmear is wider
        this.rotation = 0;
        this.bounce = Math.random() * 0.1;
    }
    
    update() {
        this.x -= gameState.speed;
        this.rotation += 0.05;
        
        // Add bounce effect for some obstacles
        if (this.type === 3) { // Dreidel spins
            this.rotation += 0.2;
        }
        
        if (this.type === 5) { // Schmear wobbles
            this.y = canvas.height - GROUND_HEIGHT - this.height + Math.sin(gameState.frames * 0.1 + this.bounce) * 10;
        }
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        
        if (this.type === 3) { // Dreidel
            ctx.rotate(this.rotation);
        }
        
        ctx.translate(-this.width/2, -this.height/2);
        
        switch(this.type) {
            case 0: // Giant Bagel
                ctx.fillStyle = '#F4A460';
                ctx.beginPath();
                ctx.ellipse(this.width/2, this.height/2, this.width/2, this.height/2, 0, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#0f1525';
                ctx.beginPath();
                ctx.arc(this.width/2, this.height/2, this.width/3, 0, Math.PI * 2);
                ctx.fill();
                
                // Lots of sesame seeds
                ctx.fillStyle = '#F5DEB3';
                for(let i = 0; i < 20; i++) {
                    const angle = (i / 20) * Math.PI * 2;
                    const x = this.width/2 + Math.cos(angle) * this.width/2.5;
                    const y = this.height/2 + Math.sin(angle) * this.height/2.5;
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 1: // Massive Challah bread
                ctx.fillStyle = '#D2691E';
                ctx.beginPath();
                ctx.roundRect(0, 0, this.width, this.height, 15);
                ctx.fill();
                
                // Exaggerated braid
                ctx.fillStyle = '#8B4513';
                for(let i = 0; i < 5; i++) {
                    ctx.beginPath();
                    ctx.roundRect(i * this.width/5 + 2, 2, this.width/5 - 4, this.height - 4, 8);
                    ctx.fill();
                }
                
                // Poppy seeds everywhere
                ctx.fillStyle = '#000000';
                for(let i = 0; i < 30; i++) {
                    const x = Math.random() * this.width;
                    const y = Math.random() * this.height;
                    ctx.beginPath();
                    ctx.arc(x, y, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 2: // Torah scroll
                ctx.fillStyle = '#8B4513';
                ctx.beginPath();
                ctx.roundRect(0, 0, this.width, this.height, 5);
                ctx.fill();
                
                // Torah details with exaggerated gold
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.roundRect(5, 5, this.width - 10, this.height - 10, 3);
                ctx.fill();
                
                // Giant Hebrew text
                ctx.fillStyle = '#8B4513';
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('✡✡✡', this.width/2, this.height/2);
                break;
                
            case 3: // Dreidel
                ctx.fillStyle = '#FF6B6B';
                ctx.beginPath();
                ctx.roundRect(0, 0, this.width, this.height, 5);
                ctx.fill();
                
                // Dreidel details
                ctx.fillStyle = '#FFD700';
                ctx.font = 'bold 40px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('נ', this.width/2, this.height/2);
                break;
                
            case 4: // Matzah box (exaggerated size)
                ctx.fillStyle = '#DEB887';
                ctx.beginPath();
                ctx.roundRect(0, 0, this.width, this.height, 3);
                ctx.fill();
                
                // Matzah lines
                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 2;
                for(let i = 1; i < 4; i++) {
                    ctx.beginPath();
                    ctx.moveTo(5, i * this.height/4);
                    ctx.lineTo(this.width - 5, i * this.height/4);
                    ctx.stroke();
                }
                for(let i = 1; i < 4; i++) {
                    ctx.beginPath();
                    ctx.moveTo(i * this.width/4, 5);
                    ctx.lineTo(i * this.width/4, this.height - 5);
                    ctx.stroke();
                }
                
                // "Matzah" text
                ctx.fillStyle = '#8B4513';
                ctx.font = 'bold 16px Comic Neue';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('MATZAH!', this.width/2, this.height/2);
                break;
                
            case 5: // Cream Cheese Schmear (wobbly)
                ctx.fillStyle = '#FFFDD0';
                ctx.beginPath();
                ctx.ellipse(this.width/2, this.height/2, this.width/2, this.height/2, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Bagel schmear texture
                ctx.fillStyle = '#F5DEB3';
                for(let i = 0; i < 15; i++) {
                    const x = this.width/2 + (Math.random() - 0.5) * this.width;
                    const y = this.height/2 + (Math.random() - 0.5) * this.height;
                    if (Math.sqrt(Math.pow(x - this.width/2, 2) + Math.pow(y - this.height/2, 2)) < this.width/2) {
                        ctx.beginPath();
                        ctx.arc(x, y, 3 + Math.random() * 4, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                
                // "Schmear" text
                ctx.fillStyle = '#8B4513';
                ctx.font = 'bold 14px Comic Neue';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('SCHMEAR', this.width/2, this.height/2);
                break;
        }
        
        ctx.restore();
    }
}

// Initialize game
function initGame() {
    gameState.running = true;
    gameState.paused = false;
    gameState.gameOver = false;
    gameState.score = 0;
    gameState.distance = 0;
    gameState.speed = GAME_SPEED_START;
    gameState.blessings = 0;
    gameState.coinsCollected = 0;
    gameState.player.lane = PLAYER_START_LANE;
    gameState.player.x = gameState.player.lane * LANE_WIDTH + (LANE_WIDTH - PLAYER_WIDTH) / 2;
    gameState.player.y = canvas.height - GROUND_HEIGHT - PLAYER_HEIGHT;
    gameState.player.jumping = false;
    gameState.player.velocityY = 0;
    gameState.player.jumpRequested = false;
    gameState.coins = [];
    gameState.obstacles = [];
    gameState.backgroundOffset = 0;
    gameState.frames = 0;
    
    updateUI();
    startScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    instructionsScreen.classList.add('hidden');
    newHighScoreElement.style.display = 'none';
    
    if(gameState.soundEnabled) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.volume = 0.5;
        backgroundMusic.play().catch(e => console.log("Audio play failed:", e));
    }
    
    requestAnimationFrame(gameLoop);
}

// Game loop
function gameLoop() {
    if(!gameState.running || gameState.paused || gameState.gameOver) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update game state
    updateGame();
    
    // Draw game elements
    drawBackground();
    drawGround();
    drawLanes();
    
    // Draw and update coins
    gameState.coins.forEach(coin => {
        coin.update();
        coin.draw();
    });
    
    // Draw and update obstacles
    gameState.obstacles.forEach(obstacle => {
        obstacle.update();
        obstacle.draw();
    });
    
    // Update and draw player
    updatePlayer();
    drawPlayer();
    
    // Remove off-screen objects
    gameState.coins = gameState.coins.filter(coin => coin.x > -coin.width && !coin.collected);
    gameState.obstacles = gameState.obstacles.filter(obstacle => obstacle.x > -obstacle.width);
    
    // Check collisions
    checkCollisions();
    
    // Spawn new objects
    spawnObjects();
    
    // Update UI
    updateUI();
    
    // Increment frame counter
    gameState.frames++;
    
    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Update game state
function updateGame() {
    // Increase game speed gradually
    gameState.speed += GAME_SPEED_INCREMENT;
    
    // Update distance
    gameState.distance += Math.floor(gameState.speed / 5);
    
    // Update background offset for parallax effect
    gameState.backgroundOffset = (gameState.backgroundOffset - gameState.speed / 2) % canvas.width;
    
    // Randomly show stereotype text
    if (Math.random() < 0.005 && !gameState.currentStereotype) { // 0.5% chance per frame
        gameState.currentStereotype = gameState.stereotypes[Math.floor(Math.random() * gameState.stereotypes.length)];
        setTimeout(() => {
            gameState.currentStereotype = "";
        }, 2000);
    }
}

// Draw background
function drawBackground() {
    // Draw gradient sky
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw distant buildings (parallax) - Exaggerated Jewish neighborhood
    ctx.fillStyle = 'rgba(30, 30, 60, 0.7)';
    for(let i = 0; i < 5; i++) {
        const x = (i * 200 + gameState.backgroundOffset / 3) % (canvas.width + 200) - 100;
        const height = 100 + Math.sin(i) * 50;
        
        // Building
        ctx.fillRect(x, canvas.height - GROUND_HEIGHT - height, 150, height);
        
        // Windows with mezuzahs
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        for(let w = 0; w < 3; w++) {
            for(let h = 0; h < 2; h++) {
                ctx.fillRect(x + 20 + w * 40, canvas.height - GROUND_HEIGHT - height + 20 + h * 30, 15, 20);
                
                // Mezuzah on doorpost
                if (w === 0 && h === 1) {
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(x + 15, canvas.height - GROUND_HEIGHT - height + 30 + h * 30, 5, 25);
                    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                }
            }
        }
        ctx.fillStyle = 'rgba(30, 30, 60, 0.7)';
    }
    
    // Draw stars with occasional Magen David
    ctx.fillStyle = 'white';
    for(let i = 0; i < 50; i++) {
        const x = (i * 37) % canvas.width;
        const y = (i * 23) % (canvas.height / 2);
        const size = Math.sin(gameState.frames * 0.01 + i) * 2 + 2;
        
        if (i % 10 === 0) { // Every 10th is a Star of David
            ctx.fillStyle = '#ffd700';
            drawStarOfDavid(x, y, size * 2);
            ctx.fillStyle = 'white';
        } else {
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Draw moon with exaggerated Jewish features
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath();
    ctx.arc(canvas.width - 100, 80, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // Giant Star of David on moon
    ctx.fillStyle = '#ffd700';
    drawStarOfDavid(canvas.width - 100, 80, 30);
    
    // Draw floating stereotype text
    if (gameState.currentStereotype) {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 20px Comic Neue';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(gameState.currentStereotype, canvas.width / 2, 50);
        
        // Text shadow
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.fillText(gameState.currentStereotype, canvas.width / 2 + 2, 52);
    }
}

// Draw Star of David
function drawStarOfDavid(x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    
    // Draw triangle 1
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * Math.cos(Math.PI/6), size/2);
    ctx.lineTo(-size * Math.cos(Math.PI/6), size/2);
    ctx.closePath();
    ctx.fill();
    
    // Draw triangle 2
    ctx.beginPath();
    ctx.moveTo(0, size);
    ctx.lineTo(size * Math.cos(Math.PI/6), -size/2);
    ctx.lineTo(-size * Math.cos(Math.PI/6), -size/2);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

// Draw ground
function drawGround() {
    // Ground
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);
    
    // Ground pattern with exaggerated Jewish symbols
    ctx.fillStyle = '#34495e';
    for(let i = 0; i < canvas.width; i += 40) {
        ctx.fillRect(i, canvas.height - GROUND_HEIGHT, 20, GROUND_HEIGHT);
        
        // Draw menorah pattern
        if (i % 120 === 0) {
            ctx.fillStyle = '#ffd700';
            drawMenorah(i + 10, canvas.height - GROUND_HEIGHT + 10, 10);
            ctx.fillStyle = '#34495e';
        }
    }
    
    // Ground top line
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, 3);
}

// Draw simple menorah
function drawMenorah(x, y, size) {
    // Base
    ctx.fillRect(x, y + size * 3, size, size * 2);
    
    // Stem
    ctx.fillRect(x + size/4, y, size/2, size * 3);
    
    // Arms
    for (let i = 0; i < 4; i++) {
        const armX = x - size + i * size * 0.7;
        ctx.fillRect(armX, y + size, size * 0.7, size/3);
        ctx.fillRect(armX + size * 0.35 - size/6, y, size/3, size);
    }
}

// Draw lane markers
function drawLanes() {
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.lineWidth = 2;
    
    for(let i = 1; i < LANES; i++) {
        const x = i * LANE_WIDTH;
        ctx.setLineDash([20, 20]);
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - GROUND_HEIGHT);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    ctx.setLineDash([]);
}

// Update player position and state - FIXED JUMPING
function updatePlayer() {
    // Update player lane position
    const targetX = gameState.player.lane * LANE_WIDTH + (LANE_WIDTH - PLAYER_WIDTH) / 2;
    gameState.player.x += (targetX - gameState.player.x) * 0.2;
    
    // Handle jump input buffering
    const now = Date.now();
    if (gameState.player.jumpRequested && now - gameState.player.jumpRequestTime < JUMP_BUFFER_TIME) {
        if (!gameState.player.jumping) {
            gameState.player.jumping = true;
            gameState.player.velocityY = JUMP_VELOCITY;
            
            if(gameState.soundEnabled) {
                jumpSound.currentTime = 0;
                jumpSound.play().catch(e => console.log("Audio play failed:", e));
            }
        }
        gameState.player.jumpRequested = false;
    }
    
    // Apply gravity if jumping
    if (gameState.player.jumping) {
        gameState.player.y += gameState.player.velocityY;
        gameState.player.velocityY += GRAVITY;
        
        // Check if landed
        if (gameState.player.y >= canvas.height - GROUND_HEIGHT - PLAYER_HEIGHT) {
            gameState.player.y = canvas.height - GROUND_HEIGHT - PLAYER_HEIGHT;
            gameState.player.jumping = false;
            gameState.player.velocityY = 0;
        }
    }
}

// Draw the rabbi character - EXAGGERATED STEREOTYPES
function drawPlayer() {
    ctx.save();
    ctx.translate(gameState.player.x, gameState.player.y);
    
    // Draw body (exaggerated black coat)
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.roundRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT, 10);
    ctx.fill();
    
    // Draw white shirt with exaggerated stripes
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(PLAYER_WIDTH/4, PLAYER_HEIGHT/2, PLAYER_WIDTH/2, PLAYER_HEIGHT/2);
    
    // Draw exaggerated stripes on shirt
    ctx.fillStyle = '#2c3e50';
    for(let i = 0; i < 5; i++) {
        ctx.fillRect(PLAYER_WIDTH/4 + i * (PLAYER_WIDTH/2)/5, PLAYER_HEIGHT/2, 2, PLAYER_HEIGHT/2);
    }
    
    // Draw prayer shawl (tallit) with exaggerated size
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-10, PLAYER_HEIGHT/2 - 15, PLAYER_WIDTH + 20, 30);
    
    // Draw exaggerated stripes on tallit
    ctx.fillStyle = '#2c3e50';
    for(let i = 0; i < 8; i++) {
        ctx.fillRect(i * (PLAYER_WIDTH + 20)/8 - 10, PLAYER_HEIGHT/2 - 15, 4, 30);
    }
    
    // Draw head with exaggerated features
    ctx.fillStyle = '#F5DEB3';
    ctx.beginPath();
    ctx.arc(PLAYER_WIDTH/2, 30, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw exaggerated giant nose
    ctx.fillStyle = '#F5DEB3';
    ctx.beginPath();
    ctx.arc(PLAYER_WIDTH/2 + 10, 35, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw exaggerated beard (HUGE)
    ctx.fillStyle = '#D2B48C';
    ctx.beginPath();
    ctx.ellipse(PLAYER_WIDTH/2, 55, 25, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Add curly sideburns (peyos)
    ctx.beginPath();
    ctx.arc(PLAYER_WIDTH/2 - 30, 40, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(PLAYER_WIDTH/2 + 30, 40, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eyes with exaggerated glasses
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(PLAYER_WIDTH/2 - 10, 25, 6, 0, Math.PI * 2);
    ctx.arc(PLAYER_WIDTH/2 + 10, 25, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw giant glasses
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(PLAYER_WIDTH/2 - 10, 25, 12, 0, Math.PI * 2);
    ctx.arc(PLAYER_WIDTH/2 + 10, 25, 12, 0, Math.PI * 2);
    ctx.moveTo(PLAYER_WIDTH/2 - 2, 25);
    ctx.lineTo(PLAYER_WIDTH/2 + 2, 25);
    ctx.stroke();
    
    // Draw exaggerated kippah (skullcap)
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(PLAYER_WIDTH/2, 10, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw giant Star of David on kippah
    ctx.fillStyle = '#2c3e50';
    drawStarOfDavid(PLAYER_WIDTH/2, 10, 8);
    
    // Draw arms when jumping
    if(gameState.player.jumping) {
        // Exaggerated arm movements
        const jumpProgress = Math.min(1, Math.abs(gameState.player.velocityY) / 10);
        
        // Left arm
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.roundRect(-20, 40 + jumpProgress * 20, 25, 10, 5);
        ctx.fill();
        
        // Right arm
        ctx.beginPath();
        ctx.roundRect(PLAYER_WIDTH - 5, 40 - jumpProgress * 20, 25, 10, 5);
        ctx.fill();
        
        // Draw coin in hand when jumping high
        if(gameState.player.velocityY < -5) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(PLAYER_WIDTH - 5, 35, 10, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#1a1a2e';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('₪', PLAYER_WIDTH - 5, 35);
        }
    }
    
    ctx.restore();
}

// Spawn coins and obstacles
function spawnObjects() {
    // Spawn coins
    if(Math.random() < COIN_SPAWN_RATE) {
        const lane = Math.floor(Math.random() * LANES);
        gameState.coins.push(new Coin(lane));
    }
    
    // Spawn obstacles
    if(Math.random() < OBSTACLE_SPAWN_RATE) {
        const lane = Math.floor(Math.random() * LANES);
        gameState.obstacles.push(new Obstacle(lane));
    }
}

// Check collisions - FIXED HITBOXES
function checkCollisions() {
    // Check coin collisions
    gameState.coins.forEach(coin => {
        if(!coin.collected) {
            // Better hitbox detection
            const playerCenterX = gameState.player.x + PLAYER_WIDTH/2;
            const playerCenterY = gameState.player.y + PLAYER_HEIGHT/2;
            const coinCenterX = coin.x;
            const coinCenterY = coin.y;
            
            const distance = Math.sqrt(
                Math.pow(playerCenterX - coinCenterX, 2) + 
                Math.pow(playerCenterY - coinCenterY, 2)
            );
            
            // If distance is less than combined "radius"
            if(distance < (PLAYER_WIDTH/2 + COIN_SIZE/2)) {
                coin.collected = true;
                gameState.score += coin.type === 'special' ? 50 : 10;
                gameState.coinsCollected++;
                
                // Play coin sound
                if(gameState.soundEnabled) {
                    coinSound.currentTime = 0;
                    coinSound.play().catch(e => console.log("Audio play failed:", e));
                }
                
                // Check for blessing
                if(gameState.coinsCollected % BLESSING_COIN_THRESHOLD === 0) {
                    gameState.blessings++;
                    gameState.score += 100; // Bonus for blessing
                    
                    if(gameState.soundEnabled) {
                        blessingSound.currentTime = 0;
                        blessingSound.play().catch(e => console.log("Audio play failed:", e));
                    }
                    
                    // Show blessing effect
                    showBlessingEffect();
                }
            }
        }
    });
    
    // Check obstacle collisions - FIXED HITBOX DETECTION
    gameState.obstacles.forEach(obstacle => {
        // Player hitbox (slightly smaller than visual)
        const playerHitbox = {
            x: gameState.player.x + PLAYER_WIDTH * 0.1,
            y: gameState.player.y + PLAYER_HEIGHT * 0.1,
            width: PLAYER_WIDTH * 0.8,
            height: PLAYER_HEIGHT * 0.8
        };
        
        // Obstacle hitbox (also slightly smaller)
        const obstacleHitbox = {
            x: obstacle.x + obstacle.width * 0.1,
            y: obstacle.y + obstacle.height * 0.1,
            width: obstacle.width * 0.8,
            height: obstacle.height * 0.8
        };
        
        // Check AABB collision
        const collision = 
            playerHitbox.x < obstacleHitbox.x + obstacleHitbox.width &&
            playerHitbox.x + playerHitbox.width > obstacleHitbox.x &&
            playerHitbox.y < obstacleHitbox.y + obstacleHitbox.height &&
            playerHitbox.y + playerHitbox.height > obstacleHitbox.y;
        
        if(collision && !gameState.player.jumping) {
            // Game over
            gameState.running = false;
            gameState.gameOver = true;
            
            // Play collision sound
            if(gameState.soundEnabled) {
                collisionSound.currentTime = 0;
                collisionSound.play().catch(e => console.log("Audio play failed:", e));
            }
            
            // Update high score
            if(gameState.score > gameState.highScore) {
                gameState.highScore = gameState.score;
                localStorage.setItem('subwayRabbiHighScore', gameState.highScore);
                newHighScoreElement.style.display = 'block';
            }
            
            // Show game over screen
            finalScoreElement.textContent = gameState.score;
            gameOverScreen.classList.remove('hidden');
            
            // Stop background music
            backgroundMusic.pause();
        }
    });
}

// Show blessing effect
function showBlessingEffect() {
    // Create blessing text with exaggerated stereotype
    const blessings = [
        "MAZEL TOV! +100",
        "WHAT A MITZVAH! +100",
        "KOL HAKAVOD! +100",
        "OY VEY, SO RICH! +100",
        "MY BUBBE WOULD BE PROUD! +100"
    ];
    const blessingText = blessings[Math.floor(Math.random() * blessings.length)];
    
    const effect = document.createElement('div');
    effect.textContent = blessingText;
    effect.style.position = 'absolute';
    effect.style.top = '50%';
    effect.style.left = '50%';
    effect.style.transform = 'translate(-50%, -50%)';
    effect.style.color = '#ffd700';
    effect.style.fontSize = '3.5rem';
    effect.style.fontWeight = 'bold';
    effect.style.fontFamily = "'Comic Neue', sans-serif";
    effect.style.textShadow = '0 0 20px rgba(255, 215, 0, 1)';
    effect.style.zIndex = '1000';
    effect.style.pointerEvents = 'none';
    effect.style.animation = 'blessingAnim 2.5s forwards';
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes blessingAnim {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
            20% { opacity: 1; transform: translate(-50%, -100%) scale(1.3); }
            80% { opacity: 1; transform: translate(-50%, -150%) scale(1.1); }
            100% { opacity: 0; transform: translate(-50%, -200%) scale(0.9); }
        }
    `;
    document.head.appendChild(style);
    
    document.querySelector('.game-area').appendChild(effect);
    
    // Remove after animation
    setTimeout(() => {
        if(effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
        document.head.removeChild(style);
    }, 2500);
}

// Update UI elements
function updateUI() {
    scoreElement.textContent = gameState.score;
    highScoreElement.textContent = gameState.highScore;
    distanceElement.textContent = `${gameState.distance}m`;
    speedElement.textContent = `${gameState.speed.toFixed(1)}x`;
    blessingsElement.textContent = gameState.blessings;
}

// Move player left
function moveLeft() {
    if(gameState.player.lane > 0) {
        gameState.player.lane--;
    }
}

// Move player right
function moveRight() {
    if(gameState.player.lane < LANES - 1) {
        gameState.player.lane++;
    }
}

// Make player jump - FIXED RESPONSIVENESS
function playerJump() {
    // Buffer jump input
    gameState.player.jumpRequested = true;
    gameState.player.jumpRequestTime = Date.now();
    
    // If already on ground, jump immediately
    if (!gameState.player.jumping && gameState.player.y >= canvas.height - GROUND_HEIGHT - PLAYER_HEIGHT - 5) {
        gameState.player.jumping = true;
        gameState.player.velocityY = JUMP_VELOCITY;
        
        if(gameState.soundEnabled) {
            jumpSound.currentTime = 0;
            jumpSound.play().catch(e => console.log("Audio play failed:", e));
        }
        gameState.player.jumpRequested = false;
    }
}

// Pause/Resume game
function togglePause() {
    if(!gameState.running || gameState.gameOver) return;
    
    gameState.paused = !gameState.paused;
    
    if(gameState.paused) {
        pauseScreen.classList.remove('hidden');
        backgroundMusic.pause();
    } else {
        pauseScreen.classList.add('hidden');
        if(gameState.soundEnabled) {
            backgroundMusic.play().catch(e => console.log("Audio play failed:", e));
        }
        requestAnimationFrame(gameLoop);
    }
}

// Toggle sound - FIXED FONT
function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    const icon = soundToggle.querySelector('i');
    const text = soundToggle.querySelector('span');
    
    if(gameState.soundEnabled) {
        icon.className = 'fas fa-volume-up';
        text.textContent = 'Sound On';
        if(gameState.running && !gameState.paused && !gameState.gameOver) {
            backgroundMusic.play().catch(e => console.log("Audio play failed:", e));
        }
    } else {
        icon.className = 'fas fa-volume-mute';
        text.textContent = 'Sound Off';
        backgroundMusic.pause();
    }
}

// Toggle dark/light mode
function toggleTheme() {
    gameState.darkMode = !gameState.darkMode;
    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('span');
    
    if(gameState.darkMode) {
        document.body.style.background = 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)';
        icon.className = 'fas fa-sun';
        text.textContent = 'Light Mode';
    } else {
        document.body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
        icon.className = 'fas fa-moon';
        text.textContent = 'Dark Mode';
    }
}

// Event Listeners
startBtn.addEventListener('click', initGame);
instructionsBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    instructionsScreen.classList.remove('hidden');
});
backBtn.addEventListener('click', () => {
    instructionsScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
});
resumeBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', initGame);
playAgainBtn.addEventListener('click', initGame);
menuBtn.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    gameState.running = false;
    backgroundMusic.pause();
});

// Mobile controls
leftBtn.addEventListener('click', moveLeft);
rightBtn.addEventListener('click', moveRight);
jumpBtn.addEventListener('click', playerJump);
pauseMobileBtn.addEventListener('click', togglePause);

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if(!gameState.running || gameState.paused || gameState.gameOver) {
        if(e.key === ' ' && gameState.gameOver) {
            initGame();
        }
        return;
    }
    
    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            moveLeft();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            moveRight();
            break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case ' ':
            e.preventDefault(); // Prevent spacebar from scrolling
            playerJump();
            break;
        case 'Escape':
        case 'p':
        case 'P':
            togglePause();
            break;
    }
});

// Sound and theme toggles
soundToggle.addEventListener('click', toggleSound);
themeToggle.addEventListener('click', toggleTheme);

// Touch controls for mobile swipe
let touchStartX = 0;
let touchStartY = 0;
let lastTouchTime = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    lastTouchTime = Date.now();
});

document.addEventListener('touchend', (e) => {
    if(!gameState.running || gameState.paused || gameState.gameOver) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const currentTime = Date.now();
    
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    // Quick tap for jump (less than 200ms)
    if (currentTime - lastTouchTime < 200 && Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
        playerJump();
        return;
    }
    
    // Swipe left/right for movement
    if(Math.abs(diffX) > Math.abs(diffY)) {
        if(diffX > 30) {
            moveRight();
        } else if(diffX < -30) {
            moveLeft();
        }
    }
    // Swipe up for jump
    else if(diffY < -30) {
        playerJump();
    }
});

// Initialize game on load
window.addEventListener('load', () => {
    // Set up roundRect function if not exists (for older browsers)
    if (!ctx.roundRect) {
        ctx.roundRect = function(x, y, width, height, radius) {
            if (width < 2 * radius) radius = width / 2;
            if (height < 2 * radius) radius = height / 2;
            this.beginPath();
            this.moveTo(x + radius, y);
            this.arcTo(x + width, y, x + width, y + height, radius);
            this.arcTo(x + width, y + height, x, y + height, radius);
            this.arcTo(x, y + height, x, y, radius);
            this.arcTo(x, y, x + width, y, radius);
            this.closePath();
            return this;
        }
    }
    
    // Initialize high score
    highScoreElement.textContent = gameState.highScore;
    
    // Initialize sound and theme buttons
    toggleSound(); // Set initial state
    toggleTheme(); // Set initial state
});