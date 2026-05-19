import { Activity, Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-lg">
          <Activity className="h-5 w-5 text-cyan-300" />
        </div>

        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white">
            Market Insight AI
          </h1>
          <p className="text-xs text-slate-400">
            Agentic stock research assistant
          </p>
        </div>
      </div>

      <div className="hidden items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200 md:flex">
        <Sparkles className="h-4 w-4" />
        Powered by LangGraph + FastAPI
      </div>
    </header>
  );
}