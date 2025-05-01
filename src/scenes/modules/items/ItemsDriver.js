export class ItemsDriver {
    constructor(scene) {
        this.scene = scene;
        this.items = new Map();
        this.callbacks = new Map();
    }

    registerItem(key, config) {
        this.items.set(key, {
            config,
            level: 0,
            lastUsed: 0,
            callbacks: {
                onLevelUp: config.onLevelUp || (() => {}),
                onCooldownComplete: config.onCooldownComplete || (() => {})
            }
        });
    }

    getAvailableItems(player) {
        const availableItems = [];
        
        for (const [key, item] of this.items) {
            // Check if item can be offered
            if (this.canOfferItem(key, player)) {
                availableItems.push({
                    key,
                    config: item.config,
                    currentLevel: player.getItemLevel(key) || 0
                });
            }
        }

        return this.getRandomSubset(availableItems, 3);
    }

    canOfferItem(itemKey, player) {
        const item = this.items.get(itemKey);
        if (!item) return false;

        const currentLevel = player.getItemLevel(itemKey) || 0;
        const hasSlotAvailable = item.config.active ? 
            player.activeItemSlots.length < 6 :
            player.passiveItemSlots.length < 6;

        return currentLevel < item.config.maxLevel && hasSlotAvailable;
    }

    getRandomSubset(items, count) {
        return items.sort(() => Math.random() - 0.5).slice(0, count);
    }

    update(time, delta) {
        if (!this.scene.player) return;
        
        const player = this.scene.player;
        if (!player.items) return;

        player.items.forEach((itemData, key) => {
            const item = this.items.get(key);
            if (item?.config.active) {
                if (time - itemData.lastUsed >= item.config.cooldown) {
                    item.callbacks.onCooldownComplete(player, itemData.level);
                    itemData.lastUsed = time;
                }
            }
        });
    }
}
