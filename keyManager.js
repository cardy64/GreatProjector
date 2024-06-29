export default class KeyManager {
    constructor() {
        window.addEventListener("keydown", function(e) {
            let key = e.key.toUpperCase();
            if (!KeyManager.downKeys.includes(key)) {
                KeyManager.downKeys.push(key)
            }
        })

        window.addEventListener("keyup", function(e) {
            let key = e.key.toUpperCase();
            if (KeyManager.downKeys.includes(key)) {
                KeyManager.downKeys.splice(KeyManager.downKeys.indexOf(key), 1);
            }
        })

        window.addEventListener("mousedown", function(e) {
            document.querySelector("#glcanvas").requestPointerLock();
        })

        window.addEventListener("mousemove", function(e) {
            KeyManager.dPitch = e.movementY;
            KeyManager.dYaw = e.movementX;
        })
    }
}
