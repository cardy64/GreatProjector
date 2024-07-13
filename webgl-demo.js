import Matrix from "./matrix.js";
import Player from "./player.js";
import Vector from "./vector.js";

let player;
let projector;

const files = {};
let gl;

async function loadTextFile(path){
    const result = await fetch(path);
    if (result.status === 200) {
        files[path] = await result.text();
    } else {
        throw new Error("Could not load file '" + path + "'\n" + result.statusText);
    }
}

let monkey;

async function main() {
    await loadTextFile("models/smoothmonkey.obj");

    await loadTextFile("models/monkey.obj");
    await loadTextFile("models/monkey.mtl");

    await loadTextFile("models/painting.obj");
    await loadTextFile("models/testcube.obj");
    await loadTextFile("models/shadesmooth.obj");

    await loadTextFile("models/colortest.obj");
    await loadTextFile("models/colortest.mtl");


    await loadTextFile("models/muse2.obj");
    await loadTextFile("models/muse2.mtl");

    await loadTextFile("shaders/vert.glsl");
    await loadTextFile("shaders/frag.glsl");

    // console.log(importMTL(files["models/colortest.mtl"]));

    init();
}

class Entity {
    constructor(program, meshName) {
        this.meshName = "models/" + meshName;
        this.mesh = Mesh.makeMesh(files[this.meshName + ".obj"], files[this.meshName + ".mtl"], program);
        this.position = new Vector(0);
        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;
        this.scale = 1;
    }

    draw() {
        this.mesh.draw(this.position.x, this.position.y, this.position.z, this.rotationX, this.rotationY, this.rotationZ, this.scale);
    }
}

function init() {

    player = new Player(true);
    projector = new Player(false);

    const canvas = document.querySelector("#glcanvas");

    gl = canvas.getContext("webgl2");

    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, files["shaders/vert.glsl"]);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, files["shaders/frag.glsl"]);
    const program = createProgram(vertexShader, fragmentShader);

    monkey = new Entity(program, "monkey");
    monkey.position.z = 5;
    monkey.position.y = 1.5;
    monkey.scale = 0.5;

    const entities = [
        // new Entity(program, "painting.obj"),
        // new Entity(program, "monkey.obj")
        new Entity(program, "muse2"),
        monkey
    ];

    const matrixUserLocation = gl.getUniformLocation(program, "u_user_matrix");
    const matrixProjectorLocation = gl.getUniformLocation(program, "u_projector_matrix");
    const iTimeLocation = gl.getUniformLocation(program, "i_time");


    // gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    redraw({gl, program, canvas, matrixUserLocation, matrixProjectorLocation, iTimeLocation, entities});
}

