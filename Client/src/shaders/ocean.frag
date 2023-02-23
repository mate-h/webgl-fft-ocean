#version 300 es
precision highp float;
precision highp sampler2D;

in vec2 texcoord;

uniform sampler2D displacement;
uniform sampler2D reflectionSampler;
uniform sampler2D refractionSampler;

in vec3 camPos;
in vec4 wPosition;
in vec4 normalWorld;
in vec4 pos;

in vec4 eyespacePos;
in vec4 clipSpace;

layout(location = 0) out vec4 outputColor;

vec4 getTexture(sampler2D sampler, vec2 coord) {
  vec4 d0 = texture(sampler, coord);
  vec4 d1 = texture(sampler, coord / 8.0) * 8.0;
  vec4 d3 = texture(sampler, coord / 2.0) * 2.0;

  return d0 + d1 + d3;
}

vec3 calcNormals(sampler2D text, vec2 texcoords) {

  float texel = 1.0 / 128.0;
  float texelSize = 2.0 / 128.0;

  vec3 center = getTexture(text, texcoords).xyz;

  vec3 left = vec3(-texelSize, 0.0, 0.0) + getTexture(text, texcoords + vec2(-texel, 0.0)).xyz - center;
  vec3 right = vec3(texelSize, 0.0, 0.0) + getTexture(text, texcoords + vec2(texel, 0.0)).xyz - center;
  vec3 bottom = vec3(0.0, 0.0, texelSize) + getTexture(text, texcoords + vec2(0.0, texel)).xyz - center;
  vec3 top = vec3(0.0, 0.0, -texelSize) + getTexture(text, texcoords + vec2(0.0, -texel)).xyz - center;

  vec3 topRight = cross(right, top);
  vec3 topLeft = cross(top, left);
  vec3 bottomLeft = cross(left, bottom);
  vec3 bottomRight = cross(bottom, right);

  return normalize(bottomRight + bottomLeft + topLeft + topRight);
}

void main(void) {
  vec3 LIGHTCOLOR = vec3(1.0, 1.0, 0.5);
  vec3 SEA_WATER_COLOR = vec3(0.05, 0.2, 0.3);
  vec4 LIGHT_POSITION = vec4(1000.0, 50.0, -1900.0, 1.0);

  float PI = 3.1415;

  vec3 lightDir = normalize(LIGHT_POSITION.xyz);
  vec3 view = normalize(camPos - wPosition.xyz);

  vec3 H = normalize(lightDir + view);
  vec3 normal = calcNormals(displacement, texcoord);

  if(dot(view, normal) < 0.0) {
    normal = reflect(normal, -view);
  }

			//REFLECTION
  vec2 reflectionCoord;
  vec2 refractionCoord;

  reflectionCoord.x = 0.5 * (clipSpace.w + clipSpace.x) / clipSpace.w;
  reflectionCoord.y = 0.5 * (clipSpace.w + clipSpace.y) / clipSpace.w;

			//DISTORTION
  vec4 reflectionTex = texture(reflectionSampler, reflectionCoord + 0.1 * normal.xz);
  vec4 lookup = texture(reflectionSampler, reflectionCoord + 0.1 * normal.xz);

  vec3 refraction = SEA_WATER_COLOR;
  vec3 reflection = reflectionTex.xyz; 

			//COOK TORRANCE 
  float NdotL = max(dot(normal, lightDir), 0.0);

  float specularBRDF = 0.0;
  float refractedBRDF = 0.0;
  float k = 0.1;

			//SPECULAR
  float NdotH = max(dot(normal, H), 0.0);
  float NdotV = max(dot(normal, view), 0.0);
  float VdotH = max(dot(view, H), 0.0);

  float NH2 = 2.0 * NdotH;
  float gb = (NH2 * NdotV) / VdotH;
  float gc = (NH2 * NdotL) / VdotH;
  float geometricalAttenuation = min(1.0, min(gb, gc));

			//DISTRIBUTION
  float constant = 1.0 / (PI * 0.01 * pow(NdotH, 4.0));
  float exponant = (NdotH * NdotH - 1.0) / (0.01 * NdotH * NdotH);
  float roughness = constant * exp(exponant);

  float fresnelMat = pow(1.0 - VdotH, 5.0) * 0.98 + 0.02;

  if(NdotL > 0.0) {
    specularBRDF = (fresnelMat * geometricalAttenuation * roughness) / (NdotV * NdotL * 4.0);
  }

  vec3 cook = LIGHTCOLOR * NdotL * (specularBRDF * (1.0 - k));

  float fresnelWater = 0.02 + 0.98 * pow(1.0 - dot(normal, view), 5.0);

  vec3 color = cook + mix(refraction / PI, reflection, fresnelWater) + vec3(0.1, 0.1, 0.1);
  color += vec3(0.05, 0.3, 0.3) * (wPosition.y * 2.0 / (length(camPos.xyz - wPosition.xyz)));

			//HDR
  color = vec3(1.0) - exp(-1.5 * color);

  outputColor = vec4(reflectionTex.rgb, 1.0);

}