import Matrix from "./matrix.js";
import Player from "./player.js";

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

async function main() {
    await loadTextFile("models/smoothmonkey.obj");

    await loadTextFile("models/monkey.obj");
    await loadTextFile("models/painting.obj");
    await loadTextFile("models/testcube.obj");
    await loadTextFile("models/shadesmooth.obj");


    await loadTextFile("shaders/vert.glsl");
    await loadTextFile("shaders/frag.glsl");
    init();
}

class Entity {
    constructor(program, meshName) {
        this.meshName = "models/" + meshName;
        this.mesh = importOBJ(files[this.meshName]);

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        const vertices = this.mesh.vertices;
        const normals = this.mesh.normals;

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 4, gl.FLOAT, false, 0, 0);

        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        const normalAttributeLocation = gl.getAttribLocation(program, "a_normal");
        gl.enableVertexAttribArray(normalAttributeLocation);
        gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

        gl.bindVertexArray(null);

        this.vao = vao;
        this.vertices = vertices;
    }

    draw() {
        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 4);
        gl.bindVertexArray(null);

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

    // const vertices = [
    //     -0.5, -0.5, 1, 1,
    //     0.5, -0.5, 1, 1,
    //     0.5, -0.5, 2, 1,
    //
    //     -0.5, -0.5, 1, 1,
    //     0.5, -0.5, 2, 1,
    //     -0.5, -0.5, 2, 1,
    // ]

    const entities = [
        new Entity(program, "painting.obj"),
        new Entity(program, "monkey.obj")
    ];

    const matrixUserLocation = gl.getUniformLocation(program, "u_user_matrix");
    const matrixProjectorLocation = gl.getUniformLocation(program, "u_projector_matrix");


    // gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    redraw({gl, program, canvas, matrixUserLocation, matrixProjectorLocation, entities});
}

function redraw(settings) {
    const {gl, program, canvas, matrixUserLocation, matrixProjectorLocation, entities} = settings;

    player.update();

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    gl.useProgram(program);

    gl.viewport(0, 0, canvas.width, canvas.height);

    const m = player.getMatrix(canvas);

    gl.uniformMatrix4fv(matrixUserLocation, true, m.e);
    gl.uniformMatrix4fv(matrixProjectorLocation, true, projector.getMatrix(canvas).e);


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

function makeMesh(verts, tris, normals) {
    const vertices = tris.flatMap(i => verts[i].concat([1]));
    // const normals = [];
    //
    // for (let i = 0; i < tris.length; i+=3) {
    //     const norm = calcNormal(verts[tris[i]], verts[tris[i+1]], verts[tris[i+2]]);
    //     normals.push(...norm, ...norm, ...norm);
    // }

    return {
        vertices,
        normals,
    }
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

function importOBJ(file) {
    const verts = [];
    const tris = [];
    const normOps = [];
    const norms = [];
    const lines = file.split("\n");
    for (let i = 0; i < lines.length; i++) {
        lines[i] = lines[i].split(" ");
        switch (lines[i][0]) {
            case "v":
                const vert = [parseFloat(lines[i][1]), parseFloat(lines[i][2]), parseFloat(lines[i][3])];
                verts.push(vert);
                break;
            case "vn":
                const norm = [parseFloat(lines[i][1]), parseFloat(lines[i][2]), parseFloat(lines[i][3])];
                normOps.push(norm);
                break;
            case "f":
                const vertIndexes = [];
                const normIndexes = [];
                const length = lines[i].length;
                for (let j = 1; j < length; j++) {
                    vertIndexes.push(parseInt(lines[i][j].split("/")[0])-1);
                    normIndexes.push(parseInt(lines[i][j].split("/")[2])-1);
                }
                for (let j = 1; j < vertIndexes.length - 1; j++) {
                    tris.push(vertIndexes[0], vertIndexes[j], vertIndexes[j+1]);
                    norms.push(...normOps[normIndexes[0]]);
                    norms.push(...normOps[normIndexes[j]]);
                    norms.push(...normOps[normIndexes[j+1]]);
                }
                break;
            default:
                break;
        }
    }
    return makeMesh(verts, tris, norms);
}

main();
