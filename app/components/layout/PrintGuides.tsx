"use client";

import { useIntro } from "../intro/IntroProvider";

export default function PrintGuides() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-10">
      {/* 헤더와 콘텐츠를 가르는 가로선 — 왼쪽에서 오른쪽으로 */}
      <div
        className="guide guide-h"
        style={{ "--d": 0 } as React.CSSProperties}
      />

      {/* 좌우 세로선 — 위에서 아래로 */}
      <div
        className="guide guide-v guide-v--left"
        style={{ "--d": 1 } as React.CSSProperties}
      />
      <div
        className="guide guide-v guide-v--right"
        style={{ "--d": 2 } as React.CSSProperties}
      />
    </div>
  );
}
