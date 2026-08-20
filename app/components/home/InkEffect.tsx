"use client";

import { forwardRef, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Effect } from "postprocessing";
import { Color, Uniform, Vector2 } from "three";

/**
 * 펜 드로잉 변환 + 커서 리빌.
 *
 * 씬은 웜톤 실제 색으로 렌더되고, 이 패스가 밝기를 해칭(빗금)으로 바꿔
 * 잉크로 그린 것처럼 만든다. 면을 통째로 칠하지 않고 선으로 음영을 주는 게
 * 핵심 — 그래야 오래된 음악 잡지의 삽화처럼 보인다.
 * 커서 주변에서는 이 변환을 끄고 원래 웜톤 색이 드러난다.
 */
const fragmentShader = /* glsl */ `
uniform vec2  uMouse;     // 캔버스 UV (0..1)
uniform vec2  uAspect;    // 원이 찌그러지지 않게 보정
uniform float uRadius;    // 세로 UV 기준 반경
uniform float uSoftness;  // 경계 흐림
uniform float uActive;    // 커서가 안에 있으면 1
uniform float uTime;
uniform vec3  uInk;
uniform vec3  uPaper;
uniform float uHatchScale;
uniform float uShadeBias;

// 한 방향의 빗금 한 겹
float hatchLine(vec2 p, float angle) {
  float v = sin(p.x * cos(angle) + p.y * sin(angle));
  return smoothstep(0.16, 0.0, abs(v));
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float l = dot(inputColor.rgb, vec3(0.2126, 0.7152, 0.0722));
  float shade = clamp(1.0 - l + uShadeBias, 0.0, 1.0);

  // 화면 좌표 기준 해칭 — 오브젝트가 움직여도 종이에 그은 선처럼 고정된다
  vec2 p = uv * uAspect * uHatchScale;

  // 어두워질수록 빗금이 한 겹씩 겹친다 (동판화의 크로스해칭)
  float h1 = hatchLine(p,  0.55) * smoothstep(0.20, 0.30, shade);
  float h2 = hatchLine(p, -0.55) * smoothstep(0.40, 0.50, shade);
  float h3 = hatchLine(p,  1.75) * smoothstep(0.60, 0.70, shade);
  float solid = smoothstep(0.88, 0.96, shade); // 가장 어두운 곳만 채운다

  float ink = clamp(max(max(h1, h2), max(h3, solid)), 0.0, 1.0) * inputColor.a;
  vec3 drawn = mix(uPaper, uInk, ink);

  // --- 커서 주변에서는 변환이 풀린다 ---
  // 완전한 원이 아니라 각도에 따라 반경이 흔들리는 유기적 형태
  vec2  d = (uv - uMouse) * uAspect;
  float dist = length(d);
  float ang  = atan(d.y, d.x);
  float wobble = 0.07 * sin(ang * 3.0 + uTime * 0.5)
               + 0.04 * sin(ang * 5.0 - uTime * 0.35);
  float r = uRadius * (1.0 + wobble);
  float reveal = (1.0 - smoothstep(r - uSoftness, r + uSoftness, dist)) * uActive;

  outputColor = vec4(mix(drawn, inputColor.rgb, reveal), inputColor.a);
}
`;

class InkEffectImpl extends Effect {
  constructor({
    ink = "#2b3a8c",
    paper = "#fceedb",
    radius = 0.26,
    softness = 0.12,
    hatchScale = 260,
    shadeBias = 0,
  } = {}) {
    super("InkEffect", fragmentShader, {
      uniforms: new Map<string, Uniform>([
        ["uMouse", new Uniform(new Vector2(0.5, 0.5))],
        ["uAspect", new Uniform(new Vector2(1, 1))],
        ["uRadius", new Uniform(radius)],
        ["uSoftness", new Uniform(softness)],
        ["uActive", new Uniform(0)],
        ["uTime", new Uniform(0)],
        ["uInk", new Uniform(new Color(ink))],
        ["uPaper", new Uniform(new Color(paper))],
        ["uHatchScale", new Uniform(hatchScale)],
        ["uShadeBias", new Uniform(shadeBias)],
      ]),
    });
  }
}

type Props = {
  radius?: number;
  softness?: number;
  /** 빗금 밀도 — 크면 촘촘해진다 */
  hatchScale?: number;
  /** 잉크가 부족하면 올리고(0.1~0.2), 너무 시커멓면 내린다(-0.1) */
  shadeBias?: number;
};

const InkEffect = forwardRef<InkEffectImpl, Props>(function InkEffect(
  { radius = 0.26, softness = 0.12, hatchScale = 260, shadeBias = 0 },
  ref,
) {
  const effect = useMemo(
    () => new InkEffectImpl({ radius, softness, hatchScale, shadeBias }),
    [radius, softness, hatchScale, shadeBias],
  );

  const { gl, size } = useThree();
  const target = useRef(new Vector2(0.5, 0.5));
  const current = useRef(new Vector2(0.5, 0.5));
  const activeTarget = useRef(0);
  const active = useRef(0);

  useEffect(() => {
    const el = gl.domElement;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.current.set(
        (e.clientX - r.left) / r.width,
        1 - (e.clientY - r.top) / r.height, // UV 는 아래가 0
      );
      activeTarget.current = 1;
    };
    const onEnter = (e: PointerEvent) => {
      // 들어온 지점으로 순간이동시켜야 화면을 가로지르며 날아오지 않는다
      const r = el.getBoundingClientRect();
      current.current.set(
        (e.clientX - r.left) / r.width,
        1 - (e.clientY - r.top) / r.height,
      );
      target.current.copy(current.current);
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
    // 프레임레이트와 무관한 감쇠 — 60fps 가 아니어도 같은 속도로 따라간다
    const follow = 1 - Math.pow(0.0015, dt);
    const fade = 1 - Math.pow(0.02, dt);

    current.current.lerp(target.current, follow);
    active.current += (activeTarget.current - active.current) * fade;

    const u = effect.uniforms;
    (u.get("uMouse")!.value as Vector2).copy(current.current);
    u.get("uActive")!.value = active.current;
    u.get("uTime")!.value += dt;
    (u.get("uAspect")!.value as Vector2).set(size.width / size.height, 1);
  });

  return <primitive ref={ref} object={effect} dispose={null} />;
});

export default InkEffect;
