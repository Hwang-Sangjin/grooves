"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import * as THREE from "three";

/**
 * 화면 비율이 어떻든 씬이 프레임을 "가득" 채우게 만든다.
 *
 * 기본 동작(contain)은 세로로 긴 화면에서 좌우가 남는다.
 * 퍼스펙티브 카메라의 fov 는 세로 시야각이고 가로 시야는 fov × aspect 이므로,
 * aspect 가 줄어든 만큼 fov 를 키우면 가로 시야가 일정하게 유지된다 = cover.
 */
function CoverCamera({
  fov = 40,
  designAspect = 16 / 9,
}: {
  fov?: number;
  designAspect?: number;
}) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;

    if (aspect < designAspect) {
      const halfV = THREE.MathUtils.degToRad(fov) / 2;
      const next = 2 * Math.atan(Math.tan(halfV) * (designAspect / aspect));
      // 너무 넓어지면 왜곡이 심해지니 상한을 둔다
      cam.fov = Math.min(THREE.MathUtils.radToDeg(next), 105);
    } else {
      cam.fov = fov;
    }

    cam.updateProjectionMatrix();
  }, [camera, size, fov, designAspect]);

  return null;
}

export default function HeroScene() {
  return (
    <Canvas
      // 종이 배경이 비쳐야 하므로 캔버스는 투명하게
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      camera={{ position: [0, 0.6, 5], fov: 40 }}
      style={{ background: "transparent" }}
    >
      <CoverCamera fov={40} designAspect={16 / 9} />

      {/* 조명 — 초저녁 실내. 색온도가 따뜻해야 듀오톤 변환 후 명암이 자연스럽다 */}
      <ambientLight intensity={0.55} color="#F4D9B0" />
      <directionalLight position={[3, 5, 4]} intensity={1.3} color="#F4B860" />
      <directionalLight
        position={[-4, 2, -3]}
        intensity={0.4}
        color="#7C6BA8"
      />

      {/* ── 임시 플레이스홀더 — 전부 웜톤 (파란색 없음) ── */}
      <mesh position={[0, 0.5, 0]}>
        <torusGeometry args={[1.1, 0.36, 24, 64]} />
        <meshStandardMaterial color="#7A4B2A" roughness={0.6} />
      </mesh>

      <mesh position={[-2.2, 0.1, -0.5]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#5F7239" roughness={0.8} />
      </mesh>

      <mesh position={[2.2, 0.2, -0.8]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color="#E8933A" roughness={0.4} />
      </mesh>

      <gridHelper
        args={[40, 40, "#8A5A33", "#B4552F"]}
        position={[0, -1.2, 0]}
      />
    </Canvas>
  );
}
