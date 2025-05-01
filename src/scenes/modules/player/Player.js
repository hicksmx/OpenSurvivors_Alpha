export class Player {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.sprite = null;
        this.speed = 400;
        this.cursors = null;
        
        // Initialize stats with default values
        this.stats = {
            level: 1,
            exp: 0,
            nextLevelExp: 10
        };

        // Custom code callback storage
        this.customCallbacks = {
            onLevelUp: null,
            onTimeInterval: null
        };

        this.facingDegrees = 0;
        this.lastPosition = { x: 0, y: 0 };

        this.items = new Map();
        this.activeItemSlots = [];
        this.passiveItemSlots = [];
    }

    create() {
        const playerRadius = 20;
        this.sprite = this.scene.add.circle(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            playerRadius,
            0xff0000
        );
        
        this.scene.physics.add.existing(this.sprite);
        this.sprite.body.setCollideWorldBounds(false);
        
        this.cursors = this.scene.input.keyboard.createCursorKeys();

        this.lastPosition = { x: this.sprite.x, y: this.sprite.y };
    }

    update(time, delta) {
        this.handleMovement();
        this.updateFacingDegrees();
        //this.hudManager.updateProgress(this.stats.exp)
        this.checkCustomTimeCallback(time);
    }

    handleMovement() {
        let dx = 0;
        let dy = 0;

        if (this.cursors.up.isDown) dy = -1;
        else if (this.cursors.down.isDown) dy = 1;
        if (this.cursors.left.isDown) dx = -1;
        else if (this.cursors.right.isDown) dx = 1;

        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            // Scale by 1/sqrt(2) to maintain consistent speed
            dx *= 0.707;
            dy *= 0.707;
        }

        this.sprite.body.setVelocity(
            dx * this.speed,
            dy * this.speed
        );
    }

    addExp(amount) {
        this.stats.exp += amount;
        console.log(`Adding ${amount} exp. Current: ${this.stats.exp}/${this.stats.nextLevelExp}`);
        
        // Update HUD with level info
        if (this.scene.hudManager) {
            const progress = this.stats.exp / this.stats.nextLevelExp;
            this.scene.hudManager.updateProgress(progress, this.stats.level);
        }

        // Check for level up
        if (this.stats.exp >= this.stats.nextLevelExp) {
            this.levelUp();
        }
    }

    levelUp() {
        this.stats.level++;
        this.stats.exp = 0;
        this.stats.nextLevelExp = this.calculateNextLevelExp();
        
        // Update HUD after level up
        if (this.scene.hudManager) {
            this.scene.hudManager.updateProgress(0, this.stats.level);
        }

        // Show level up options in UI Scene
        const availableItems = this.scene.itemsDriver.getAvailableItems(this);
        if (availableItems.length > 0) {
            this.scene.scene.pause();
            const uiScene = this.scene.scene.get('UIScene');
            uiScene.showLevelUp(availableItems, this.scene);
        }
        
        console.log(`Level up! ${this.stats.level} (Next level at: ${this.stats.nextLevelExp})`);
    }

    calculateNextLevelExp() {
        // Basic exponential curve: 100 * (level ^ 1.5)
        return Math.floor(10 * Math.pow(this.stats.level, 1.5));
    }

    setCustomCallback(type, callback) {
        if (this.customCallbacks.hasOwnProperty(type)) {
            this.customCallbacks[type] = callback;
        }
    }

    checkCustomTimeCallback(time) {
        if (this.customCallbacks.onTimeInterval) {
            this.customCallbacks.onTimeInterval(this, time);
        }
    }

    updateFacingDegrees() {
        // Only update facing if we've moved
        if (this.sprite.x !== this.lastPosition.x || this.sprite.y !== this.lastPosition.y) {
            const dx = this.sprite.x - this.lastPosition.x;
            const dy = this.sprite.y - this.lastPosition.y;
            
            // Calculate angle in radians and convert to degrees
            this.facingDegrees = Phaser.Math.RadToDeg(Math.atan2(dy, dx));
            
            // Debug output - round to 2 decimal places
            console.log('Facing degrees:', Math.round(this.facingDegrees * 100) / 100);
            
            // Store current position for next frame
            this.lastPosition.x = this.sprite.x;
            this.lastPosition.y = this.sprite.y;
        }
    }

    addItem(itemKey) {
        const itemData = this.scene.itemsDriver.items.get(itemKey);
        if (!itemData) return;

        if (!this.items.has(itemKey)) {
            // New item
            this.items.set(itemKey, {
                level: 1,
                lastUsed: 0
            });

            // Add to appropriate slot array
            if (itemData.config.active) {
                this.activeItemSlots.push(itemKey);
            } else {
                this.passiveItemSlots.push(itemKey);
            }
        } else {
            // Level up existing item
            const playerItem = this.items.get(itemKey);
            playerItem.level++;
        }

        // Trigger level up callback
        itemData.callbacks.onLevelUp(this, this.items.get(itemKey).level);
    }

    getItemLevel(itemKey) {
        return this.items.get(itemKey)?.level || 0;
    }
}
