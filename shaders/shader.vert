#version 300 es

uniform mat4 u_matrix;
in vec4 a_position;
in vec3 a_normal;
out vec3 frag_normal;

void main() {
    frag_normal = a_normal;
    gl_Position = u_matrix * a_position;
}
