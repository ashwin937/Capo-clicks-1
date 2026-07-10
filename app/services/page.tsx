import type { Metadata } from "next";
import Link from "next/link";
import { getPackages, getQuoteServices } from "@/lib/publicData";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Photography Services & Packages — Capo Clicks, Coimbatore",
  description:
    "Wedding photography, birthday & event coverage, outdoor shoots, cinematic reels, album design, and photo editing packages from Capo Clicks Photography, Coimbatore.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Photography Services & Packages | Capo Clicks",
    description: "Wedding, birthday, event, and outdoor photography packages plus editing and album design services.",
    url: "/services",
    type: "website"
  }
};

export default async function ServicesPage() {
  const [packages, quoteServices] = await Promise.all([getPackages(), getQuoteServices()]);
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-14">
        <div className="eyebrow mb-2">Photography</div>
        <h1 className="font-display text-3xl md:text-4xl">Services &amp; Packages</h1>
      </div>

      <h2 className="font-display text-xl text-goldLight mb-6">Fixed-price packages</h2>
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {packages.map((pkg) => (
          <div key={pkg.id} className="card p-7 flex flex-col">
            {pkg.badge && (
              <span className="self-start text-[10px] uppercase tracking-wide bg-gold text-black font-bold px-2.5 py-1 rounded-sm mb-4">
                {pkg.badge}
              </span>
            )}
            <h3 className="font-display text-lg mb-2">{pkg.name}</h3>
            <p className="font-mono text-2xl text-goldLight mb-5">
              &#8377;{pkg.price.toLocaleString("en-IN")}
              <span className="text-xs text-muted font-body"> only</span>
            </p>
            <ul className="text-sm text-muted space-y-2 mb-6 flex-1">
              {pkg.includes.map((inc) => (
                <li key={inc} className="flex gap-2">
                  <span className="text-gold">&#10003;</span>
                  <span>{inc}</span>
                </li>
              ))}
            </ul>
            <Link href={`/booking?package=${pkg.id}`} className="btn btn-solid w-full">
              Book This Package
            </Link>
          </div>
        ))}
      </div>

      <h2 className="font-display text-xl text-goldLight mb-6">Other services — get a quote</h2>
      <div className="grid md:grid-cols-3 gap-5">
        {quoteServices.map((s) => (
          <div key={s.id} className="card p-6">
            <h3 className="font-semibold text-sm uppercase tracking-wide mb-2">{s.name}</h3>
            <p className="text-sm text-muted mb-5">{s.description}</p>
            <Link href={`/booking?service=${s.id}`} className="btn btn-outline w-full !py-2 !text-xs">
              Get a Quote
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
