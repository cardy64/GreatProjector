#version 300 es

uniform mat4 u_user_matrix;
in vec4 a_position;
in vec3 a_normal;
out vec3 frag_normal;
out vec4 frag_position;

void main() {
    frag_normal = a_normal;
    frag_position = a_position;
    gl_Position = u_user_matrix * a_position;
}
