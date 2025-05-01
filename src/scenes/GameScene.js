import { Player } from './modules/player/Player.js';
import { StageManager } from './modules/stage/StageManager.js';
import { HUDManager } from './modules/hud/HUDManager.js';
import { Enemy } from './modules/entities/Enemy.js';
import { ExpOrb } from './modules/entities/ExpOrb.js';
import { EntityHandler } from './modules/entities/EntityHandler.js';
import { Conductor } from './modules/conductor/Conductor.js';
import { ExpHandler } from './modules/entities/ExpHandler.js';
import { ItemsDriver } from './modules/items/ItemsDriver.js';
import { LevelUpHUD } from './modules/hud/LevelUpHUD.js';
import { Items } from '../data/items.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player = null;
        this.stageManager = null;
        this.hudManager = null;
        this.gameTime = 0;
    }

    preload() {
        // Get configs from localStorage
        const configs = JSON.parse(localStorage.getItem('gameConfigs'));
        this.cache.json.add('enemyConfig', configs.enemyConfig);
        this.cache.json.add('phaseConfig', configs.phaseConfig);
    }

    init(data) {
        // This is where you'll receive data from the previous scene
        this.gameConfig = data;
    }

    create() {
        // Load configurations
        const enemyConfig = this.cache.json.get('enemyConfig');
        const phaseConfig = this.cache.json.get('phaseConfig');

        // Initialize managers
        this.stageManager = new StageManager(this);
        this.hudManager = new HUDManager(this);
        this.player = new Player(this, this.gameConfig);

        // Initialize entity systems with configs
        this.entityHandler = new EntityHandler(this);
        this.conductor = new Conductor(this, phaseConfig);
        this.expHandler = new ExpHandler(this);
        this.itemsDriver = new ItemsDriver(this);
        this.levelUpHUD = new LevelUpHUD(this);
        
        // Register enemy types
        this.entityHandler.setEntityTypes('enemy', enemyConfig);

        // Register items - only register Items.js items, remove itemsConfig registration
        Object.entries(Items).forEach(([key, config]) => {
            this.itemsDriver.registerItem(key, config);
        });
        
        // Give player starting weapon
        this.player.addItem('FIREBALL');

        // Set up stage and player
        this.stageManager.create();
        this.player.create();

        // Setup camera
        this.cameras.main.startFollow(this.player.sprite, true);
        this.cameras.main.setZoom(1);

        // Ensure scene is active
        this.scene.resume();

        // Launch UI scene if not running
        if (!this.scene.isActive('UIScene')) {
            this.scene.launch('UIScene');
            this.scene.bringToTop('UIScene');
        }

        // Initialize managers
        this.hudManager = new HUDManager(this);
    }

    update(time, delta) {
        if (this.scene.isPaused()) {
            return;
        }

        // Update entity systems
        this.entityHandler.update(time, delta);
        this.conductor.update(time, delta);
        this.expHandler.update(time, delta);
        this.itemsDriver.update(time, delta);

        this.gameTime += delta / 1000;
        this.player.update(time, delta);
        this.stageManager.update(time, delta);

        // Only update timer
        this.hudManager.updateTimer(this.gameTime);
    }
}
