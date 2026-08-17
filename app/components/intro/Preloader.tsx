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

export default function Preloader() {
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
      <div className="relative size-[300px]">
        <svg
          viewBox="0 0 400 400"
          className="size-full overflow-visible"
          aria-hidden
        >
          {/* 바깥: 0 → 120도 가속 후 정지 유지 */}
          <g className="disc-spinup">
            {/* 안쪽: 1.35s 부터 33⅓ RPM 정속으로 인계 */}
            <g className="disc-spin">
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
