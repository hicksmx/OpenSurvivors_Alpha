export class HUDManager {
    constructor(gameScene) {
        this.gameScene = gameScene;
        this.uiScene = gameScene.scene.get('UIScene');
    }

    updateProgress(progress, level = 1) {
        if (this.uiScene) {
            this.uiScene.updateProgress(progress, level);
        }
    }

    updateTimer(time) {
        if (this.uiScene) {
            this.uiScene.updateTimer(time);
        }
    }

    togglePauseMenu() {
        if (this.uiScene) {
            this.uiScene.togglePauseMenu();
        }
    }
}
