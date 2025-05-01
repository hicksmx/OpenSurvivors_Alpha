export class LevelUpHUD {
    constructor(scene) {
        this.scene = scene;
        this.container = null;
        this.createHUD();
    }

    createHUD() {
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;

        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(1000);

        // Dark overlay
        const overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        overlay.setOrigin(0);

        // Level Up text
        const title = this.scene.add.text(width/2, 100, 'LEVEL UP!', {
            fontSize: '48px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.container.add([overlay, title]);
        this.container.setVisible(false);
    }

    createItemOptions(items) {
        const startY = 200;
        const spacing = 120;
        const width = this.scene.scale.width;

        items.forEach((item, index) => {
            const y = startY + (index * spacing);
            const itemName = item.currentLevel > 0 ? 
                `${item.config.name} (Level ${item.currentLevel + 1})` :
                `${item.config.name} (NEW!)`;

            const button = this.scene.add.rectangle(width/2, y, 300, 80, 0x444444)
                .setInteractive();
            const text = this.scene.add.text(width/2, y, itemName, {
                fontSize: '24px',
                fill: '#ffffff'
            }).setOrigin(0.5);

            button.on('pointerover', () => {
                button.setFillStyle(0x666666);
            });
            button.on('pointerout', () => {
                button.setFillStyle(0x444444);
            });
            button.on('pointerdown', () => {
                this.selectItem(item);
            });

            this.container.add([button, text]);
        });
    }

    show(availableItems) {
        if (availableItems.length === 0) return false;

        this.scene.scene.pause('GameScene');
        this.container.removeAll();
        this.createHUD();
        this.createItemOptions(availableItems);
        this.container.setVisible(true);
        return true;
    }

    selectItem(item) {
        if (item) {
            this.scene.player.addItem(item.key);
        }
        this.container.setVisible(false);
        this.scene.scene.resume('GameScene');
    }
}
