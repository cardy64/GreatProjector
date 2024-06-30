#version 300 es

uniform mat4 u_user_matrix;
uniform mat4 u_object_rotation_matrix;
uniform mat4 u_object_matrix;
in vec4 a_position;
in vec3 a_normal;
out vec3 frag_normal;
out vec4 frag_position;

void main() {
    frag_normal = (u_object_rotation_matrix * vec4(a_normal, 1)).xyz;
    frag_position = a_position;
    gl_Position = u_user_matrix * u_object_matrix * a_position;
}
