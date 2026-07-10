import type { Metadata } from "next";
import Link from "next/link";
import FeaturedGallery from "@/components/FeaturedGallery";
import OfferBanner from "@/components/OfferBanner";

export const metadata: Metadata = {
  description:
    "Capo Clicks Photography — wedding, baby shoot, birthday & event photography plus custom photo framing and collage frames in Coimbatore, Tamil Nadu. Capturing Moments. Creating Memories.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Capo Clicks Photography — Coimbatore",
    description:
      "Wedding, baby shoot, birthday & event photography plus custom photo framing in Coimbatore, Tamil Nadu.",
    url: "/",
    type: "website"
  }
};

const services = [
  "Wedding Photography",
  "Birthday & Events",
  "Outdoor Shoots",
  "Baby Shoots",
  "Cinematic Reels",
  "Album Design",
  "Photo Editing",
  "Photo Frames"
];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden text-center px-6 pt-24 pb-20 bg-[radial-gradient(ellipse_700px_500px_at_50%_-10%,rgba(201,162,39,0.14),transparent_70%)]">
        <div className="eyebrow mb-4">Coimbatore &middot; Photography &amp; Custom Framing</div>
        <h1 className="font-display text-4xl md:text-5xl leading-tight mb-4">
          Capturing Moments.<br />
          <span className="text-goldLight">Creating Memories.</span>
        </h1>
        <p className="text-muted max-w-md mx-auto mb-8">
          Weddings, portraits, baby shoots and cinematic reels — printed, framed, and delivered by Capo Clicks.
        </p>
        <div className="flex gap-8 justify-center flex-wrap items-center">
          <Link href="/booking" className="btn-signature">
            Book a Shoot
            <svg viewBox="0 0 200 16" preserveAspectRatio="none" aria-hidden="true">
              <path d="M2,8 C40,2 70,12 100,6 C130,1 160,10 198,5" />
            </svg>
          </Link>
          <Link href="/frames" className="btn-underline">Order a Frame</Link>
        </div>
      </section>

      <div className="text-center py-6 border-y border-line font-display text-goldLight tracking-wide">
        &ldquo; Every Picture Tells a Story &rdquo;
      </div>

      <OfferBanner />
      <FeaturedGallery />

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-11">
          <div className="eyebrow mb-2">What we do</div>
          <h2 className="font-display text-3xl">Studio &amp; framing services</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line border border-line">
          {services.map((s) => (
            <div key={s} className="bg-panel hover:bg-panel2 transition p-7 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide">{s}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/services" className="card p-8 hover:border-gold transition block">
            <h3 className="font-display text-xl text-goldLight mb-2">Fixed photography packages</h3>
            <p className="text-sm text-muted">Baby shoot, reception, and reception + video packages with set pricing — book instantly.</p>
          </Link>
          <Link href="/collage-frames" className="card p-8 hover:border-gold transition block">
            <h3 className="font-display text-xl text-goldLight mb-2">Custom collage frames</h3>
            <p className="text-sm text-muted">Turn multiple photos into one designed, framed keepsake — weddings, trips, family memories.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
