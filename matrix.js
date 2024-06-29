export default class Matrix {
    constructor(elements) {
        if (elements.length !== 16) {
            throw new Error("Matrix constructor received " + elements.length + " elements, not 16.");
        }
        this.e = elements;
    }

    get(row, column) {
        return this.e[row*4 + column];
    }

    static translation(tx, ty, tz) {
        return new Matrix([
            1,  0,  0,  tx,
            0,  1,  0,  ty,
            0,  0,  1,  tz,
            0,  0,  0,  1,
        ]);
    }

    static xRotation(angleInRadians) {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        return new Matrix([
            1, 0, 0, 0,
            0, c,-s, 0,
            0, s, c, 0,
            0, 0, 0, 1,
        ]);
    }

    static yRotation(angleInRadians) {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        return new Matrix([
            c, 0, s, 0,
            0, 1, 0, 0,
           -s, 0, c, 0,
            0, 0, 0, 1,
        ]);
    }

    static zRotation(angleInRadians) {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        return new Matrix([
            c,-s, 0, 0,
            s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ]);
    }

    static scaling(sx, sy, sz) {

        if (sy === undefined) {
            sy = sx;
            sz = sx;
        }

        return new Matrix([
            sx, 0,  0,  0,
            0, sy,  0,  0,
            0,  0, sz,  0,
            0,  0,  0,  1,
        ]);
    }

    static makePerspective(aspectRatio, expandX, fov) {
        const a = fov/2/180*Math.PI;
        const t = Math.tan(a);

        const x = expandX ? 1/aspectRatio : 1;
        const y = expandX ? 1 : aspectRatio;

        return new Matrix([
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, 0, -1,
            0, 0,-t, 0,
        ])
    }

    translate(tx, ty, tz) {
        return this.multiply(Matrix.translation(tx, ty, tz));
    }

    xRotate(a) {
        return this.multiply(Matrix.xRotation(a));
    }

    yRotate(a) {
        return this.multiply(Matrix.yRotation(a));
    }

    zRotate(a) {
        return this.multiply(Matrix.zRotation(a));
    }

    scale(sx, sy, sz) {
        return this.multiply(Matrix.scaling(sx, sy, sz));
    }

    perspective(aspectRatio, expandX, fov) {
        return this.multiply((Matrix.makePerspective(aspectRatio, expandX, fov)));
    }

    multiply(other) {
        const e = [];

        for (let row = 0; row < 4; row++) {
            for (let column = 0; column < 4; column++) {
                let sum = 0;
                for (let i = 0; i < 4; i++) {
                    sum += this.get(row, i)*other.get(i, column);
                }
                e.push(sum);
            }
        }

        return new Matrix(e);
    }
}



//
// translate: function(m, tx, ty, tz) {
//     return m4.multiply(m, m4.translation(tx, ty, tz));
// },
//
// xRotate: function(m, angleInRadians) {
//     return m4.multiply(m, m4.xRotation(angleInRadians));
// },
//
// yRotate: function(m, angleInRadians) {
//     return m4.multiply(m, m4.yRotation(angleInRadians));
// },
//
// zRotate: function(m, angleInRadians) {
//     return m4.multiply(m, m4.zRotation(angleInRadians));
// },
//
// scale: function(m, sx, sy, sz) {
//     return m4.multiply(m, m4.scaling(sx, sy, sz));
// },
//
// multiply: function(a, b) {
//     var b00 = b[0 * 4 + 0];
//     var b01 = b[0 * 4 + 1];
//     var b02 = b[0 * 4 + 2];
//     var b03 = b[0 * 4 + 3];
//     var b10 = b[1 * 4 + 0];
//     var b11 = b[1 * 4 + 1];
//     var b12 = b[1 * 4 + 2];
//     var b13 = b[1 * 4 + 3];
//     var b20 = b[2 * 4 + 0];
//     var b21 = b[2 * 4 + 1];
//     var b22 = b[2 * 4 + 2];
//     var b23 = b[2 * 4 + 3];
//     var b30 = b[3 * 4 + 0];
//     var b31 = b[3 * 4 + 1];
//     var b32 = b[3 * 4 + 2];
//     var b33 = b[3 * 4 + 3];
//     var a00 = a[0 * 4 + 0];
//     var a01 = a[0 * 4 + 1];
//     var a02 = a[0 * 4 + 2];
//     var a03 = a[0 * 4 + 3];
//     var a10 = a[1 * 4 + 0];
//     var a11 = a[1 * 4 + 1];
//     var a12 = a[1 * 4 + 2];
//     var a13 = a[1 * 4 + 3];
//     var a20 = a[2 * 4 + 0];
//     var a21 = a[2 * 4 + 1];
//     var a22 = a[2 * 4 + 2];
//     var a23 = a[2 * 4 + 3];
//     var a30 = a[3 * 4 + 0];
//     var a31 = a[3 * 4 + 1];
//     var a32 = a[3 * 4 + 2];
//     var a33 = a[3 * 4 + 3];
//
//     return [
//         b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
//         b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
//         b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
//         b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
//         b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
//         b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
//         b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
//         b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
//         b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
//         b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
//         b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
//         b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
//         b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
//         b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
//         b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
//         b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
//     ];
// },
// projection: function(width, height, depth) {
//     // Note: This matrix flips the Y axis so 0 is at the top.
//     return [
//         2 / width, 0, 0, 0,
//         0, -2 / height, 0, 0,
//         0, 0, 2 / depth, 0,
//         -1, 1, 0, 1,
//     ];
// },
//
// // Compute the matrix
// var matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
// matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
// matrix = m4.xRotate(matrix, rotation[0]);
// matrix = m4.yRotate(matrix, rotation[1]);
// matrix = m4.zRotate(matrix, rotation[2]);
// matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);
//
// // Set the matrix.
// gl.uniformMatrix4fv(matrixLocation, false, matrix);
