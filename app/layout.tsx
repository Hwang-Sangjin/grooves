import type { Metadata } from "next";
import { Anton, Space_Mono } from "next/font/google";
import "./globals.css";
import Preloader from "./components/intro/Preloader";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GROOVES — Vinyl Culture Hub",
  description: "Collect, discover, and share the music you love.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${anton.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body>
        <div aria-hidden className="grain" />
        <Preloader />
        {children}
      </body>
    </html>
  );
}
