import Image from "next/image";

/**
 * 헤더 — 카드나 배경 패널 없이 가이드 라인 시스템 안에 놓인다.
 * 높이(--margin)와 좌우 정렬(--header-px)이 PrintGuides 와 같은 변수에서
 * 파생되므로 선과 항상 맞물린다. 다른 페이지에서도 그대로 재사용.
 */
export default function Header() {
  return (
    <header
      className="fixed inset-x-0 top-0 z-20 flex h-[var(--margin)] items-center
                 justify-between px-[var(--header-px)] pt-[var(--header-pt)]"
    >
      {/* 좌: 메뉴 — 막대 3개가 왼쪽에서 그어진다 */}
      <button
        className="menu-btn group -ml-1 flex flex-col gap-[5px] p-1"
        aria-label="메뉴 열기"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="menu-bar block h-[2.5px] w-[24px] bg-ink"
            style={{ "--d": 3 + i } as React.CSSProperties}
          />
        ))}
      </button>

      {/* 중앙: 로고 */}
      <a
        href="/"
        className="reveal group"
        style={{ "--d": 3 } as React.CSSProperties}
        aria-label="GROOVES 홈"
      >
        <Image
          src="/image/logo.png"
          alt="GROOVES"
          width={1536}
          height={1024}
          priority
          className="logo-mark h-[var(--logo-h)] w-auto"
        />
      </a>

      {/* 우: 프로필 */}
      <button
        className="reveal grid size-[33px] place-items-center rounded-full border-2 border-ink
             transition-colors duration-500 hover:bg-ink hover:text-paper"
        style={{ "--d": 5 } as React.CSSProperties}
        aria-label="프로필"
      >
        <svg width="15" height="15" viewBox="0 0 26 26" fill="none" aria-hidden>
          <circle
            cx="13"
            cy="9"
            r="4.6"
            stroke="currentColor"
            strokeWidth="2.4"
          />
          <path
            d="M3.8 24c1.6-4.8 5.2-7.2 9.2-7.2s7.6 2.4 9.2 7.2"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </header>
  );
}
