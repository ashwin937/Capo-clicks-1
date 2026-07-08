import FrameLedger from "@/components/FrameLedger";
import { getFrameSizes } from "@/lib/publicData";

export const dynamic = "force-dynamic";

export default async function CollageFramesPage() {
  const sizes = await getFrameSizes();
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <div className="eyebrow mb-2">Custom collage frames</div>
        <h1 className="font-display text-3xl md:text-4xl mb-3">One frame, many memories</h1>
        <p className="text-muted text-sm max-w-lg mx-auto">
          Upload multiple photos and we&apos;ll design a composed layout — a wedding collage with names and
          a caption, or a trip collage with a full photo grid — then print and frame it.
        </p>
      </div>
      <FrameLedger mode="collage_frame" sizes={sizes} />
    </div>
  );
}