function redraw(settings) {

    const {gl, program, canvas, matrixUserLocation, matrixProjectorLocation, iTimeLocation, entities} = settings;

    player.update();

    if (Player.downKeys.includes("ARROWLEFT")) {
        projector.yaw -= 0.02;
    }
    if (Player.downKeys.includes("ARROWRIGHT")) {
        projector.yaw += 0.02;
    }

    monkey.rotationY = Date.now()/1000;

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    gl.useProgram(program);

    gl.viewport(0, 0, canvas.width, canvas.height);

    const m = player.getMatrix(canvas);

    gl.uniformMatrix4fv(matrixUserLocation, true, m.e);
    gl.uniformMatrix4fv(matrixProjectorLocation, true, projector.getMatrix(canvas).e);
    gl.uniform1i(iTimeLocation, Date.now());

    gl.clearColor(0xC2/255, 0xC3/255, 0xC7/255, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (const entity of entities) {
        entity.draw();
    }
    requestAnimationFrame(() => redraw(settings));
}

function createShader(type, source) {
    const shader = gl.createShader(type);
    if (shader === null) {
        throw new Error("Can't create GLSL vertex shader.");
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        const error = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error("Can't create GLSL vertex shader: " + error);
    }

    return shader;
}

function createProgram(vertexShader, fragmentShader) {
    const program = gl.createProgram();
    if (program === null) {
        throw new Error("Can't create GLSL program");
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        const error = gl.getProgramInfoLog();
        gl.deleteProgram(program);
        throw new Error("Can't create GLSL program: " + error);
    }

    return program;
}

function calcNormal(v1, v2, v3) {

    const b = [
        v1[0]-v2[0],
        v1[1]-v2[1],
        v1[2]-v2[2],
    ]
    const a = [
        v3[0]-v2[0],
        v3[1]-v2[1],
        v3[2]-v2[2],
    ]

    return [
        a[1]*b[2] - a[2]*b[1],
        a[2]*b[0] - a[0]*b[2],
        a[0]*b[1] - a[1]*b[0],
    ]
}

class Material {
    constructor(name, diffuse) {
        this.name = name;
        this.diffuse = diffuse;
    }
}

function importMTL(file) {
    const finalMaterials = [];
    const materialTexts = file.split("\nnewmtl ");
    for (const materialText of materialTexts) {
        const lines = ("newmtl " + materialText).split("\n");

        let name = null;
        let diffuse = null;

        for (const line of lines) {
            const words = line.split(" ");
            switch (words[0]) {
                case "newmtl":
                    name = words[1];
                    break;
                case "Kd":
                    diffuse = [parseFloat(words[1]), parseFloat(words[2]), parseFloat(words[3])];
                    break;
            }
        }

        if (name !== null || diffuse !== null) {
            console.log("m - " + name);
            console.log(diffuse);
            if (name === null || diffuse === null) {
                console.error("Material is broken!");
                continue;
            }
            finalMaterials.push(new Material(name, diffuse));
        }
    }
    return finalMaterials;
}

class Mesh {
    constructor(program) {
        this.program = program;
        this.vertexOptions = [];
        this.normalOptions = [];
        this.parts = [];
    }

    static makeMesh(objFile, mtlFile, program) {

        const rawMaterials = importMTL(mtlFile);
        const materials = {};

        rawMaterials.forEach(material => materials[material.name] = material);

        console.log(materials);

        const mesh = new Mesh(program);
        const lines = objFile.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].split(" ");
            switch (line[0]) {
                case "v":
                    const vert = [parseFloat(line[1]), parseFloat(line[2]), parseFloat(line[3])];
                    mesh.vertexOptions.push(vert);
                    break;
                case "vn":
                    const norm = [parseFloat(line[1]), parseFloat(line[2]), parseFloat(line[3])];
                    mesh.normalOptions.push(norm);
                    break;
                case "usemtl":
                    mesh.parts.push(new Part(mesh, materials[line[1]]));
                    break;
                case "f":

                    if (mesh.parts.length === 0) {
                        mesh.parts.push(new Part(mesh, new Material("NoMat", [1, 0, 1])));
                    }

                    const part = mesh.parts[mesh.parts.length - 1];

                    const vertIndexes = [];
                    const normIndexes = [];
                    const length = line.length;
                    for (let j = 1; j < length; j++) {
                        vertIndexes.push(parseInt(line[j].split("/")[0])-1);
                        normIndexes.push(parseInt(line[j].split("/")[2])-1);
                    }
                    for (let j = 1; j < vertIndexes.length - 1; j++) {
                        part.triangles.push(vertIndexes[0], vertIndexes[j], vertIndexes[j+1]);
                        part.normals.push(...mesh.normalOptions[normIndexes[0]]);
                        part.normals.push(...mesh.normalOptions[normIndexes[j]]);
                        part.normals.push(...mesh.normalOptions[normIndexes[j+1]]);
                    }
                    break;
                default:
                    break;
            }
        }
        mesh.bake();
        console.log(mesh);
        return mesh;
    }

    bake() {
        this.parts.forEach(part => part.bake());
    }

    draw(x, y, z, rx, ry, rz, s) {
        this.parts.forEach(part => part.draw(x, y, z, rx, ry, rz, s));
    }
}

class Part {
    constructor(mesh, material) {
        this.mesh = mesh;
        this.material = material;
        this.vertices = [];
        this.triangles = [];
        this.normalOptions = [];
        this.normals = [];
    }

    bake() {
        this.vertices = this.triangles.flatMap(i => this.mesh.vertexOptions[i].concat([1]));

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        const positionAttributeLocation = gl.getAttribLocation(this.mesh.program, "a_position");
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 4, gl.FLOAT, false, 0, 0);

        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
        const normalAttributeLocation = gl.getAttribLocation(this.mesh.program, "a_normal");
        gl.enableVertexAttribArray(normalAttributeLocation);
        gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

        this.colorDifffuseAttributeLocation = gl.getUniformLocation(this.mesh.program, "u_color_diffuse");
        this.objectMatrixAttributeLocation = gl.getUniformLocation(this.mesh.program, "u_object_matrix");
        this.objectRotationMatrixAttributeLocation = gl.getUniformLocation(this.mesh.program, "u_object_rotation_matrix");


        gl.bindVertexArray(null);
    }

    draw(x, y, z, rx, ry, rz, s) {
        gl.uniform3fv(this.colorDifffuseAttributeLocation, this.material.diffuse);
        const objectMatrix = Matrix.
            translation(x ?? 0, y ?? 0, z ?? 0)
            .xRotate(rx ?? 0).yRotate(ry ?? 0).zRotate(rz ?? 0)
            .scale(s ?? 1, s ?? 1, s ?? 1);
        const objectRotationMatrix = Matrix.
            translation(0, 0, 0)
            .xRotate(rx ?? 0).yRotate(ry ?? 0).zRotate(rz ?? 0)
            .scale(1/(s ?? 1), 1/(s ?? 1), 1/(s ?? 1));

        gl.uniformMatrix4fv(this.objectMatrixAttributeLocation, true, objectMatrix.e);
        gl.uniformMatrix4fv(this.objectRotationMatrixAttributeLocation, true, objectRotationMatrix.e)
        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 4);
        gl.bindVertexArray(null);
    }
}


main();
