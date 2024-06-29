export default class Vector {
    constructor(x, y, z) {
        if (x === undefined) {
            x = 0;
            y = 0;
            z = 0;
        } else if (y === undefined) {
            y = x;
            z = x;
        } else if (z === undefined) {
            z = 0;
        }
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(x_or_vector, y, z) {
        if (x_or_vector instanceof Vector) {
            this.x += x_or_vector.x;
            this.y += x_or_vector.y;
            this.z += x_or_vector.z;
            return this;
        }
        this.x += x_or_vector;
        this.y += y;
        this.z += z;
        return this;
    }

    subtract(x_or_vector, y, z) {
        if (x_or_vector instanceof Vector) {
            this.x -= x_or_vector.x;
            this.y -= x_or_vector.y;
            this.z -= x_or_vector.z;
            return this;
        }
        this.x -= x_or_vector;
        this.y -= y;
        this.z -= z;
        return this;
    }

    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }

    divide(scalar) {
        this.x /= scalar;
        this.y /= scalar;
        this.z /= scalar;
        return this;
    }

    lengthSquared() {
        return this.x*this.x + this.y*this.y + this.z*this.z;
    }

    length() {
        return Math.sqrt(this.lengthSquared());
    }

    normalize() {
        const length = this.length();
        if (length === 0) return this;
        return this.divide(length);
    }

    rotZ(rad) {
        const x = this.x;
        const y = this.y;
        this.x = x*Math.cos(rad) - y*Math.sin(rad);
        this.y = x*Math.sin(rad) + y*Math.cos(rad);
        return this;
    }
}
