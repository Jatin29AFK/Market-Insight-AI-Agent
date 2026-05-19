import type {
  HistoricalDataResponse,
  StockSnapshotResponse,
} from "@/types/agent";

import { PriceChart } from "@/components/PriceChart";
import { SnapshotCards } from "@/components/SnapshotCards";

type MarketDashboardProps = {
  snapshot: StockSnapshotResponse | null;
  history: HistoricalDataResponse | null;
};

export function MarketDashboard({ snapshot, history }: MarketDashboardProps) {
  if (!snapshot && !history) {
    return null;
  }

  return (
    <section className="mb-6 space-y-6">
      {snapshot && <SnapshotCards snapshot={snapshot} />}

      {history && (
        <PriceChart
          history={history}
          currency={snapshot?.price?.currency || "USD"}
        />
      )}
    </section>
  );
}