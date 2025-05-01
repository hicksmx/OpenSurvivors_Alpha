export class Enemy {
    constructor(scene, x, y, config) {
        this.scene = scene;
        this.config = config;
        this.health = config.health;
        
        this.sprite = scene.add.circle(x, y, config.size, parseInt(config.color));
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCollideWorldBounds(false);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            const pos = { x: this.sprite.x, y: this.sprite.y };
            const expValue = this.config.expValue || 1;
            
            // Destroy first to prevent any race conditions
            this.destroy();
            
            // Then spawn exp if handler exists
            if (this.scene.expHandler) {
                this.scene.expHandler.spawnExp(pos.x, pos.y, expValue);
            }
            return true;
        }
        return false;
    }

    update(time, delta) {
        const player = this.scene.player.sprite;
        const angle = Phaser.Math.Angle.Between(
            this.sprite.x, this.sprite.y,
            player.x, player.y
        );

        this.sprite.body.setVelocity(
            Math.cos(angle) * this.config.speed,
            Math.sin(angle) * this.config.speed
        );
    }

    destroy() {
        this.scene.entityHandler.removeEntity('enemy', this);
        this.sprite.destroy();
    }
}
