export class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
        this.progressBar = null;
        this.progressBox = null;
        this.levelText = null;
        this.timerText = null;
        this.isPaused = false;
    }

    create() {
        // Create progress bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background bar at top of screen
        this.progressBg = this.add.rectangle(0, 0, width * 0.7, 20, 0x333333)
            .setPosition(width / 2, 30)
            .setOrigin(0.5, 0.5);

        // Progress bar
        this.progressBar = this.add.rectangle(0, 0, width * 0.7, 20, 0x00ff00)
            .setPosition(width / 2, 30)
            .setOrigin(0.5, 0.5);

        // Set initial scale
        this.progressBar.scaleX = 0;

        // Level text
        this.levelText = this.add.text(width / 2, 30, 'Level 1', {
            font: '16px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5, 0.5);

        // Timer text
        this.timerText = this.add.text(width / 2, 60, '00:00', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5, 0.5);

        // Create pause menu (hidden by default)
        this.createPauseMenu();

        // Set up UI camera
        this.cameras.main.setScroll(0, 0);
        this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0)');
        
        // Keep UI fixed and ignore camera movement
        this.progressBar.setScrollFactor(0);
        this.progressBg.setScrollFactor(0);
        this.levelText.setScrollFactor(0);
        this.timerText.setScrollFactor(0);

        // Remove existing ESC handler and replace with one that always works
        this.input.keyboard.removeAllKeys(true);
        this.input.keyboard.addKey('ESC').on('down', () => {
            this.togglePauseMenu();
        });
    }

    createPauseMenu() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create pause menu container
        this.pauseContainer = this.add.container(0, 0);
        this.pauseContainer.setDepth(100);

        // Background overlay
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        overlay.setOrigin(0, 0);
        
        // Pause text
        const pauseText = this.add.text(width / 2, height / 3, 'PAUSED', {
            font: '32px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Resume button
        const resumeButton = this.add.text(width / 2, height / 2, 'Resume (ESC)', {
            font: '24px Arial',
            fill: '#ffffff'
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.togglePauseMenu());

        this.pauseContainer.add([overlay, pauseText, resumeButton]);
        this.pauseContainer.setVisible(false);
        
        // Set all elements to ignore scroll
        this.pauseContainer.each(child => child.setScrollFactor(0));
    }

    updateProgress(progress, level = 1) {
        if (this.progressBar) {
            progress = Math.min(Math.max(progress, 0), 1);
            this.progressBar.scaleX = progress;
        }
        if (this.levelText) {
            this.levelText.setText(`Level ${level}`);
        }
    }

    updateTimer(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        this.timerText.setText(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }

    togglePauseMenu() {
        this.isPaused = !this.isPaused;
        this.pauseContainer.setVisible(this.isPaused);
        
        const gameScene = this.scene.get('GameScene');
        
        if (this.isPaused) {
            gameScene.scene.pause();
            this.scene.bringToTop();
        } else {
            gameScene.scene.resume(); 
        }
    }

    showLevelUp(items, gameScene) {
        // Store reference to game scene
        this.gameScene = gameScene;
        
        // Disable escape key in game scene
        this.gameScene.input.keyboard.enabled = false;
        
        // Create dark overlay
        const overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7)
            .setOrigin(0)
            .setDepth(100);

        // Level Up text
        const title = this.add.text(this.scale.width/2, 100, 'LEVEL UP!', {
            fontSize: '48px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(100);

        // Store UI elements for cleanup
        this.levelUpElements = [overlay, title];
        
        // Create item options
        this.createItemOptions(items);
    }

    createItemOptions(items) {
        const startY = 200;
        const spacing = 120;

        items.forEach((item, index) => {
            const y = startY + (index * spacing);
            const itemName = item.currentLevel > 0 ? 
                `${item.config.name} (Level ${item.currentLevel + 1})` :
                `${item.config.name} (NEW!)`;

            const button = this.add.rectangle(this.scale.width/2, y, 300, 80, 0x444444)
                .setInteractive()
                .setDepth(100);
            const text = this.add.text(this.scale.width/2, y, itemName, {
                fontSize: '24px',
                fill: '#ffffff'
            }).setOrigin(0.5).setDepth(100);

            button.on('pointerover', () => button.setFillStyle(0x666666));
            button.on('pointerout', () => button.setFillStyle(0x444444));
            button.on('pointerdown', () => this.selectItem(item));

            this.levelUpElements.push(button, text);
        });
    }

    selectItem(item) {
        // Re-enable keyboard for game scene
        this.gameScene.input.keyboard.enabled = true;
        
        if (item) {
            this.gameScene.player.addItem(item.key);
        }

        // Clean up level up UI
        this.levelUpElements.forEach(element => element.destroy());
        this.levelUpElements = [];
        
        // Resume game scene
        this.gameScene.scene.resume();
    }
}
