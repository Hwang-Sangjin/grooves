"use client";

import { useEffect, useRef, useState } from "react";
import { useAppReady } from "./useAppReady";

// 바깥 → 안쪽 순서의 홈(groove) 반지름
// r: 반지름 / rot: 시작점 각도 / len: 그려지는 비율(1이면 완전히 닫힘)
// w: 선 굵기(필압) / o: 잉크 농도 / dur: 긋는 속도
const GROOVES = [
  { r: 150, rot: -8, len: 1.0, w: 4, o: 1, dur: 0.82 },
  { r: 138, rot: 74, len: 0.975, w: 2.1, o: 0.9, dur: 0.7 },
  { r: 126, rot: 152, len: 0.94, w: 2.3, o: 1, dur: 0.78 },
  { r: 114, rot: 35, len: 0.985, w: 2.0, o: 0.85, dur: 0.66 },
  { r: 102, rot: 218, len: 0.95, w: 2.3, o: 1, dur: 0.74 },
  { r: 90, rot: 112, len: 0.97, w: 2.1, o: 0.92, dur: 0.7 },
  { r: 78, rot: 295, len: 0.93, w: 2.4, o: 1, dur: 0.8 },
  { r: 66, rot: 176, len: 0.98, w: 2.0, o: 0.88, dur: 0.64 },
  { r: 54, rot: 60, len: 0.945, w: 2.2, o: 1, dur: 0.72 },
];

const DRAW_MS = 2400; // 드로잉 choreography 가 끝나는 시점 (고정)

const SLOWDOWN_MS = 1200; // globals.css 의 disc-slowdown 과 같은 길이

const SLOWDOWN_DEG = 80; // disc-slowdown 이 추가로 도는 각도

type Stage = "spinning" | "slowing" | "pulse";

export default function Preloader() {
  const spinRef = useRef<SVGGElement>(null);
  const [stage, setStage] = useState<Stage>("spinning");
  const [drawDone, setDrawDone] = useState(false);
  const ready = useAppReady();

  // 감속은 한 번 시작하면 되돌아가지 않는다.
  // stage === "slowing" 으로 두면 다음 stage 에서 클래스가 벗겨지며
  // 기본 무한회전이 0도부터 되살아난다.
  const isSlowed = stage !== "spinning";

  // 연출: 로딩 상황과 무관하게 항상 같은 리듬
  useEffect(() => {
    const t = setTimeout(() => setDrawDone(true), DRAW_MS);
    return () => clearTimeout(t);
  }, []);

  // 대기: 드로잉이 끝났고 AND 리소스가 준비되면 감속 시작
  useEffect(() => {
    if (stage !== "spinning" || !drawDone || !ready) return;

    const el = spinRef.current;
    if (el) {
      // 지금 판이 향한 각도를 읽어 감속 키프레임의 시작점으로 넘긴다.
      // 이 값이 없으면 0도로 튀면서 판이 순간이동한다.
      const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
      const angle = (Math.atan2(m.b, m.a) * 180) / Math.PI;
      el.style.setProperty("--from", `${angle}deg`);
    }
    setStage("slowing");
  }, [stage, drawDone, ready]);

  // 감속이 끝나면 pulse
  useEffect(() => {
    if (stage !== "slowing") return;

    const t = setTimeout(() => {
      // 멈춘 각도를 인라인으로 고정해둔다.
      // CSS 애니메이션이 인라인 스타일보다 우선순위가 높아 재생 중엔 영향이 없고,
      // 어떤 이유로든 클래스가 빠지면 이 값이 판을 붙잡아준다.
      const el = spinRef.current;
      if (el) {
        const from = parseFloat(el.style.getPropertyValue("--from")) || 0;
        el.style.transform = `rotate(${from + SLOWDOWN_DEG}deg)`;
      }
      setStage("pulse");
    }, SLOWDOWN_MS);

    return () => clearTimeout(t);
  }, [stage]);

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center"
      role="status"
      aria-label="GROOVES 불러오는 중"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(130%_100%_at_50%_15%,var(--color-paper-light)_0%,var(--color-paper)_50%,var(--color-paper-deep)_100%)]"
      />

      {/* 바이닐 디스크 */}
      <div
        className={`preloader-disc relative size-[300px]${
          stage === "pulse" ? " is-pulse" : ""
        }`}
      >
        <svg
          viewBox="0 0 400 400"
          className="size-full overflow-visible"
          aria-hidden
        >
          {/* 바깥: 0 → 120도 가속 후 정지 유지 */}
          <g className="disc-spinup">
            {/* 안쪽: 1.35s 부터 33⅓ RPM 정속 → 준비되면 감속 정지 */}
            <g
              ref={spinRef}
              className={`disc-spin${isSlowed ? " is-slowing" : ""}`}
            >
              <g
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                {/* 홈 — 바깥에서 안쪽으로 한 줄씩 */}
                {GROOVES.map((g, i) => (
                  <circle
                    key={g.r}
                    className="groove"
                    cx="200"
                    cy="200"
                    r={g.r}
                    pathLength="1"
                    strokeWidth={g.w}
                    opacity={g.o}
                    transform={`rotate(${g.rot} 200 200)`}
                    style={
                      {
                        "--i": i,
                        "--len": g.len,
                        "--dur": `${g.dur}s`,
                      } as React.CSSProperties
                    }
                  />
                ))}

                {/* 라벨 — 홈이 다 그려질 즈음 */}
                <circle
                  className="groove"
                  cx="200"
                  cy="200"
                  r="34"
                  strokeWidth="4"
                  pathLength="1"
                  style={{ "--i": 10 } as React.CSSProperties}
                />
              </g>

              {/* 스핀들 */}
              <circle
                className="fade-in"
                cx="200"
                cy="200"
                r="5"
                fill="currentColor"
                style={{ animationDelay: "1.7s" }}
              />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
