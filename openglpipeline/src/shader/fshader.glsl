#version 300 es
percision mediump float;

in vec3 v_color;

out vex4 fragColor;

void main(){
    fragColor = vex4(v_color, 1.0)
}