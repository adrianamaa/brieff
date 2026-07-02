import PrepView from "@/components/prep-view";
import { northwind, northwindPrep } from "@/lib/data";

export default function PrepPage() {
  return <PrepView account={northwind} prep={northwindPrep} />;
}
