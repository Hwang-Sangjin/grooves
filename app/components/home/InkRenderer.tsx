"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * 노멀 + 뎁스 엣지 검출로 펜 드로잉을 만든다.
 *
 * 매 프레임 씬을 두 번 렌더한다.
 *   1) overrideMaterial = MeshNormalMaterial → 노멀 + 뎁스
 *   2) 원래 머티리얼           → 웜톤 컬러
 * 풀스크린 쿼드에서 엣지를 계산해 그 픽셀만 잉크로 찍고,
 * 나머지는 알파 0 으로 비운다. 그래서 배경이 그대로 비친다.
 *
 * useFrame priority 1 → R3F 기본 렌더가 꺼지고 이 컴포넌트가 렌더를 전담한다.
 */

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  // 이미 클립 공간 좌표(-1..1)이므로 행렬을 곱하지 않는다
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform sampler2D tNormal;
uniform sampler2D tDepth;
uniform sampler2D tColor;
uniform vec2  uTexel;
uniform vec2  uAspect;
uniform vec2  uMouse;
uniform vec3  uInk;
uniform float uWidth;       // 엣지 검출 반경(px)
uniform float uOuter;       // 실루엣 굵기(px)
uniform float uInner;       // 내부 디테일선 굵기(px)
uniform float uInnerAlpha;  // 내부선 농도 — 실루엣보다 연해야 위계가 생긴다
uniform float uBoost;
uniform float uHatchSize;
uniform float uHatchStrength;
uniform float uHatchThreshold;
uniform float uRadius;
uniform float uSoftness;
uniform float uActive;
uniform float uTime;
uniform float uNear;
uniform float uFar;

varying vec2 vUv;

float linDepth(vec2 uv) {
  float z = texture2D(tDepth, uv).x;
  float ndc = z * 2.0 - 1.0;
  return (2.0 * uNear * uFar) / (uFar + uNear - ndc * (uFar - uNear));
}

/** x = 뎁스 엣지(실루엣), y = 노멀 엣지(내부 모서리) */
vec2 edgeAt(vec2 uv) {
  vec2 o = uTexel * uWidth;

  // 뎁스 엣지 (Roberts cross)
  float d00 = linDepth(uv + vec2(-o.x, -o.y));
  float d11 = linDepth(uv + vec2( o.x,  o.y));
  float d10 = linDepth(uv + vec2( o.x, -o.y));
  float d01 = linDepth(uv + vec2(-o.x,  o.y));
  float dEdge = abs(d00 - d11) + abs(d10 - d01);
  float dc = linDepth(uv);
  // 임계값을 거리에 비례시켜야 멀리 있는 면이 통째로 칠해지지 않는다
  dEdge = smoothstep(0.015 * dc, 0.05 * dc, dEdge);

  // 노멀 엣지
  vec3 n00 = texture2D(tNormal, uv + vec2(-o.x, -o.y)).xyz * 2.0 - 1.0;
  vec3 n11 = texture2D(tNormal, uv + vec2( o.x,  o.y)).xyz * 2.0 - 1.0;
  vec3 n10 = texture2D(tNormal, uv + vec2( o.x, -o.y)).xyz * 2.0 - 1.0;
  vec3 n01 = texture2D(tNormal, uv + vec2(-o.x,  o.y)).xyz * 2.0 - 1.0;
  float nEdge = length(n00 - n11) + length(n10 - n01);
  nEdge = smoothstep(0.5, 1.0, nEdge);

  return vec2(dEdge, nEdge);
}

/** 반경 r 만큼 주변에서 다시 계산해 최댓값 — 선이 경계에 붙은 채로 굵어진다 */
vec2 dilate(vec2 uv, float r) {
  vec2 t = uTexel * r;
  vec2 e = edgeAt(uv);
  e = max(e, edgeAt(uv + vec2( t.x,  0.0)));
  e = max(e, edgeAt(uv + vec2(-t.x,  0.0)));
  e = max(e, edgeAt(uv + vec2( 0.0,  t.y)));
  e = max(e, edgeAt(uv + vec2( 0.0, -t.y)));
  e = max(e, edgeAt(uv + vec2( t.x,  t.y) * 0.7));
  e = max(e, edgeAt(uv + vec2(-t.x, -t.y) * 0.7));
  e = max(e, edgeAt(uv + vec2( t.x, -t.y) * 0.7));
  e = max(e, edgeAt(uv + vec2(-t.x,  t.y) * 0.7));
  return e;
}

