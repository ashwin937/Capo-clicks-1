"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";

function fmt(n: number) {
  return "\u20B9" + n.toLocaleString("en-IN");
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleCheckout() {
    if (!name || !phone) {
      setError("Please enter your name and phone number.");
      return;
    }
    if (deliveryMethod === "delivery" && !address) {
      setError("Please enter a delivery address.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          items,
          deliveryMethod,
          deliveryAddress: address,
          totalAmount: subtotal
        })
      });
      const data = await res.json();

      if (!data.razorpayOrderId) {
        // Razorpay not configured on the server yet — order recorded, payment link pending
        setError("");
        setInfo(
          `Payment isn't connected yet, so order ${data.orderCode} was recorded without taking payment. Redirecting to tracking...`
        );
        setTimeout(() => {
          clearCart();
          router.push(`/track?order=${data.orderCode}`);
        }, 2500);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const rzp = new window.Razorpay({
          key: data.razorpayKeyId,
          amount: data.amountInPaise,
          currency: "INR",
          name: "Capo Clicks Photography",
          description: "Order #" + data.orderCode,
          order_id: data.razorpayOrderId,
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch("/api/orders/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderCode: data.orderCode
                })
              });
              const verifyData = await verifyRes.json();

              if (verifyRes.ok && verifyData.verified) {
                clearCart();
                router.push(`/track?order=${data.orderCode}`);
              } else {
                setError(
                  `Payment went through, but we couldn't confirm it automatically. Please contact us on WhatsApp with Order ID ${data.orderCode} so we can verify it manually.`
                );
              }
            } catch {
              setError(
                `Payment went through, but we couldn't confirm it automatically. Please contact us on WhatsApp with Order ID ${data.orderCode} so we can verify it manually.`
              );
            }
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            }
          },
          prefill: { name, contact: phone, email },
          theme: { color: "#c9a227" }
        });
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (e) {
      setError("Something went wrong placing your order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-2xl mb-3">Your cart is empty</h1>
        <p className="text-muted text-sm mb-8">Add a frame or custom collage to get started.</p>
        <a href="/frames" className="btn btn-solid">Browse Frames</a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl mb-10">Your Cart</h1>

      <div className="space-y-4 mb-10">
        {items.map((item) => (
          <div key={item.id} className="card p-5 flex justify-between items-center gap-4 flex-wrap">
            <div>
              <p className="font-semibold text-sm mb-1">
                {item.type === "collage_frame" ? "Custom Collage Frame" : "Frame"} — {item.sizeLabel}
              </p>
              <p className="text-xs text-muted">
                {fmt(item.unitPrice)}{item.designFee ? ` + ${fmt(item.designFee)} design fee` : ""} each
              </p>
              {item.uploadedFileName && <p className="text-xs text-muted mt-1">📎 {item.uploadedFileName}</p>}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 border border-gold text-goldLight rounded-sm">&minus;</button>
                <span className="font-mono text-sm w-4 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 border border-gold text-goldLight rounded-sm">+</button>
              </div>
              <span className="font-mono text-goldLight w-20 text-right">
                {fmt((item.unitPrice + (item.designFee || 0)) * item.quantity)}
              </span>
              <button onClick={() => removeItem(item.id)} className="text-xs text-muted hover:text-red-400">Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6 mb-10">
        <h2 className="font-display text-lg text-goldLight mb-5">Delivery details</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="bg-black border border-line px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-gold" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="bg-black border border-line px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-gold" />
        </div>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" className="w-full bg-black border border-line px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-gold mb-4" />

        <div className="flex gap-4 mb-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={deliveryMethod === "pickup"} onChange={() => setDeliveryMethod("pickup")} />
            In-store pickup (Coimbatore)
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={deliveryMethod === "delivery"} onChange={() => setDeliveryMethod("delivery")} />
            Delivery
          </label>
        </div>
        {deliveryMethod === "delivery" && (
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Delivery address" className="w-full bg-black border border-line px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-gold" rows={3} />
        )}
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      {info && <p className="text-goldLight text-sm mb-4 border border-gold/40 bg-gold/10 rounded-sm p-3">{info}</p>}

      <div className="flex justify-between items-center card p-6">
        <div>
          <p className="text-xs text-muted uppercase tracking-wide">Subtotal</p>
          <p className="font-display text-2xl text-goldLight font-mono">{fmt(subtotal)}</p>
        </div>
        <button onClick={handleCheckout} disabled={loading} className="btn btn-solid !px-8">
          {loading ? "Processing..." : "Pay & Place Order"}
        </button>
      </div>
    </div>
  );
}
