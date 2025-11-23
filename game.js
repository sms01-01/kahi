class KahinaGame {
    constructor() {
        this.canvas = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        this.gameState = 'menu'; // menu, playing, gameOver
        this.score = 0;
        this.highScore = localStorage.getItem('kahinaHighScore') || 0;
        this.level = 1;
        this.platforms = [];
        this.clouds = [];
        
        this.player = {
            x: this.canvas.width / 2 - 25,
            y: this.canvas.height - 200,
            width: 50,
            height: 70,
            velocityX: 0,
            velocityY: 0,
            isMoving: false,
            isJumping: false,
            moveDirection: 0 // -1: gauche, 0: immobile, 1: droite
        };
        
        this.gameSpeed = 3;
        this.platformGap = 120;
        this.currentPlatformY = this.canvas.height - 100;
        
        this.init();
    }
    
    init() {
        this.updateDisplays();
        this.createClouds();
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Redimensionnement
        window.addEventListener('resize', () => this.handleResize());
        
        // Contrôles clavier pour le debug
        window.addEventListener('keydown', (e) => {
            if (this.gameState !== 'playing') return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    this.moveLeft(true);
                    break;
                case 'ArrowRight':
                    this.moveRight(true);
                    break;
                case ' ':
                    this.jump();
                    break;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if (this.gameState !== 'playing') return;
            
            switch(e.key) {
                case 'ArrowLeft':
                case 'ArrowRight':
                    this.stopMoving();
                    break;
            }
        });
    }
    
    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.level = 1;
        this.platforms = [];
        this.currentPlatformY = this.canvas.height - 100;
        this.gameSpeed = 3;
        
        // Position initiale du joueur
        this.player.x = this.canvas.width / 2 - 25;
        this.player.y = this.canvas.height - 200;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        this.player.isMoving = false;
        this.player.isJumping = false;
        
        // Créer les premières plateformes
        this.createInitialPlatforms();
        
        this.showScreen('gameScreen');
        this.updateDisplays();
    }
    
    createInitialPlatforms() {
        // Plateforme de départ
        this.platforms.push({
            x: this.canvas.width / 2 - 75,
            y: this.canvas.height - 100,
            width: 150,
            height: 20,
            type: 'normal'
        });
        
        // Générer quelques plateformes au-dessus
        for (let i = 0; i < 10; i++) {
            this.generatePlatform();
        }
    }
    
    generatePlatform() {
        const minWidth = 60;
        const maxWidth = 120;
        const width = Math.random() * (maxWidth - minWidth) + minWidth;
        
        const x = Math.random() * (this.canvas.width - width - 40) + 20;
        
        // Types de plateformes avec probabilités différentes
        const types = [
            { type: 'normal', prob: 0.6 },
            { type: 'ice', prob: 0.2 },
            { type: 'magic', prob: 0.15 },
            { type: 'bouncy', prob: 0.05 }
        ];
        
        let random = Math.random();
        let type = 'normal';
        
        for (let t of types) {
            if (random < t.prob) {
                type = t.type;
                break;
            }
            random -= t.prob;
        }
        
        this.platforms.push({
            x: x,
            y: this.currentPlatformY - this.platformGap,
            width: width,
            height: 20,
            type: type
        });
        
        this.currentPlatformY -= this.platformGap;
    }
    
    createClouds() {
        this.clouds = [];
        for (let i = 0; i < 8; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height * 0.6,
                type: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)],
                speed: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    moveLeft(start) {
        if (this.gameState !== 'playing') return;
        
        if (start) {
            this.player.moveDirection = -1;
            this.player.isMoving = true;
            this.updatePlayerAppearance();
        } else {
            this.stopMoving();
        }
    }
    
    moveRight(start) {
        if (this.gameState !== 'playing') return;
        
        if (start) {
            this.player.moveDirection = 1;
            this.player.isMoving = true;
            this.updatePlayerAppearance();
        } else {
            this.stopMoving();
        }
    }
    
    stopMoving() {
        this.player.moveDirection = 0;
        this.player.isMoving = false;
        this.updatePlayerAppearance();
    }
    
    jump() {
        if (this.gameState !== 'playing' || this.player.isJumping) return;
        
        this.player.velocityY = -18;
        this.player.isJumping = true;
        this.updatePlayerAppearance();
        this.createJumpParticles();
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.updatePlayer();
        this.updatePlatforms();
        this.updateClouds();
        this.checkCollisions();
        this.updateScore();
        this.checkLevelProgression();
    }
    
    updatePlayer() {
        // Mouvement horizontal
        if (this.player.isMoving) {
            this.player.velocityX = this.player.moveDirection * 8;
        } else {
            this.player.velocityX *= 0.8; // Friction
        }
        
        this.player.x += this.player.velocityX;
        
        // Limites de l'écran
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
        
        // Gravité
        this.player.velocityY += 0.8;
        this.player.y += this.player.velocityY;
        
        // Scroll de la caméra si le joueur monte
        if (this.player.y < this.canvas.height * 0.3) {
            const deltaY = this.canvas.height * 0.3 - this.player.y;
            this.player.y = this.canvas.height * 0.3;
            
            // Déplacer toutes les plateformes et nuages vers le bas
            this.platforms.forEach(platform => platform.y += deltaY);
            this.clouds.forEach(cloud => cloud.y += deltaY * 0.5);
            this.currentPlatformY += deltaY;
        }
    }
    
    updatePlatforms() {
        // Supprimer les plateformes trop bas
        this.platforms = this.platforms.filter(platform => platform.y < this.canvas.height + 100);
        
        // Générer de nouvelles plateformes si nécessaire
        while (this.platforms.length < 15) {
            this.generatePlatform();
        }
        
        // Mettre à jour l'affichage des plateformes
        this.renderPlatforms();
    }
    
    updateClouds() {
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x < -100) {
                cloud.x = this.canvas.width + 50;
                cloud.y = Math.random() * this.canvas.height * 0.6;
            }
        });
        
        this.renderClouds();
    }
    
    checkCollisions() {
        let onPlatform = false;
        
        for (let platform of this.platforms) {
            if (this.isOnPlatform(platform)) {
                onPlatform = true;
                
                if (this.player.velocityY > 0) {
                    this.player.y = platform.y - this.player.height;
                    this.player.velocityY = 0;
                    this.player.isJumping = false;
                    
                    // Effets spéciaux selon le type de plateforme
                    switch(platform.type) {
                        case 'ice':
                            this.player.velocityX *= 1.2; // Glissement
                            break;
                        case 'bouncy':
                            this.player.velocityY = -22; // Rebond
                            this.createBounceParticles(platform);
                            break;
                        case 'magic':
                            this.createMagicParticles(platform);
                            break;
                    }
                    
                    this.updatePlayerAppearance();
                }
            }
        }
        
        // Game over si tombe en bas
        if (this.player.y > this.canvas.height + 100) {
            this.gameOver();
        }
    }
    
    isOnPlatform(platform) {
        return this.player.x + this.player.width > platform.x &&
               this.player.x < platform.x + platform.width &&
               this.player.y + this.player.height > platform.y &&
               this.player.y + this.player.height < platform.y + 20 &&
               this.player.velocityY > 0;
    }
    
    updateScore() {
        const newScore = Math.max(0, Math.floor((this.canvas.height - 200 - this.player.y) / 10));
        if (newScore > this.score) {
            this.score = newScore;
            this.updateDisplays();
        }
    }
    
    checkLevelProgression() {
        const newLevel = Math.floor(this.score / 100) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.gameSpeed = 3 + (this.level - 1) * 0.5;
            this.updateDisplays();
            this.createLevelUpParticles();
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        // Mettre à jour le high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('kahinaHighScore', this.highScore);
        }
        
        this.updateGameOverDisplay();
        this.showScreen('gameOverScreen');
    }
    
    restart() {
        this.startGame();
    }
    
    showMenu() {
        this.gameState = 'menu';
        this.showScreen('startScreen');
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
    
    updateDisplays() {
        document.getElementById('currentScore').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
        document.getElementById('currentLevel').textContent = this.level;
    }
    
    updateGameOverDisplay() {
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLevel').textContent = this.level;
        document.getElementById('finalHighScore').textContent = this.highScore;
    }
    
    updatePlayerAppearance() {
        const playerElement = document.getElementById('player');
        const character = playerElement.querySelector('.kahina-character');
        
        character.classList.remove('moving', 'jumping');
        
        if (this.player.isMoving) {
            character.classList.add('moving');
        }
        if (this.player.isJumping) {
            character.classList.add('jumping');
        }
        
        // Mise à jour position
        playerElement.style.left = this.player.x + 'px';
        playerElement.style.top = this.player.y + 'px';
    }
    
    renderPlatforms() {
        const container = document.getElementById('gameContainer');
        
        // Supprimer les anciennes plateformes
        const oldPlatforms = container.querySelectorAll('.platform');
        oldPlatforms.forEach(platform => platform.remove());
        
        // Créer les nouvelles plateformes
        this.platforms.forEach(platform => {
            const platformElement = document.createElement('div');
            platformElement.className = `platform ${platform.type}`;
            platformElement.style.cssText = `
                left: ${platform.x}px;
                top: ${platform.y}px;
                width: ${platform.width}px;
                height: ${platform.height}px;
            `;
            container.appendChild(platformElement);
        });
    }
    
    renderClouds() {
        const container = document.querySelector('.clouds-container');
        
        // Supprimer les anciens nuages
        const oldClouds = container.querySelectorAll('.cloud');
        oldClouds.forEach(cloud => cloud.remove());
        
        // Créer les nouveaux nuages
        this.clouds.forEach(cloud => {
            const cloudElement = document.createElement('div');
            cloudElement.className = `cloud ${cloud.type}`;
            cloudElement.style.cssText = `
                left: ${cloud.x}px;
                top: ${cloud.y}px;
            `;
            container.appendChild(cloudElement);
        });
    }
    
    createJumpParticles() {
        this.createParticles(this.player.x + this.player.width / 2, this.player.y + this.player.height, 5, '#FFD700');
    }
    
    createBounceParticles(platform) {
        this.createParticles(platform.x + platform.width / 2, platform.y, 8, '#FF69B4');
    }
    
    createMagicParticles(platform) {
        this.createParticles(platform.x + platform.width / 2, platform.y, 6, '#9370DB');
    }
    
    createLevelUpParticles() {
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                this.createParticles(
                    Math.random() * this.canvas.width,
                    Math.random() * this.canvas.height,
                    3,
                    ['#FFD700', '#32CD32', '#4169E1'][Math.floor(Math.random() * 3)]
                );
            }, i * 100);
        }
    }
    
    createParticles(x, y, count, color) {
        const container = document.getElementById('particlesContainer');
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 6 + 3;
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 30 + 10;
            const duration = Math.random() * 2 + 1;
            const delay = Math.random() * 0.5;
            
            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: ${color};
                animation-delay: ${delay}s;
                animation-duration: ${duration}s;
            `;
            
            container.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, (duration + delay) * 1000);
        }
    }
    
    gameLoop() {
        this.update();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Démarrer le jeu
let game;
window.addEventListener('load', () => {
    game = new KahinaGame();
});
