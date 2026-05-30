import { Wrench } from "lucide-react";

type ToolBadgesProps = {
  tools: string[];
};

function cleanToolName(tool: string) {
  return tool
    .replace("_tool", "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function ToolBadges({ tools }: ToolBadgesProps) {
  if (!tools.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-3 flex items-center gap-2">
          <Wrench className="h-4 w-4 text-cyan-300" />
          <h3 className="font-medium text-white">Tools Used</h3>
        </div>
        <p className="text-sm leading-6 text-slate-400">
          No external tools were reported for this response.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Wrench className="h-4 w-4 text-cyan-300" />
        <h3 className="font-medium text-white">Tools Used</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {tools.map((tool) => (
          <span
            key={tool}
            className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100"
          >
            {cleanToolName(tool)}
          </span>
        ))}
      </div>
    </div>
  );
}
