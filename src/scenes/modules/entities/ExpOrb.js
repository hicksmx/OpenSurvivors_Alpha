export class ExpOrb {
    constructor(scene, x, y, value) {
        this.scene = scene;
        this.value = value;
        
        // Simple visual representation
        const size = value > 5 ? 8 : 5;
        const color = value > 5 ? 0xff0000 : 0x00ff00;
        
        // Create sprite without physics body
        this.sprite = scene.add.circle(x, y, size, color);
    }

    moveTo(x, y, speed) {
        if (!this.sprite || !this.sprite.active) return;
        
        const dx = x - this.sprite.x;
        const dy = y - this.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) return;

        const vx = (dx / distance) * speed;
        const vy = (dy / distance) * speed;
        
        this.sprite.x += vx;
        this.sprite.y += vy;
    }

    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }
    }
}
