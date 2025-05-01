export class HUDScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HUDScene', active: true });
        this.progressBar = null;
        this.levelText = null;
        this.timeText = null;
        this.pauseMenu = null;
        this.gameScene = null;
    }

    create() {
        this.gameScene = this.scene.get('GameScene');
        this.createProgressBar();
        this.createTexts();
        this.createPauseMenu();
        this.setupEvents();

        // Make sure HUD stays fixed and ignores camera movement
        this.cameras.main.setScrollX(0);
        this.cameras.main.setScrollY(0);
    }

    createProgressBar() {
        const width = this.scale.width * 0.8;
        const height = 30;
        const x = this.scale.width * 0.1;
        const y = 20;

        // Background bar
        this.add.rectangle(x, y, width, height, 0x333333);
        
        // Progress bar
        this.progressBar = this.add.rectangle(x, y, 0, height, 0x00ff00);
        this.progressBar.setOrigin(0, 0.5);
    }

    createTexts() {
        const style = {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff'
        };

        // Level text in middle of progress bar
        this.levelText = this.add.text(
            this.scale.width / 2,
            20,
            'Level 1',
            style
        ).setOrigin(0.5);

        // Time text below level
        this.timeText = this.add.text(
            this.scale.width / 2,
            55,
            '00:00',
            style
        ).setOrigin(0.5);
    }

    createPauseMenu() {
        // Create but hide initially
        this.pauseMenu = this.add.container(this.scale.width / 2, this.scale.height / 2);
        
        const bg = this.add.rectangle(0, 0, 400, 300, 0x000000, 0.8);
        const text = this.add.text(0, -50, 'PAUSED', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        const resumeText = this.add.text(0, 50, 'Press ESC to resume', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.pauseMenu.add([bg, text, resumeText]);
        this.pauseMenu.setVisible(false);

        // Setup pause key
        this.input.keyboard.on('keydown-ESC', () => {
            this.togglePause();
        });
    }

    setupEvents() {
        // Listen for game events
        this.gameScene.events.on('levelChange', this.updateLevel, this);
        this.gameScene.events.on('experienceChange', this.updateProgress, this);
    }

    updateLevel(level) {
        this.levelText.setText(`Level ${level}`);
    }

    updateProgress(currentExp, maxExp) {
        const progress = currentExp / maxExp;
        const width = this.scale.width * 0.8 * progress;
        this.progressBar.width = width;
    }

    updateTime(timeInSeconds) {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        this.timeText.setText(
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
    }

    togglePause() {
        const isPaused = !this.pauseMenu.visible;
        this.pauseMenu.setVisible(isPaused);
        
        if (isPaused) {
            this.gameScene.scene.pause();
        } else {
            this.gameScene.scene.resume();
        }
    }
}
