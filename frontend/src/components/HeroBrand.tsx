"use client";

import Link from "next/link";
import { MouseEvent } from "react";

import { AppLogo } from "@/components/AppLogo";

export function HeroBrand() {
  function resetHome(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    window.location.assign("/");
  }

  return (
    <Link
      href="/"
      onClick={resetHome}
      aria-label="Reset Market Insight AI home"
      className="group flex flex-col items-center justify-center gap-5 rounded-[2rem] outline-none transition focus-visible:ring-4 focus-visible:ring-cyan-300/20 md:flex-row md:gap-7"
    >
      <AppLogo size="lg" />

      <div className="text-center">
        <h1 className="text-6xl font-black tracking-tight text-white md:text-8xl">
          <span className="gradient-text">Market Insight AI</span>
        </h1>

        <p className="mt-3 text-base font-medium text-slate-300 md:text-xl">
          Agentic stock research assistant
        </p>
      </div>
    </Link>
  );
}
