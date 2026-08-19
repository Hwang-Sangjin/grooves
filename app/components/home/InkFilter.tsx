/**
 * 잉크 듀오톤 필터.
 * 씬의 실제 색을 밝기값으로 환산한 뒤, 어두운 곳 → 네이비 잉크 /
 * 밝은 곳 → 종이색 으로 다시 매핑한다. 단색 인쇄를 흉내내는 방식.
 *
 * 씬 자체는 웜톤 그대로이므로, 나중에 커서 리빌은
 * "원 안에서만 이 필터를 끄는 것" 으로 구현된다.
 */
export default function InkFilter() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute size-0"
      focusable="false"
    >
      <defs>
        <filter id="ink-duotone" colorInterpolationFilters="sRGB">
          {/* 1. 채도를 없애 밝기값만 남긴다 */}
          <feColorMatrix type="saturate" values="0" />

          {/* 2. 대비를 살짝 올려 선 드로잉처럼 명암을 벌린다 */}
          <feComponentTransfer>
            <feFuncR type="gamma" exponent="1.25" />
            <feFuncG type="gamma" exponent="1.25" />
            <feFuncB type="gamma" exponent="1.25" />
          </feComponentTransfer>

          {/* 3. 듀오톤 매핑
              tableValues="어두운쪽 밝은쪽" — ink(#2b3a8c) → paper(#fceedb) */}
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.169 0.988" />
            <feFuncG type="table" tableValues="0.227 0.933" />
            <feFuncB type="table" tableValues="0.549 0.859" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  );
}
