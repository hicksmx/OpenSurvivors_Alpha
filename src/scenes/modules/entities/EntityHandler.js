export class EntityHandler {
    constructor(scene) {
        this.scene = scene;
        this.entities = new Map();
        this.entityTypes = new Map();
        this.debug = true;
        console.log('EntityHandler initialized');
    }

    registerEntityType(type) {
        if (!this.entities.has(type)) {
            console.log(`Registering entity type: ${type}`);
            this.entities.set(type, []);
        }
    }

    setEntityTypes(type, config) {
        this.entityTypes.set(type, config);
    }

    getEntityType(type, name) {
        const types = this.entityTypes.get(type);
        return types ? types[name] : null;
    }

    addEntity(type, entity) {
        if (!this.entities.has(type)) {
            if (this.debug) console.log(`Creating new entity array for type: ${type}`);
            this.entities.set(type, []);
        }

        const entityArray = this.entities.get(type);
        entityArray.push(entity);
        
        if (this.debug) console.log(`Added ${type}. Count: ${entityArray.length}`);
    }

    removeEntity(type, entity) {
        if (!this.entities.has(type)) return;
        
        const entityArray = this.entities.get(type);
        const index = entityArray.indexOf(entity);
        
        if (index > -1) {
            entityArray.splice(index, 1);
            if (this.debug) console.log(`Removed ${type}. Count: ${entityArray.length}`);
        }
    }

    getEntitiesOfType(type) {
        return this.entities.get(type) || [];
    }

    getEntityCount(type) {
        return this.getEntitiesOfType(type).length;
    }

    update(time, delta) {
        for (const [type, entities] of this.entities) {
            entities.forEach(entity => {
                if (entity && entity.update) {
                    entity.update(time, delta);
                }
            });
        }
    }
}