void main() {
  // 실루엣은 굵게, 내부선은 가늘게 — 이 위계가 손그림 느낌을 만든다
  float outer = dilate(vUv, uOuter).x;
  float inner = dilate(vUv, uInner).y;

  outer = clamp(outer * uBoost, 0.0, 1.0);
  inner = clamp(inner * uBoost, 0.0, 1.0) * uInnerAlpha;

  float edge = max(outer, inner);

  vec4 col = texture2D(tColor, vUv);

  // 정말 어두운 면에만 빗금 (uHatchStrength 0 이면 꺼진다)
  float lum = dot(col.rgb, vec3(0.299, 0.587, 0.114));
  float stripe = step(0.62, fract((gl_FragCoord.x + gl_FragCoord.y) / uHatchSize));
  float dark = 1.0 - smoothstep(uHatchThreshold * 0.4, uHatchThreshold, lum);
  float hatch = dark * stripe * col.a * uHatchStrength;

  float inkAmt = clamp(max(edge * col.a, hatch), 0.0, 1.0);
  vec4 inkCol = vec4(uInk, inkAmt);

  // --- 커서 리빌 : 원 안은 실제 웜톤 컬러
  vec2  d = (vUv - uMouse) * uAspect;
  float dist = length(d);
  float ang  = atan(d.y, d.x);
  float wobble = 0.07 * sin(ang * 3.0 + uTime * 0.5)
               + 0.04 * sin(ang * 5.0 - uTime * 0.35);
  float r = uRadius * (1.0 + wobble);
  float reveal = (1.0 - smoothstep(r - uSoftness, r + uSoftness, dist)) * uActive;

  gl_FragColor = mix(inkCol, col, reveal);
}
`;

type Props = {
  ink?: string;
  /** 엣지 검출 반경(px). 1.0~1.6 — 키우면 이중선이 생긴다 */
  width?: number;
  /** 실루엣 굵기(px) */
  outer?: number;
  /** 내부 디테일선 굵기(px) */
  inner?: number;
  /** 내부선 농도 — 1 보다 작아야 위계가 생긴다 */
  innerAlpha?: number;
  /** 선 진하기 */
  boost?: number;
  /** 빗금 간격(px) */
  hatchSize?: number;
  /** 빗금 농도. 0 이면 해칭 없음 */
  hatchStrength?: number;
  /** 이 밝기보다 어두운 면에만 빗금 */
  hatchThreshold?: number;
  /** 리빌 반경 (세로 UV 기준) */
  radius?: number;
  softness?: number;
};

export default function InkRenderer({
  ink = "#2b3a8c",
  width = 1.2,
  outer = 2.6,
  inner = 0.9,
  innerAlpha = 0.55,
  boost = 2.2,
  hatchSize = 7,
  hatchStrength = 0,
  hatchThreshold = 0.22,
  radius = 0.26,
  softness = 0.08,
}: Props) {
  const { gl, scene, camera, size, viewport } = useThree();

  const dpr = viewport.dpr || 1;
  const w = Math.max(1, Math.floor(size.width * dpr));
  const h = Math.max(1, Math.floor(size.height * dpr));

  // FBO 두 벌. 뎁스 텍스처는 노멀 쪽에만 붙인다.
  // 멀티샘플 타깃은 뎁스를 직접 샘플할 수 없으므로 노멀 FBO 는 samples 0.
  const { normalFBO, colorFBO } = useMemo(() => {
    const depth = new THREE.DepthTexture(w, h);
    depth.type = THREE.UnsignedIntType;

    const n = new THREE.WebGLRenderTarget(w, h, {
      depthTexture: depth,
      depthBuffer: true,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
    });

    const c = new THREE.WebGLRenderTarget(w, h, { samples: 4 });
    // 이 텍스처를 그대로 화면에 내보내므로 sRGB 로 인코딩된 상태여야 한다
    c.texture.colorSpace = THREE.SRGBColorSpace;

    return { normalFBO: n, colorFBO: c };
  }, [w, h]);

  useEffect(() => {
    return () => {
      normalFBO.depthTexture?.dispose();
      normalFBO.dispose();
      colorFBO.dispose();
    };
  }, [normalFBO, colorFBO]);

  const normalMat = useMemo(() => new THREE.MeshNormalMaterial(), []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          tNormal: { value: null },
          tDepth: { value: null },
          tColor: { value: null },
          uTexel: { value: new THREE.Vector2() },
          uAspect: { value: new THREE.Vector2(1, 1) },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uInk: { value: new THREE.Color(ink) },
          uWidth: { value: width },
          uOuter: { value: outer },
          uInner: { value: inner },
          uInnerAlpha: { value: innerAlpha },
          uBoost: { value: boost },
          uHatchSize: { value: hatchSize },
          uHatchStrength: { value: hatchStrength },
          uHatchThreshold: { value: hatchThreshold },
          uRadius: { value: radius },
          uSoftness: { value: softness },
          uActive: { value: 0 },
          uTime: { value: 0 },
          uNear: { value: 0.1 },
          uFar: { value: 100 },
        },
      }),
    [
      ink,
      width,
      outer,
      inner,
      innerAlpha,
      boost,
      hatchSize,
      hatchStrength,
      hatchThreshold,
      radius,
      softness,
    ],
  );

  // 풀스크린 쿼드 전용 씬 — 본 씬에 섞이면 안 된다
  const quad = useMemo(() => {
    const s = new THREE.Scene();
    s.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
    return s;
  }, [material]);

  const quadCam = useMemo(() => new THREE.Camera(), []);

  // 텍스처 · 해상도 의존 유니폼은 리사이즈마다 갱신
  useEffect(() => {
    const u = material.uniforms;
    u.tNormal.value = normalFBO.texture;
    u.tDepth.value = normalFBO.depthTexture;
    u.tColor.value = colorFBO.texture;
    u.uTexel.value.set(1 / w, 1 / h);
    u.uAspect.value.set(size.width / size.height, 1);
  }, [material, normalFBO, colorFBO, w, h, size]);

  // 커서 — R3F pointer 는 캔버스 밖에서 멈추므로 DOM 이벤트로 직접 잡는다
  const target = useRef(new THREE.Vector2(0.5, 0.5));
  const current = useRef(new THREE.Vector2(0.5, 0.5));
  const activeTarget = useRef(0);
  const active = useRef(0);

  useEffect(() => {
    const el = gl.domElement;
    const toUv = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return [
        (e.clientX - r.left) / r.width,
        1 - (e.clientY - r.top) / r.height,
      ] as const;
    };

    const onMove = (e: PointerEvent) => {
      const [x, y] = toUv(e);
      target.current.set(x, y);
      activeTarget.current = 1;
    };
    const onEnter = (e: PointerEvent) => {
      const [x, y] = toUv(e);
      current.current.set(x, y); // 화면을 가로질러 날아오지 않게
      target.current.set(x, y);
      activeTarget.current = 1;
    };
    const onLeave = () => {
      activeTarget.current = 0;
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [gl]);

  useFrame((_, dt) => {
    // 프레임레이트와 무관한 감쇠
    const follow = 1 - Math.pow(0.0015, dt);
    const fade = 1 - Math.pow(0.02, dt);
    current.current.lerp(target.current, follow);
    active.current += (activeTarget.current - active.current) * fade;

    const cam = camera as THREE.PerspectiveCamera;
    const u = material.uniforms;
    u.uMouse.value.copy(current.current);
    u.uActive.value = active.current;
    u.uTime.value += dt;
    u.uNear.value = cam.near;
    u.uFar.value = cam.far;

    const prevAlpha = gl.getClearAlpha();
    gl.setClearColor(0x000000, 0);

    // 1) 노멀 + 뎁스
    scene.overrideMaterial = normalMat;
    gl.setRenderTarget(normalFBO);
    gl.clear();
    gl.render(scene, camera);

    // 2) 웜톤 컬러
    scene.overrideMaterial = null;
    gl.setRenderTarget(colorFBO);
    gl.clear();
    gl.render(scene, camera);

    // 3) 화면에는 잉크만
    gl.setRenderTarget(null);
    gl.clear();
    gl.render(quad, quadCam);

    gl.setClearAlpha(prevAlpha);
  }, 1);

  return null;
}
