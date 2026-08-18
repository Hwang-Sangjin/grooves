"use client";

import { useIntro } from "./components/intro/IntroProvider";
import PrintGuides from "./components/layout/PrintGuides";

export default function Home() {
  const { done } = useIntro();

  return (
    <main data-drawn={done} className="min-h-screen">
      <PrintGuides />
    </main>
  );
}
