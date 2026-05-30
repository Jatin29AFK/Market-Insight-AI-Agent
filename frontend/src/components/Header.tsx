import { AppLogo } from "@/components/AppLogo";

export function Header() {
  return (
    <header className="flex w-full items-center justify-center px-6 py-6">
      <div className="flex items-center gap-3">
        <AppLogo />

        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white">
            Market Insight AI
          </h1>
          <p className="text-xs text-slate-400">
            Agentic stock research assistant
          </p>
        </div>
      </div>
    </header>
  );
}
