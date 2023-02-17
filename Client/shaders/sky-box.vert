precision mediump float;
uniform mat4 projMatrix;
uniform mat4 viewMatrix;

attribute vec2 texCoord;
attribute vec3 position;

varying vec2 texcoord;
varying vec3 wPos;
varying vec4 scaledPos;

varying float size;

void main(void) {
  texcoord = texCoord;
  wPos = position;
  size = 2000.0;

  scaledPos = vec4(position.x * size, position.y * size, position.z * size, 1.0);

  gl_Position = projMatrix * viewMatrix * vec4(position.x * size, position.y * size, position.z * size, 1.0);

}