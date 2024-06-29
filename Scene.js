export class Scene {
    constructor() {
        this.objects = [];
        this.worldScripts = [];
        this.startingTime = Date.now();
    }

    getTime() {
        return this.startingTime - Date.now();
    }

    addWorldScript(runnable) {
        this.worldScripts.push(runnable);
    }

    update() {
        for (let runnable of this.worldScripts) runnable();
        for (let object of this.objects) object.update();
    }

    draw() {
        for (let object of this.objects) object.draw();
    }
}

export class Object {
    constructor(x, y, z) {

    }
}