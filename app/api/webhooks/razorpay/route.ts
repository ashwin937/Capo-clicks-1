import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers.get("x-razorpay-signature");
  const rawBody = await req.text();

  if (secret && signature) {
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    if (expected !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  const event = JSON.parse(rawBody);

  if (event.event === "payment.captured" && isSupabaseConfigured()) {
    const supabase = getSupabaseServiceClient();
    const orderId = event.payload?.payment?.entity?.order_id;
    const paymentId = event.payload?.payment?.entity?.id;
    if (supabase && orderId) {
      await supabase
        .from("orders")
        .update({ payment_status: "paid", razorpay_payment_id: paymentId })
        .eq("razorpay_order_id", orderId);
    }
  }

  if (event.event === "payment.failed" && isSupabaseConfigured()) {
    const supabase = getSupabaseServiceClient();
    const orderId = event.payload?.payment?.entity?.order_id;
    if (supabase && orderId) {
      await supabase.from("orders").update({ payment_status: "failed" }).eq("razorpay_order_id", orderId);
    }
  }

  return NextResponse.json({ received: true });
}
