import { ExpOrb } from './ExpOrb.js';

export class ExpHandler {
    constructor(scene) {
        this.scene = scene;
        this.entityHandler = scene.entityHandler;
        this.collectRadius = 20;
        this.magnetRadius = 100;
        this.pickupSpeed = 300;
        this.maxExpOrbs = 199;
        this.debug = true;
        
        // Register exp type
        this.entityHandler.registerEntityType('exp');
    }

    spawnExp(x, y, value) {
        if (this.debug) console.log('Attempting to spawn exp:', { x, y, value });
        
        try {
            const expOrb = new ExpOrb(this.scene, x, y, value);
            this.entityHandler.addEntity('exp', expOrb);
            
            if (this.debug) console.log('Successfully spawned exp orb');
            return expOrb;
        } catch (error) {
            console.error('Failed to spawn exp:', error);
            return null;
        }
    }

    update(time, delta) {
        if (!this.scene.player || !this.scene.player.sprite) return;

        const player = this.scene.player.sprite;
        const expOrbs = this.entityHandler.getEntitiesOfType('exp');
        if (!expOrbs) return;

        expOrbs.forEach(orb => {
            if (!orb.sprite || !orb.sprite.active) return;

            const distance = Phaser.Math.Distance.Between(
                orb.sprite.x, orb.sprite.y,
                player.x, player.y
            );

            // Collect exp if close enough
            if (distance < this.collectRadius) {
                this.collectExp(orb);
            }
            // Move exp towards player if in magnet range
            else if (distance < this.magnetRadius) {
                const speed = (this.magnetRadius - distance) / this.magnetRadius * this.pickupSpeed;
                orb.moveTo(player.x, player.y, speed * (delta / 1000));
            }
        });
    }

    collectExp(orb) {
        if (this.scene.player.addExp) {
            this.scene.player.addExp(orb.value);
        }
        this.entityHandler.removeEntity('exp', orb);
        orb.destroy();
    }
}
