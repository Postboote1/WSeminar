#version 300 es
precision mediump float;

layout(location=0) in vec2 aposition;
layout(location=1) in vec2 aTexCoords;
layout(location=2) in vec3 acolor;

out vec2 vTexCoords;
out vec3 vcolor;

void main()
{
    gl_Position = vec4(aposition, 0.0 , 1.0);
    vTexCoords = aTexCoords;
    vcolor = acolor;
}