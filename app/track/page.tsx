"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { statusLabels, OrderStatus } from "@/lib/data";

const stageOrder: OrderStatus[] = [
  "order_placed",
  "design_in_progress",
  "design_approved",
  "in_production",
  "ready_or_shipped",
  "delivered"
];

function TrackContent() {
  const params = useSearchParams();
  const [orderId, setOrderId] = useState(params.get("order") || "");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleTrack() {
    if (!orderId) {
      setError("Enter your Order ID.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}${phone ? `?phone=${phone}` : ""}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Order not found.");
        setOrder(null);
      } else {
        setOrder(data);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (params.get("order")) handleTrack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentStage = order ? stageOrder.indexOf(order.status) : -1;

  return (
    <div className="max-w-xl mx-auto card p-8">
      <div className="flex gap-3 flex-wrap mb-2">
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Order ID, e.g. CC-10457"
          className="flex-1 min-w-[160px] bg-black border border-line px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-gold"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          className="flex-1 min-w-[160px] bg-black border border-line px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-gold"
        />
        <button onClick={handleTrack} disabled={loading} className="btn btn-solid whitespace-nowrap">
          {loading ? "..." : "Track Order"}
        </button>
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

      {order && (
        <div className="mt-8 space-y-6">
          {order.demo && (
            <p className="text-xs text-muted italic">
              Showing demo tracking data — connect Supabase to track real orders.
            </p>
          )}
          {stageOrder.map((stage, i) => {
            const done = i < currentStage;
            const current = i === currentStage;
            const isCollageOnlyStage = stage === "design_in_progress" || stage === "design_approved";
            if (isCollageOnlyStage && order.order_type !== "collage_frame") return null;
            return (
              <div key={stage} className="flex gap-3.5 relative pb-6 last:pb-0">
                {i < stageOrder.length - 1 && (
                  <div className="absolute left-[8px] top-5 bottom-0 w-px bg-line" />
                )}
                <div
                  className={`w-[17px] h-[17px] rounded-full border-2 flex-shrink-0 mt-0.5 ${
                    done ? "bg-gold border-gold" : current ? "border-goldLight shadow-[0_0_0_3px_rgba(201,162,39,0.2)]" : "border-line bg-black"
                  }`}
                />
                <div>
                  <p className={`text-sm font-semibold ${done || current ? "text-cream" : "text-muted font-normal"}`}>
                    {statusLabels[stage]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <div className="eyebrow mb-2">Order tracking</div>
        <h1 className="font-display text-3xl md:text-4xl mb-3">Track your order</h1>
        <p className="text-muted text-sm">Enter your Order ID and phone number — no login needed.</p>
      </div>
      <Suspense fallback={null}>
        <TrackContent />
      </Suspense>
    </div>
  );
}
