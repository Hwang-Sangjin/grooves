"use client";

import { useEffect, useState } from "react";

/**
 * "이제 홈을 열어도 되는가"를 판단하는 게이트.
 * 지금은 폰트/기본 리소스만 기다린다.
 * 나중에 3D 씬이 붙으면 여기에 조건을 하나 추가하면 된다.
 */
export function useAppReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let done = false;
    const settle = () => {
      if (!done) {
        done = true;
        setReady(true);
      }
    };

    const waits: Promise<unknown>[] = [document.fonts.ready];
    if (document.readyState !== "complete") {
      waits.push(
        new Promise((res) =>
          window.addEventListener("load", res, { once: true }),
        ),
      );
    }

    // 어떤 리소스가 끝내 응답하지 않아도 화면은 열려야 한다
    const failsafe = setTimeout(settle, 8000);
    Promise.all(waits).then(settle).catch(settle);

    return () => clearTimeout(failsafe);
  }, []);

  return ready;
}
