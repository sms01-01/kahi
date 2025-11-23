class KahinaGame {
    constructor() {
        this.gameContainer = document.getElementById('gameContainer');
        this.playerElement = document.getElementById('player');
        this.visionStatus = document.getElementById('visionStatus');
        this.visionEffect = document.getElementById('visionEffect');
        this.winScreen = document.getElementById('winScreen');
        this.loseScreen = document.getElementById('loseScreen');
        
        // Constantes du jeu
        this.GRAVITY = 0.8;
        this.JUMP_POWER = -15;
        this.MOVE_SPEED = 5;
        this.PLAYER_WIDTH = 30;
        this.PLAYER_HEIGHT = 50;
        
        this.resetGame();
        this.setupEventListeners();
        this.gameLoop();
    }

    resetGame() {
        this.player = { 
            x: 50, 
            y: 400, 
            width: this.PLAYER_WIDTH, 
            height: this.PLAYER_HEIGHT 
        };
        this.velocityY = 0;
        this.onGround = false;
        this.visionActive = false;
        this.gameStatus = 'playing'; // 'playing', 'win', 'lose'
        this.keys = {};
        
        this.updatePlayerPosition();
        this.hideEndScreens();
        this.gameContainer.classList.remove('vision-active');
        this.visionStatus.textContent = '🔮 Vision: PRÊTE';
        this.visionStatus.style.color = '#87ceeb';
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // Redémarrer le jeu
            if (e.key === 'r' || e.key === 'R') {
                this.restart();
            }
            
            // Activer/désactiver la vision
            if (e.key === 'v' || e.key === 'V') {
                this.toggleVision();
            }
            
            // Empêcher le défilement avec la barre d'espace
            if (e.key === ' ') {
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Support tactile pour mobile
        this.setupTouchControls();
    }

    setupTouchControls() {
        const leftBtn = document.createElement('button');
        const rightBtn = document.createElement('button');
        const jumpBtn = document.createElement('button');
        const visionBtn = document.createElement('button');
        
        this.createTouchButton(leftBtn, '←', 'left', 'touch-left');
        this.createTouchButton(rightBtn, '→', 'right', 'touch-right');
        this.createTouchButton(jumpBtn, 'Saut', ' ', 'touch-jump');
        this.createTouchButton(visionBtn, 'Vision', 'v', 'touch-vision');
        
        document.body.appendChild(leftBtn);
        document.body.appendChild(rightBtn);
        document.body.appendChild(jumpBtn);
        document.body.appendChild(visionBtn);
    }

    createTouchButton(button, text, key, className) {
        button.textContent = text;
        button.className = `touch-btn ${className}`;
        button.style.cssText = `
            position: fixed;
            padding: 15px 20px;
            background: rgba(120, 81, 169, 0.8);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            z-index: 1000;
            backdrop-filter: blur(10px);
            border: 2px solid #9370db;
        `;
        
        if (className === 'touch-left') {
            button.style.bottom = '20px';
            button.style.left = '20px';
        } else if (className === 'touch-right') {
            button.style.bottom = '20px';
            button.style.left = '100px';
        } else if (className === 'touch-jump') {
            button.style.bottom = '20px';
            button.style.right = '100px';
        } else if (className === 'touch-vision') {
            button.style.bottom = '20px';
            button.style.right = '20px';
        }
        
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys[key] = true;
        });
        
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys[key] = false;
        });
    }

    toggleVision() {
        if (this.gameStatus !== 'playing') return;
        
        this.visionActive = !this.visionActive;
        
        if (this.visionActive) {
            this.gameContainer.classList.add('vision-active');
            this.visionStatus.textContent = '🔮 Vision: ACTIVÉE';
            this.visionStatus.style.color = '#00ff88';
        } else {
            this.gameContainer.classList.remove('vision-active');
            this.visionStatus.textContent = '🔮 Vision: PRÊTE';
            this.visionStatus.style.color = '#87ceeb';
        }
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    update() {
        if (this.gameStatus !== 'playing') return;

        this.handleMovement();
        this.applyPhysics();
        this.checkPlatformCollisions();
        this.checkGameConditions();
        this.updatePlayerPosition();
    }

    handleMovement() {
        // Mouvement horizontal
        if (this.keys['ArrowLeft'] || this.keys['left']) {
            this.player.x = Math.max(0, this.player.x - this.MOVE_SPEED);
        }
        if (this.keys['ArrowRight'] || this.keys['right']) {
            this.player.x = Math.min(800 - this.player.width, this.player.x + this.MOVE_SPEED);
        }

        // Saut
        if ((this.keys[' '] || this.keys['jump']) && this.onGround) {
            this.velocityY = this.JUMP_POWER;
            this.onGround = false;
        }
    }

    applyPhysics() {
        this.velocityY += this.GRAVITY;
        this.player.y += this.velocityY;
    }

    checkPlatformCollisions() {
        this.onGround = false;
        const platforms = this.gameContainer.querySelectorAll('.platform:not(.hidden-platform), .vision-active .hidden-platform');
        
        platforms.forEach(platform => {
            const style = platform.style;
            const platformRect = {
                x: parseInt(style.left),
                y: parseInt(style.top),
                width: parseInt(style.width),
                height: parseInt(style.height)
            };

            if (this.checkCollision(this.player, platformRect)) {
                // Collision par le dessus (atterrissage)
                if (this.velocityY > 0 && this.player.y + this.player.height > platformRect.y) {
                    this.player.y = platformRect.y - this.player.height;
                    this.velocityY = 0;
                    this.onGround = true;
                }
                // Collision par le dessous (tête)
                else if (this.velocityY < 0 && this.player.y < platformRect.y + platformRect.height) {
                    this.player.y = platformRect.y + platformRect.height;
                    this.velocityY = 0;
                }
            }
        });
    }

    checkGameConditions() {
        this.checkWinCondition();
        this.checkLoseCondition();
    }

    checkWinCondition() {
        const oracle = { x: 700, y: 250, width: 50, height: 50 };
        if (this.checkCollision(this.player, oracle)) {
            this.gameStatus = 'win';
            this.winScreen.style.display = 'flex';
        }
    }

    checkLoseCondition() {
        if (this.player.y > 600) {
            this.gameStatus = 'lose';
            this.loseScreen.style.display = 'flex';
        }
    }

    updatePlayerPosition() {
        this.playerElement.style.left = this.player.x + 'px';
        this.playerElement.style.top = this.player.y + 'px';
    }

    hideEndScreens() {
        this.winScreen.style.display = 'none';
        this.loseScreen.style.display = 'none';
    }

    gameLoop() {
        this.update();
        requestAnimationFrame(() => this.gameLoop());
    }

    restart() {
        this.resetGame();
    }
}

// Styles pour les boutons tactiles
const touchStyles = document.createElement('style');
touchStyles.textContent = `
    .touch-btn {
        transition: all 0.2s ease;
        touch-action: manipulation;
    }
    
    .touch-btn:active {
        transform: scale(0.9);
        background: rgba(147, 112, 219, 0.9) !important;
    }
    
    @media (max-width: 768px) {
        .touch-btn {
            padding: 20px 25px !important;
            font-size: 18px !important;
        }
    }
`;
document.head.appendChild(touchStyles);

// Démarrer le jeu quand la page est chargée
let game;
window.addEventListener('load', () => {
    game = new KahinaGame();
});

// Empêcher le menu contextuel sur mobile
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
