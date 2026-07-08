"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Package, QuoteService } from "@/lib/data";

function fmt(n: number) {
  return "\u20B9" + n.toLocaleString("en-IN");
}

function BookingForm() {
  const params = useSearchParams();
  const router = useRouter();
  const preselectedPackage = params.get("package");
  const preselectedService = params.get("service");

  const [packages, setPackages] = useState<Package[]>([]);
  const [quoteServices, setQuoteServices] = useState<QuoteService[]>([]);

  useEffect(() => {
    fetch("/api/admin/packages").then((r) => r.json()).then((d) => setPackages(d.items || []));
    fetch("/api/admin/quote-services").then((r) => r.json()).then((d) => setQuoteServices(d.items || []));
  }, []);

  const pkg = packages.find((p) => p.id === preselectedPackage);
  const svc = quoteServices.find((s) => s.id === preselectedService);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          orderType: "photoshoot",
          serviceOrPackageId: pkg?.id || svc?.id || null,
          eventDate,
          eventLocation,
          totalAmount: pkg?.price || 0,
          items: []
        })
      });
      const data = await res.json();
      setDone(data.orderCode);
    } catch {
      setDone(null);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center card p-10">
        <h2 className="font-display text-xl text-goldLight mb-3">Booking request received</h2>
        <p className="text-sm text-muted mb-6">
          Your reference ID is <span className="font-mono text-cream">{done}</span>. Our team will call you on{" "}
          {phone} to confirm the date and, if needed, collect a deposit.
        </p>
        <button onClick={() => router.push(`/track?order=${done}`)} className="btn btn-solid">
          Track this booking
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto card p-8">
      {pkg && (
        <div className="mb-6 pb-6 border-b border-line">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">Booking package</p>
          <p className="font-display text-lg text-goldLight">{pkg.name} — {fmt(pkg.price)}</p>
        </div>
      )}
      {svc && !pkg && (
        <div className="mb-6 pb-6 border-b border-line">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">Requesting a quote for</p>
          <p className="font-display text-lg text-goldLight">{svc.name}</p>
        </div>
      )}
      {!pkg && !svc && (
        <div className="mb-6 pb-6 border-b border-line">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">General booking request</p>
        </div>
      )}

      <div className="space-y-4">
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full bg-black border border-line px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-gold" />
        <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="w-full bg-black border border-line px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-gold" />
        <input required type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full bg-black border border-line px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-gold" />
        <input required value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} placeholder="Event location" className="w-full bg-black border border-line px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-gold" />
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything else we should know? (optional)" rows={3} className="w-full bg-black border border-line px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-gold" />
      </div>

      <button type="submit" disabled={submitting} className="btn btn-solid w-full mt-6">
        {submitting ? "Submitting..." : "Submit Booking Request"}
      </button>
    </form>
  );
}

export default function BookingPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <div className="eyebrow mb-2">Booking</div>
        <h1 className="font-display text-3xl md:text-4xl">Book a Shoot</h1>
      </div>
      <Suspense fallback={null}>
        <BookingForm />
      </Suspense>
    </div>
  );
}
