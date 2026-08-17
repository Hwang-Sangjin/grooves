// 바깥 → 안쪽 순서의 홈(groove) 반지름
const GROOVES = [150, 138, 126, 114, 102, 90, 78, 66, 54];

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
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            {/* 홈 — 바깥에서 안쪽으로 한 줄씩 */}
            {GROOVES.map((r, i) => (
              <circle
                key={r}
                className="groove"
                cx="200"
                cy="200"
                r={r}
                pathLength="1"
                style={{ "--i": i } as React.CSSProperties}
              />
            ))}

            {/* 라벨 — 홈이 다 그려질 즈음 */}
            <circle
              className="groove"
              cx="200"
              cy="200"
              r="34"
              strokeWidth="2.6"
              pathLength="1"
              style={{ "--i": 10 } as React.CSSProperties}
            />

            {/* 인덱스 마크 */}
            <line
              className="fade-in"
              x1="200"
              y1="166"
              x2="200"
              y2="150"
              strokeWidth="2.4"
              style={{ animationDelay: "1.75s" }}
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
        </svg>
      </div>
    </div>
  );
}
