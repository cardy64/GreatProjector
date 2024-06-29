#version 300 es

precision highp float;

uniform mat4 u_user_matrix;
uniform mat4 u_projector_matrix;
uniform sampler2D uSampler;

in vec3 frag_normal;
in vec4 frag_position;
out vec4 outColor;

const vec3 light = normalize(vec3(2.0, 1.0, 1.0));

float hex(int val) {
    return float(val)/255.0;
}

void main() {
    float b = dot(normalize(frag_normal), light);
    b = max(b, 0.0);
    b = b*0.8+0.2;

    vec4 c1 = vec4(vec3(hex(0xFF), hex(0xA3), hex(0x00))*b, 1.0);
    vec4 c2 = vec4(vec3(1.0, 0.0, 0.0)*b, 1.0);

    vec4 p = u_projector_matrix * frag_position;

    p.xyz /= p.w;
    vec4 c3 = p.z < 0.0 &&
              p.x < 1.0 &&
              p.x > -1.0 &&
              p.y < 1.0 &&
              p.y > -1.0 ? c2 : c1;

    outColor = c3;
}
