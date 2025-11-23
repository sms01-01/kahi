class KahinaGame {
    constructor() {
        this.gameContainer = document.getElementById('gameContainer');
        this.playerElement = document.getElementById('player');
        this.visionStatus = document.getElementById('visionStatus');
        this.visionEffect = document.getElementById('visionEffect');
        this.particlesContainer = document.getElementById('particlesContainer');
        this.winScreen = document.getElementById('winScreen');
        this.loseScreen = document.getElementById('loseScreen');
        
        // Constantes du jeu
        this.GRAVITY = 0.8;
        this.JUMP_POWER = -16;
        this.MOVE_SPEED = 6;
        this.PLAYER_WIDTH = 40;
        this.PLAYER_HEIGHT = 60;
        
        // État du jeu
        this.isRunning = false;
        this.isJumping = false;
        this.lastDirection = 'right';
        this.particles = [];
        
        this.resetGame();
        this.setupEventListeners();
        this.gameLoop();
        this.createParticles();
    }

    resetGame() {
        this.player = { 
            x: 50, 
            y: 400, 
            width: this.PLAYER_WIDTH, 
            height: this.PLAYER_HEIGHT,
            velocityX: 0,
            velocityY: 0
        };
        this.velocityY = 0;
        this.onGround = false;
        this.visionActive = false;
        this.gameStatus = 'playing';
        this.keys = {};
        this.isRunning = false;
        this.isJumping = false;
        
        this.updatePlayerPosition();
        this.hideEndScreens();
        this.deactivateVision();
        this.updatePlayerAppearance();
    }

    setupEventListeners() {
        // Clavier
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            if (e.key === 'r' || e.key === 'R') {
                this.restart();
            }
            
            if (e.key === 'v' || e.key === 'V') {
                this.toggleVision();
            }
            
            if (e.key === ' ') {
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            
            // Arrêter l'animation de course
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                this.isRunning = false;
                this.updatePlayerAppearance();
            }
        });

        // Contrôles tactiles
        this.setupTouchControls();
        
        // Redimensionnement
        window.addEventListener('resize', () => this.handleResize());
    }

    setupTouchControls() {
        const touchButtons = document.querySelectorAll('.touch-btn');
        
        touchButtons.forEach(button => {
            const key = button.getAttribute('data-key');
            
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys[key] = true;
                
                // Animation de pression
                button.style.transform = 'scale(0.85)';
            });
            
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys[key] = false;
                
                // Animation de relâchement
                button.style.transform = 'scale(1)';
                
                // Arrêter la course si c'est une touche de direction
                if (key === 'ArrowLeft' || key === 'ArrowRight') {
                    this.isRunning = false;
                    this.updatePlayerAppearance();
                }
            });
        });
    }

    handleResize() {
        // Ajuster les particules si nécessaire
        this.adjustParticles();
    }

    toggleVision() {
        if (this.gameStatus !== 'playing') return;
        
        this.visionActive = !this.visionActive;
        
        if (this.visionActive) {
            this.activateVision();
        } else {
            this.deactivateVision();
        }
    }

    activateVision() {
        this.gameContainer.classList.add('vision-active');
        this.visionStatus.querySelector('.vision-text').textContent = 'Vision: ACTIVÉE';
        this.visionStatus.style.color = '#00ff88';
        this.createVisionParticles();
    }

    deactivateVision() {
        this.gameContainer.classList.remove('vision-active');
        this.visionStatus.querySelector('.vision-text').textContent = 'Vision: PRÊTE';
        this.visionStatus.style.color = '#87ceeb';
    }

    update() {
        if (this.gameStatus !== 'playing') return;

        this.handleMovement();
        this.applyPhysics();
        this.checkPlatformCollisions();
        this.checkGameConditions();
        this.updatePlayerPosition();
        this.updatePlayerAppearance();
        this.updateParticles();
    }

    handleMovement() {
        let moving = false;
        this.player.velocityX = 0;

        // Mouvement horizontal
        if (this.keys['ArrowLeft'] || this.keys['left']) {
            this.player.velocityX = -this.MOVE_SPEED;
            this.lastDirection = 'left';
            moving = true;
        }
        if (this.keys['ArrowRight'] || this.keys['right']) {
            this.player.velocityX = this.MOVE_SPEED;
            this.lastDirection = 'right';
            moving = true;
        }

        this.player.x += this.player.velocityX;
        this.player.x = Math.max(0, Math.min(800 - this.player.width, this.player.x));

        // Mettre à jour l'état de course
        if (moving !== this.isRunning) {
            this.isRunning = moving;
        }

        // Saut
        if ((this.keys[' '] || this.keys['jump']) && this.onGround) {
            this.velocityY = this.JUMP_POWER;
            this.onGround = false;
            this.isJumping = true;
        }
    }

    applyPhysics() {
        this.velocityY += this.GRAVITY;
        this.player.y += this.velocityY;
        
        // Mettre à jour l'état de saut
        this.isJumping = this.velocityY < 0 || !this.onGround;
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
                // Collision par le dessus
                if (this.velocityY > 0 && this.player.y + this.player.height > platformRect.y + 5) {
                    this.player.y = platformRect.y - this.player.height;
                    this.velocityY = 0;
                    this.onGround = true;
                    this.isJumping = false;
                }
                // Collision par le dessous
                else if (this.velocityY < 0 && this.player.y < platformRect.y + platformRect.height) {
                    this.player.y = platformRect.y + platformRect.height;
                    this.velocityY = 0;
                }
                // Collision latérale
                else if (this.player.velocityX !== 0) {
                    if (this.player.x + this.player.width > platformRect.x && 
                        this.player.x < platformRect.x + platformRect.width) {
                        this.player.x -= this.player.velocityX;
                    }
                }
            }
        });
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
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
            this.createCelebrationParticles();
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

    updatePlayerAppearance() {
        const character = this.playerElement.querySelector('.kahina-character');
        
        // Réinitialiser les classes
        character.classList.remove('running', 'jumping', 'facing-left', 'facing-right');
        
        // Direction
        character.classList.add(`facing-${this.lastDirection}`);
        
        // État de mouvement
        if (this.isJumping) {
            character.classList.add('jumping');
        } else if (this.isRunning) {
            character.classList.add('running');
        }
        
        // Inverser visuellement pour la gauche
        if (this.lastDirection === 'left') {
            character.style.transform = 'scaleX(-1)';
        } else {
            character.style.transform = 'scaleX(1)';
        }
    }

    hideEndScreens() {
        this.winScreen.style.display = 'none';
        this.loseScreen.style.display = 'none';
    }

    createParticles() {
        // Créer des particules d'ambiance
        for (let i = 0; i < 15; i++) {
            this.createParticle(true);
        }
    }

    createParticle(isAmbient = false) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 3 + 2;
        const left = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = Math.random() * 4 + 2;
        
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${left}%;
            top: ${isAmbient ? Math.random() * 100 : 100}%;
            background: ${this.getRandomParticleColor()};
            animation-delay: ${delay}s;
            animation-duration: ${duration}s;
        `;
        
        this.particlesContainer.appendChild(particle);
        
        // Supprimer la particule après l'animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, duration * 1000 + delay * 1000);
        
        if (isAmbient) {
            // Recréer des particules d'ambiance continuellement
            setTimeout(() => this.createParticle(true), (duration + delay) * 1000);
        }
    }

    createVisionParticles() {
        // Créer un effet de particules spécial pour la vision
        for (let i = 0; i < 10; i++) {
            setTimeout(() => this.createParticle(), i * 100);
        }
    }

    createCelebrationParticles() {
        // Créer des particules de célébration
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                this.createParticle();
            }, i * 50);
        }
    }

    getRandomParticleColor() {
        const colors = [
            '#3498db', '#87ceeb', '#00ff88', '#9370db', '#da70d6', '#ffd700'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    updateParticles() {
        // Mettre à jour la logique des particules si nécessaire
    }

    adjustParticles() {
        // Ajuster les particules au redimensionnement
        const particles = this.particlesContainer.querySelectorAll('.particle');
        particles.forEach(particle => {
            particle.style.left = Math.random() * 100 + '%';
        });
    }

    gameLoop() {
        this.update();
        requestAnimationFrame(() => this.gameLoop());
    }

    restart() {
        this.resetGame();
    }
}

// Démarrer le jeu quand la page est chargée
let game;
window.addEventListener('load', () => {
    // Petit délai pour le chargement
    setTimeout(() => {
        game = new KahinaGame();
        document.body.classList.add('loading');
    }, 100);
});

// Empêcher les actions par défaut
document.addEventListener('touchmove', (e) => {
    if (e.target.classList.contains('touch-btn')) {
        e.preventDefault();
    }
}, { passive: false });

// Détection des appareils mobiles
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Afficher/masquer les contrôles tactiles
if (isMobileDevice()) {
    document.querySelector('.touch-controls').style.display = 'flex';
    document.querySelector('.controls-info').style.display = 'none';
}
