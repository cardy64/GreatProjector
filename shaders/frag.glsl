#version 300 es

precision highp float;

uniform int i_time;
uniform mat4 u_user_matrix;
uniform mat4 u_projector_matrix;
uniform sampler2D uSampler;
uniform vec3 u_color_diffuse;

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
    b = b*0.5+0.5;

    vec4 c1 = vec4(u_color_diffuse*b, 1.0);

    vec4 p = u_projector_matrix * frag_position;

    p.xyz /= p.w;

    vec4 c2 = vec4(vec3(p.xy*2.0, 0.5), 1.0);

    if (int((floor(p.y*300.0) + float(i_time)/500.0)*500.0)/500 % 2 == 0) {
        c2 *= 0.1;
    } else {
        c2 *= 0.16;
    }

//    if (i_time % 2 == 0) {
//        c2 = vec4(1.0, 0.0, 0.0, 1.0);
//    }

    c2.a = 1.0;

    vec4 c3 = c1;

    if (p.z < 0.0 &&
              p.x < 1.0 &&
              p.x > -1.0 &&
              p.y < 1.0 &&
              p.y > -1.0 ) {
        c3 += c2;
    }

    outColor = c3;
}
