import { Enemy } from '../entities/Enemy.js';

export class Conductor {
    constructor(scene, config) {
        this.scene = scene;
        this.entityHandler = scene.entityHandler;
        this.currentPhase = null;
        this.phases = config.phases || [];
        this.maxEnemies = config.maxEnemies || 100;
        this.spawnInterval = config.spawnInterval || 1000;
        this.lastSpawnTime = 0;
        this.gameTime = 0;
        this.debug = true; // Enable debug logging
        this.setupCollisions();
    }

    // Remove addPhase method as phases now come from config

    getCurrentPhase(time) {
        return this.phases.find(phase => 
            time >= phase.startTime && time < phase.endTime
        );
    }

    update(time, delta) {
        this.gameTime += delta / 1000;
        
        if (this.debug) {
            // Log every second
            if (Math.floor(this.gameTime) !== Math.floor(this.gameTime - delta/1000)) {
                console.log('Game time:', Math.floor(this.gameTime));
            }
        }
        
        // Handle enemy positions first, regardless of phase
        this.handleEnemyPositions();
        
        // Then handle phase-specific updates
        const currentPhase = this.getCurrentPhase(this.gameTime);
        
        // Debug phase transitions
        if (currentPhase !== this.currentPhase) {
            if (this.debug) {
                console.log('Phase change:', {
                    from: this.currentPhase,
                    to: currentPhase,
                    time: this.gameTime
                });
            }

            // If we're leaving a phase with an end event, trigger it
            if (this.currentPhase?.phaseEndEvent) {
                if (this.debug) console.log('Triggering phase end event');
                this.handlePhaseEnd(this.currentPhase);
            }
            
            this.currentPhase = currentPhase;
        }

        // Handle regular spawning if we have an active phase
        if (currentPhase && time - this.lastSpawnTime >= this.spawnInterval) {
            this.trySpawnEnemy(currentPhase);
            this.lastSpawnTime = time;
        }
    }

    handlePhaseEnd(phase) {
        if (phase.phaseEndEvent) {
            if (this.debug) console.log('Spawning phase end enemy with difficulty:', phase.phaseEndEvent.difficulty);
            
            const spawnPos = this.getOffScreenSpawnPosition();
            const enemyTypes = this.entityHandler.entityTypes.get('enemy');
            
            // Get enemies matching exact difficulty for end event
            const validEnemies = Object.entries(enemyTypes)
                .filter(([_, config]) => config.difficulty === phase.phaseEndEvent.difficulty);
            
            if (validEnemies.length === 0) {
                if (this.debug) console.log('No enemies found for exact difficulty:', phase.phaseEndEvent.difficulty);
                return;
            }
            
            // Pick random enemy type of appropriate difficulty
            const [enemyName, enemyConfig] = validEnemies[
                Math.floor(Math.random() * validEnemies.length)
            ];
            
            if (this.debug) console.log('Selected enemy type:', enemyName);
            
            const enemy = new Enemy(this.scene, spawnPos.x, spawnPos.y, enemyConfig);
            this.entityHandler.addEntity('enemy', enemy);
            
            // Add collisions with existing enemies
            this.setupEnemyCollisions(enemy);
        }
    }

    getRandomDifficulty(difficultyRange) {
        return difficultyRange[Math.floor(Math.random() * difficultyRange.length)];
    }

    trySpawnEnemy(phase) {
        // Only regular spawns are limited by mob cap
        const enemies = this.entityHandler.getEntitiesOfType('enemy');
        if (enemies.length >= this.maxEnemies) {
            if (this.debug) console.log('Max enemies reached:', enemies.length);
            return;
        }

        const spawnPos = this.getOffScreenSpawnPosition();
        const difficulty = this.getRandomDifficulty(phase.difficultyRange);
        const enemyTypes = this.entityHandler.entityTypes.get('enemy');
        
        // For regular spawns, get enemies matching exact difficulty
        const validEnemies = Object.entries(enemyTypes)
            .filter(([_, config]) => config.difficulty === difficulty);
        
        if (validEnemies.length === 0) return;
        
        // Pick random enemy type
        const [_, enemyConfig] = validEnemies[
            Math.floor(Math.random() * validEnemies.length)
        ];
        
        const enemy = new Enemy(this.scene, spawnPos.x, spawnPos.y, enemyConfig);
        this.entityHandler.addEntity('enemy', enemy);
        
        // Add collisions with existing enemies
        this.setupEnemyCollisions(enemy);
    }

    setupEnemyCollisions(newEnemy) {
        if (!newEnemy.config.collision) return;

        const enemies = this.entityHandler.getEntitiesOfType('enemy');
        enemies.forEach(existingEnemy => {
            if (existingEnemy !== newEnemy && existingEnemy.config.collision) {
                this.scene.physics.add.collider(
                    newEnemy.sprite,
                    existingEnemy.sprite
                );
            }
        });
    }

    handleEnemyPositions() {
        const enemies = this.entityHandler.getEntitiesOfType('enemy');
        
        enemies.forEach(enemy => {
            if (this.isOutsideSpawnRange(enemy.sprite)) {
                const newPos = this.getOffScreenSpawnPosition();
                enemy.sprite.setPosition(newPos.x, newPos.y);
            }
        });
    }

    getOffScreenSpawnPosition() {
        const camera = this.scene.cameras.main;
        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;
        
        const spawnBuffer = 75;
        
        // Calculate camera bounds
        const bounds = {
            left: camera.scrollX - spawnBuffer,
            right: camera.scrollX + gameWidth + spawnBuffer,
            top: camera.scrollY - spawnBuffer,
            bottom: camera.scrollY + gameHeight + spawnBuffer
        };

        // Randomly choose which edge to spawn on (0: top, 1: right, 2: bottom, 3: left)
        const edge = Math.floor(Math.random() * 4);
        
        let x, y;
        switch(edge) {
            case 0: // top edge
                x = bounds.left + (Math.random() * (gameWidth + spawnBuffer * 2));
                y = bounds.top;
                break;
            case 1: // right edge
                x = bounds.right;
                y = bounds.top + (Math.random() * (gameHeight + spawnBuffer * 2));
                break;
            case 2: // bottom edge
                x = bounds.left + (Math.random() * (gameWidth + spawnBuffer * 2));
                y = bounds.bottom;
                break;
            case 3: // left edge
                x = bounds.left;
                y = bounds.top + (Math.random() * (gameHeight + spawnBuffer * 2));
                break;
        }

        return { x, y };
    }

    isOutsideSpawnRange(enemySprite) {
        const camera = this.scene.cameras.main;
        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;

        // Tighter bounds checking - 150px buffer
        const buffer = 150;
        const bounds = {
            left: camera.scrollX - buffer,
            right: camera.scrollX + gameWidth + buffer,
            top: camera.scrollY - buffer,
            bottom: camera.scrollY + gameHeight + buffer
        };

        // Deterministic check - if outside bounds, must teleport
        return (enemySprite.x < bounds.left ||
                enemySprite.x > bounds.right ||
                enemySprite.y < bounds.top ||
                enemySprite.y > bounds.bottom);
    }

    setupCollisions() {
        // Setup collision between enemies
        this.scene.physics.world.on('collide', (obj1, obj2) => {
            // Optional: Add any special collision handling here
        });
    }
}
