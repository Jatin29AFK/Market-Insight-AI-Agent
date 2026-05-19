import { Loader2, Radio } from "lucide-react";

type StreamingStatusProps = {
  statusMessages: string[];
  isStreaming: boolean;
};

export function StreamingStatus({
  statusMessages,
  isStreaming,
}: StreamingStatusProps) {
  if (!statusMessages.length && !isStreaming) {
    return null;
  }

  return (
    <div className="mb-6 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
      <div className="mb-4 flex items-center gap-2">
        {isStreaming ? (
          <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
        ) : (
          <Radio className="h-4 w-4 text-cyan-300" />
        )}

        <h3 className="font-medium text-cyan-100">
          Agent Progress
        </h3>
      </div>

      <div className="space-y-2">
        {statusMessages.map((message, index) => (
          <div
            key={`${message}-${index}`}
            className="rounded-2xl bg-slate-950/40 px-4 py-3 text-sm text-slate-300"
          >
            {message}
          </div>
        ))}
      </div>
    </div>
  );
}