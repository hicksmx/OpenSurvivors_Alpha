export class StageManager {
    constructor(scene) {
        this.scene = scene;
        this.tileSprite = null;
    }

    create() {
        // Create checkerboard pattern
        const tileSize = 64;
        const patternSize = tileSize * 2;
        
        const graphics = this.scene.add.graphics();
        
        for (let y = 0; y < 2; y++) {
            for (let x = 0; x < 2; x++) {
                const color = (x + y) % 2 === 0 ? 0x333333 : 0x555555;
                graphics.fillStyle(color, 1);
                graphics.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
        
        graphics.generateTexture('checkerboard', patternSize, patternSize);
        graphics.destroy();
        
        this.tileSprite = this.scene.add.tileSprite(
            this.scene.scale.width / 2, 
            this.scene.scale.height / 2,
            this.scene.scale.width, 
            this.scene.scale.height,
            'checkerboard'
        );
        
        this.tileSprite.setScrollFactor(0);
    }

    update(time, delta) {
        this.tileSprite.tilePositionX = this.scene.cameras.main.scrollX;
        this.tileSprite.tilePositionY = this.scene.cameras.main.scrollY;
    }
}
