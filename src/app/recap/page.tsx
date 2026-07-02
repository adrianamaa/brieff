import RecapView from "@/components/recap-view";
import { northwind, northwindRecap } from "@/lib/data";

export default async function RecapPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const { demo } = await searchParams;
  return (
    <RecapView
      account={northwind}
      recap={northwindRecap}
      initialStatus={demo === "done" || demo === "sent" ? "done" : "idle"}
      initialSent={demo === "sent"}
    />
  );
}
