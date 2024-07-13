import Vector from "./vector.js";
import Matrix from "./matrix.js";

export default class Player {

    static downKeys = [];
    static dPitch = 0;
    static dYaw = 0;
    static lastX = 0;
    static tabbedIn = false;

    constructor(canMove) {
        this.position = new Vector(0, 0, 0);
        this.velocity = new Vector(0);
        this.height = 1.7;
        this.pitch = 0;
        this.yaw = 0;
        this.speed = 0.003;
        this.sensitivity = 0.005;

        this.lastTime = Date.now();
        this.dt = 0;

        if (canMove) {
            window.addEventListener("keydown", function (e) {
                let key = e.key.toUpperCase();
                if (!Player.downKeys.includes(key)) {
                    Player.downKeys.push(key)
                }
                if (e.key === "Escape") {
                    Player.tabbedIn = false;
                }
            })

            window.addEventListener("keyup", function (e) {
                let key = e.key.toUpperCase();
                if (Player.downKeys.includes(key)) {
                    Player.downKeys.splice(Player.downKeys.indexOf(key), 1);
                }
            })

            window.addEventListener("mousedown", function (e) {
                document.querySelector("#glcanvas").requestPointerLock();
                Player.tabbedIn = true;
            })

            window.addEventListener("mousemove", function (e) {
                Player.dPitch = e.movementY;
                Player.dYaw = e.movementX;
            })
        }
    }

    getMatrix(canvas) {
        return Matrix
            .makePerspective(canvas.width/canvas.height, false, 90)
            .xRotate(this.pitch)
            .yRotate(this.yaw)
            .translate(-this.position.x, -this.position.y, -this.position.z)
            .translate(0, -this.height, 0);
    }

    update() {

        const now = Date.now();
        this.dt = now - this.lastTime;
        this.lastTime = now;

        if (!Player.tabbedIn) {
            Player.dPitch = 0;
            Player.dYaw = 0;
            return;
        }
        this.pitch += Player.dPitch * this.sensitivity;
        this.pitch = Math.max(this.pitch, -Math.PI/2);
        this.pitch = Math.min(this.pitch, Math.PI/2);
        this.yaw += Player.dYaw * this.sensitivity;

        Player.dPitch = 0;
        Player.dYaw = 0;

        const vel = new Vector();
        const moves = [
            {key: "W", vec: new Vector(0, -1)},
            {key: "S", vec: new Vector(0, 1)},
            {key: "A", vec: new Vector(-1, 0)},
            {key: "D", vec: new Vector(1, 0)},
        ]
        for (const move of moves) {
            if (Player.downKeys.includes(move.key)) {
                vel.add(move.vec);
            }
        }
        vel.rotZ(this.yaw);
        const runMul = Player.downKeys.includes("SHIFT") ? 2 : 1;
        vel.normalize().multiply(this.speed).multiply(runMul).multiply(this.dt);
        vel.z = vel.y;
        vel.y = 0;
        this.position.add(vel);

        if (Player.downKeys.includes(" ") && this.position.y === 0) {
            this.velocity.y = 0.13;
        }

        if (this.position.y > 0) {
            this.velocity.y -= 0.01;
        }

        this.position.y += this.velocity.y * this.dt / 20;

        if (this.position.y <= 0) {
            this.position.y = 0;
            this.velocity.y = 0;
        }
    }
}
