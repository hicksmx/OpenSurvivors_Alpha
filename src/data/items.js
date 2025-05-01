export const Items = {
    FIREBALL: {
        name: "Fireball",
        description: "Launch a fireball",
        active: true,
        maxLevel: 5,
        cooldown: 1000,
        attackDuration: 500,
        levelStats: {
            damage: [10, 15, 20, 25, 30],
            size: [10, 12, 14, 16, 18]
        },
        // Store last hit time for each enemy
        hitTracker: new Map(),
        
        onCooldownComplete: (player, level) => {
            const stats = Items.FIREBALL.levelStats;
            const damage = stats.damage[level - 1];
            const size = stats.size[level - 1];
            
            // Create fireball
            const fireball = player.scene.add.circle(
                player.sprite.x,
                player.sprite.y,
                size,
                0xff4400
            );
            
            // Add physics
            player.scene.physics.add.existing(fireball);
            
            // Get direction based on player facing
            const angle = player.facingDegrees;
            const speed = 300;
            fireball.body.setVelocity(
                Math.cos(Phaser.Math.DegToRad(angle)) * speed,
                Math.sin(Phaser.Math.DegToRad(angle)) * speed
            );

            // Check collisions
            const checkCollisions = () => {
                if (!fireball.active) return;

                // Cleanup if off screen
                const cam = player.scene.cameras.main;
                if (fireball.x < cam.scrollX - 100 || 
                    fireball.x > cam.scrollX + cam.width + 100 ||
                    fireball.y < cam.scrollY - 100 || 
                    fireball.y > cam.scrollY + cam.height + 100) {
                    fireball.destroy();
                    return;
                }

                // Check enemy collisions
                const enemies = player.scene.entityHandler.getEntitiesOfType('enemy');
                enemies.forEach(enemy => {
                    if (!enemy.sprite.active) return;

                    if (Phaser.Geom.Intersects.CircleToCircle(
                        new Phaser.Geom.Circle(fireball.x, fireball.y, size),
                        new Phaser.Geom.Circle(enemy.sprite.x, enemy.sprite.y, enemy.config.size)
                    )) {
                        const now = Date.now();
                        const lastHit = Items.FIREBALL.hitTracker.get(enemy) || 0;
                        
                        // Check cooldown
                        if (now - lastHit >= 200) {
                            fireball.destroy();
                            //Items.FIREBALL.hitTracker.set(enemy, now);
                            enemy.takeDamage(damage);
                        }
                    }
                });
            };

            // Add update listener
            const updateListener = () => checkCollisions();
            player.scene.events.on('update', updateListener);
            
            // Cleanup on destroy
            fireball.on('destroy', () => {
                player.scene.events.off('update', updateListener);
            });
        }
    }
};
