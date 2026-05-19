import { CheckCircle2, CircleDot, Cpu, MessageSquareText } from "lucide-react";
import type { AgentTraceStep } from "@/types/agent";

type TraceTimelineProps = {
  trace: AgentTraceStep[];
};

function getTraceIcon(stepType: string) {
  if (stepType === "user") return MessageSquareText;
  if (stepType === "agent_tool_decision") return Cpu;
  if (stepType === "tool_result") return CircleDot;
  return CheckCircle2;
}

function getTraceLabel(stepType: string) {
  const labels: Record<string, string> = {
    user: "User Question",
    agent_tool_decision: "Agent Tool Decision",
    tool_result: "Tool Result",
    agent_answer: "Final Answer",
  };

  return labels[stepType] || stepType;
}

export function TraceTimeline({ trace }: TraceTimelineProps) {
  if (!trace.length) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-5">
        <h3 className="font-medium text-white">Agent Trace</h3>
        <p className="mt-1 text-sm text-slate-400">
          Shows how the LangGraph agent reached the answer.
        </p>
      </div>

      <div className="space-y-4">
        {trace.map((step, index) => {
          const Icon = getTraceIcon(step.step_type);

          return (
            <div key={`${step.step_type}-${index}`} className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-900">
                  <Icon className="h-4 w-4 text-cyan-300" />
                </div>

                {index !== trace.length - 1 && (
                  <div className="mt-2 h-full w-px min-h-8 bg-white/10" />
                )}
              </div>

              <div className="flex-1 rounded-2xl bg-slate-950/50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-white">
                    {getTraceLabel(step.step_type)}
                  </p>

                  {step.name && (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-slate-300">
                      {step.name}
                    </span>
                  )}
                </div>

                {step.content_preview && (
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    {step.content_preview}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}