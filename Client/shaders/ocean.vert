#version 300 es
precision mediump float;
precision highp sampler2D;

uniform mat4 projMatrix;
uniform mat4 viewMatrix;
uniform mat4 birdviewMatrix;

uniform vec3 cameraPosition;

uniform mat4 invProjMatrix;
uniform mat4 invViewMatrix;

uniform sampler2D displacement;

in vec3 position;
in vec2 texCoord;

out vec2 texcoord;
out vec4 clipSpace;

out vec4 wPosition;
out vec4 pos;
out vec3 camPos;

vec4 getTexture(sampler2D sampler, vec2 coord) {
  vec4 d0 = texture(sampler, coord);
  vec4 d1 = texture(sampler, coord / 8.0) * 8.0;
  vec4 d3 = texture(sampler, coord / 2.0) * 2.0;

  return d0 + d1 + d3;
}

void main(void) {

  vec3 cameraSpace = normalize((invProjMatrix * vec4(position.x, position.z, 0.0, 1.0)).xyz);
  vec3 worldSpace = (invViewMatrix * vec4(cameraSpace, 0.0)).xyz;

  float t = (-cameraPosition.y) / worldSpace.y;

  vec3 u = (cameraPosition + t * worldSpace);

  texcoord = (u.xz + 1.0) * 0.5;

  vec4 d = getTexture(displacement, texcoord);

  camPos = cameraPosition;

            //ATTENUATION HORIZONT
  float att = 4.0 / pow(length(camPos - u), 1.0 / 2.0);

  u.y = (d.y) * att;
  u.x = (u.x + d.x);
  u.z = (u.z + d.z);

  wPosition = vec4(u.x, u.y, u.z, 1.0);

  clipSpace = projMatrix * viewMatrix * vec4(u, 1.0);

  pos = (viewMatrix * vec4(worldSpace, 1.0));

  if(t > 0.0) {
    gl_Position = projMatrix * viewMatrix * vec4(u, 1.0);
  } else {
    gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
  }
}