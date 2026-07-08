import FrameLedger from "@/components/FrameLedger";
import { getFrameSizes } from "@/lib/publicData";

export const dynamic = "force-dynamic";

export default async function FramesPage() {
  const sizes = await getFrameSizes();
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <div className="eyebrow mb-2">Frame price list</div>
        <h1 className="font-display text-3xl md:text-4xl mb-3">Choose a size, get an instant quote</h1>
        <p className="text-muted text-sm">Pick a size on the left — your order slip updates on the right.</p>
      </div>
      <FrameLedger mode="frame" sizes={sizes} />
    </div>
  );
}

