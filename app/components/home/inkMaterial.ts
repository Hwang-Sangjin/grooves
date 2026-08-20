import * as THREE from "three";

/**
 * 펜 드로잉 머티리얼.
 *
 * 면은 종이색 그대로 두고, 빛이 닿지 않는 쪽만 잉크 빗금으로 채운다.
 * 후처리가 아니라 오브젝트 자신이 이렇게 그려지므로,
 * 빈 공간은 건드리지 않고 페이지 배경이 그대로 비친다.
 */
const vertexShader = /* glsl */ `
varying vec3 vNormal;

void main() {
  // 뷰 공간 노멀 — 카메라가 움직여도 음영 방향이 일정하다
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
varying vec3 vNormal;

uniform vec3  uPaper;
uniform vec3  uInk;
uniform vec3  uLightDir;
uniform float uHatchSize;  // 빗금 간격(px). 작을수록 촘촘
uniform float uShadeBias;

float hatch(vec2 p, float angle) {
  float v = sin(p.x * cos(angle) + p.y * sin(angle));
  return smoothstep(0.42, 0.0, abs(v));
}

void main() {
  float ndl = dot(normalize(vNormal), normalize(uLightDir));
  float shade = clamp(1.0 - (ndl * 0.5 + 0.5) + uShadeBias, 0.0, 1.0);

  // 화면 픽셀 기준 빗금 — 종이 위에 그어진 선처럼 고정된다
  vec2 p = gl_FragCoord.xy / uHatchSize;

  float h1 = hatch(p,  0.7) * smoothstep(0.42, 0.52, shade);
  float h2 = hatch(p, -0.7) * smoothstep(0.66, 0.76, shade);
  float solid = smoothstep(0.90, 0.98, shade);

  float ink = clamp(max(max(h1, h2), solid), 0.0, 1.0);
  gl_FragColor = vec4(mix(uPaper, uInk, ink), 1.0);
}
`;

export function createInkMaterial({
  paper = "#f3ebd9",
  ink = "#2b3a8c",
  hatchSize = 7,
  shadeBias = 0,
} = {}) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uPaper: { value: new THREE.Color(paper) },
      uInk: { value: new THREE.Color(ink) },
      // 왼쪽 위에서 들어오는 빛 (뷰 공간 기준)
      uLightDir: { value: new THREE.Vector3(-0.4, 0.8, 0.6).normalize() },
      uHatchSize: { value: hatchSize },
      uShadeBias: { value: shadeBias },
    },
  });
}
