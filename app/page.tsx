"use client";

import dynamic from "next/dynamic";
import { useIntro } from "./components/intro/IntroProvider";
import PrintGuides from "./components/layout/PrintGuides";
import Header from "./components/layout/Header";

// three.js 는 SSR 이 불가능하므로 클라이언트에서만 로드
const HeroScene = dynamic(() => import("./components/home/HeroScene"), {
  ssr: false,
});

export default function Home() {
  const { done } = useIntro();

  return (
    <div data-drawn={done} className="min-h-screen">
      {/* 선 안쪽을 정확히 채운다 — 위는 가로선, 좌우는 세로선, 아래는 화면 끝.
          인트로 중에는 투명하되 마운트는 유지해 3D 로딩이 미리 진행되게 한다 */}
      <div
        className="scene-frame fixed z-0 top-[var(--header-h)] bottom-0
                   left-[var(--frame)] right-[var(--frame)]"
      >
        <HeroScene />
      </div>

      <PrintGuides />
      <Header />
    </div>
  );
}
