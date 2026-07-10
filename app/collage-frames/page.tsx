import type { Metadata } from "next";
import FrameLedger from "@/components/FrameLedger";
import { getFrameSizes } from "@/lib/publicData";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Custom Collage Frames — Multi-Photo Frames, Coimbatore",
  description:
    "Order custom collage photo frames combining multiple photos into one framed piece — perfect for weddings, trips, and family milestones. Pickup or delivery in Coimbatore.",
  alternates: { canonical: "/collage-frames" },
  openGraph: {
    title: "Custom Collage Frames | Capo Clicks",
    description: "Multi-photo collage frames for weddings, trips, and family milestones — Coimbatore.",
    url: "/collage-frames",
    type: "website"
  }
};

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
