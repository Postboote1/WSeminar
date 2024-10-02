#version 300 es
percision mediump float;

layout(location=0) in vec2 a_position;
layout(location=1) in vec3 a_color;

out vex3 v_color;

void main(){
    
    gl_Position = vex4(a_position, 0.0 , 1.0);
    v_color = a_color
}