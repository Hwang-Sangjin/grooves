"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import * as THREE from "three";
import InkRenderer from "./InkRenderer";

/**
 * 화면 비율이 어떻든 씬이 프레임을 "가득" 채우게 만든다.
 * fov 는 세로 시야각이고 가로 시야는 fov × aspect 이므로,
 * aspect 가 줄어든 만큼 fov 를 키우면 가로 시야가 유지된다 = cover.
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
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      camera={{ position: [0, 0.6, 5], fov: 40, near: 0.5, far: 40 }}
    >
      <CoverCamera fov={40} designAspect={16 / 9} />

      {/* 씬은 웜톤 실제 색. 리빌됐을 때 이 색이 그대로 보이므로 충분히 밝아야 한다 */}
      <ambientLight intensity={1.1} color="#F4D9B0" />
      <directionalLight position={[3, 5, 4]} intensity={1.8} color="#F4B860" />
      <directionalLight
        position={[-4, 2, -3]}
        intensity={0.6}
        color="#B49BD8"
      />

      {/* ── 임시 플레이스홀더 ──
          바닥 평면은 두지 않는다 — 내부 엣지가 없어서 수평선 띠만 만든다.
          대신 엣지가 많이 나오는 형태(선반 + 슬리브)로 밀도를 확인한다 */}
      <mesh position={[0, 0.5, 0]}>
        <torusGeometry args={[1.1, 0.36, 24, 64]} />
        <meshStandardMaterial color="#B5793F" roughness={0.6} />
      </mesh>

      <mesh position={[-2.4, 0.1, -0.5]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#8FA45C" roughness={0.85} />
      </mesh>

      <mesh position={[2.4, 0.2, -0.8]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color="#F0A855" roughness={0.45} />
      </mesh>

      {/* 선반 상판 */}
      <mesh position={[0, -1.1, 0.5]}>
        <boxGeometry args={[3.4, 0.12, 1.6]} />
        <meshStandardMaterial color="#B5793F" roughness={0.7} />
      </mesh>

      {/* LP 슬리브 — 반복 형태가 엣지 밀도를 만든다 */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={i}
          position={[-1.4 + i * 0.56, -0.6, 0.5]}
          rotation={[0, 0, 0.04 * (i % 3)]}
        >
          <boxGeometry args={[0.42, 0.86, 0.06]} />
          <meshStandardMaterial color="#E0B980" roughness={0.9} />
        </mesh>
      ))}

      <InkRenderer outer={2.6} inner={1.0} hatchStrength={0} />
    </Canvas>
  );
}
