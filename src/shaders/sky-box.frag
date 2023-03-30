precision highp float;

varying vec2 texcoord;
varying vec3 wPos;
varying vec4 scaledPos;
varying float size;

uniform sampler2D texture;
uniform vec3 cameraPosition;

uniform vec4 clipplane;
uniform float isclipped;

const float Pi = 3.1415;

vec3 grad(float dist, vec3 lightColor) {
  return max(exp(-pow(dist, 0.85)) * lightColor - 0.1, 0.0);
}

void main(void) {
  vec4 LIGHT_POSITION = vec4(1000.0, 30.0, -1900.0, 1.0);

  float lightDistance = length(LIGHT_POSITION.xyz);

  float clampedDistance = clamp(lightDistance, 0.0, 1.0);
  float sun = clamp(1.0 - smoothstep(0.1, 0.1, clampedDistance), 0.0, 1.0);

  float h = wPos.y + 0.01;
  h = (0.25 * mix(clampedDistance, 1.0, h)) / h;

  vec3 gradient = grad(lightDistance, vec3(0.5));

  vec3 color = h * vec3(0.32, 0.6, 1.0);

  color = max(color, 0.0);

  color = max(mix(pow(color, 1.0 - color), color / (2.0 * color + 0.5 - color), clamp(LIGHT_POSITION.y * 2.0, 0.0, 1.0)), 0.0) + sun + gradient;

  if(isclipped == 1.0 && dot(scaledPos, clipplane) >= 0.0) {
    discard;
  }

  if(wPos.y < -0.01)
    gl_FragColor = vec4(0.05, 0.2, 0.25, 1.0);
  else
    gl_FragColor = vec4(color, 1.0); //SKY COLOR

			//SUN
  float r = 0.00052; //SUN RADIUS

  for(float i = 0.0; i < Pi * 2.0; i += 0.1) {
    float x = cos(i) * 0.015 + 0.62 - wPos.x;
    float y = sin(i) * 0.015 + 0.2 - wPos.y;

    vec2 uv = vec2(wPos.x - 0.62, wPos.y - 0.2);
    uv = vec2(1.0, -1.0) * uv;

    if(x * x + y * y < r) {
      vec4 sunColor = vec4(1.2, 1.2, 1.2, 1.0);
      float d = length(uv);
      float u = smoothstep(sqrt(r) + 0.0079, sqrt(r) - 0.0079, d);
      float v = smoothstep(sqrt(r) + 0.0160, sqrt(r) - 0.0160, d);

      vec4 sunColorResult = mix(vec4(color, 1.0), sunColor, u) + v * mix(vec4(2.0, 2.0, 0.0, 1.0), vec4(1.0, 0.0, 0.0, 1.0), 0.8);

      gl_FragColor = sunColorResult;
    }
  }
}