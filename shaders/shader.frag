#version 300 es

precision highp float;
in vec3 frag_normal;
out vec4 outColor;

const vec3 light = normalize(vec3(2.0, 1.0, 1.0));

float hex(int val) {
    return float(val)/255.0;
}

void main() {
    float b = dot(normalize(frag_normal), light);
    b = max(b, 0.0);
    b = b*0.8+0.2;

    outColor = vec4(vec3(hex(0xFF), hex(0xA3), hex(0x00))*b, 1.0);
}
