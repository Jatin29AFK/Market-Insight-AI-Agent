import { ShieldAlert } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5">
      <div className="flex gap-3">
        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-300/10">
          <ShieldAlert className="h-5 w-5 text-amber-200" />
        </div>

        <div>
          <h3 className="font-medium text-amber-100">
            Educational market research only
          </h3>

          <p className="mt-2 text-sm leading-6 text-amber-100/75">
            Market Insight AI explains public market data for learning and
            research. It does not provide buy, sell, hold, or financial advice.
            Always verify data from official sources before making decisions.
          </p>
        </div>
      </div>
    </div>
  );
}