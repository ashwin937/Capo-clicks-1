import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/supabase";

// This exists because the Razorpay webhook (/api/webhooks/razorpay) can only
// reach a real public domain — it can't call back to localhost during local
// development, and even in production a webhook can lag by a few seconds.
// So the browser calls this route immediately after Razorpay's checkout
// popup reports success, we verify the payment is genuine (not spoofed) by
// checking Razorpay's signature ourselves, then mark the order paid directly.
export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderCode } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Razorpay isn't configured on the server" }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment signature could not be verified" }, { status: 400 });
    }

    // Signature checks out — the payment is genuine. Persist it if Supabase
    // is connected; if not, the payment is still valid, there's just nowhere
    // to record it yet.
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseServiceClient();
      if (supabase) {
        await supabase
          .from("orders")
          .update({ payment_status: "paid", razorpay_payment_id, razorpay_order_id })
          .eq("order_code", orderCode);
      }
    }

    return NextResponse.json({ verified: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
