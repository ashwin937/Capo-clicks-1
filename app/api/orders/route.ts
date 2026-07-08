import { NextRequest, NextResponse } from "next/server";
import { getRazorpayClient, isRazorpayConfigured } from "@/lib/razorpay";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/supabase";
import { computeOrderTotal } from "@/lib/pricing";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

function generateOrderCode() {
  const n = Math.floor(10000 + Math.random() * 90000);
  return `CC-${n}`;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = rateLimit(`orders:${ip}`, 10, 60_000); // 10 orders/min per IP
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests — please wait a moment and try again." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      items,
      deliveryMethod,
      deliveryAddress,
      orderType, // "frame" | "collage_frame" | "photoshoot" — defaults to frame-cart flow
      serviceOrPackageId,
      eventDate,
      eventLocation
    } = body;

    if (!customerName || !customerPhone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }

    const orderCode = generateOrderCode();
    const resolvedOrderType =
      orderType || (items?.some((i: any) => i.type === "collage_frame") ? "collage_frame" : "frame");

    // The browser's total is never trusted — it's recalculated here from the
    // live frame sizes / package prices, so editing the request in devtools
    // can't get you a cheaper order.
    const { total: totalAmount, valid, reason } = await computeOrderTotal({
      orderType: resolvedOrderType,
      items,
      serviceOrPackageId
    });

    if (!valid) {
      return NextResponse.json({ error: reason || "Could not calculate order total" }, { status: 400 });
    }

    // Create the Razorpay order first (if configured) so we can store its ID
    // alongside the order record — that's what lets the verify-payment step
    // find the right row afterwards.
    let razorpayOrderId: string | null = null;
    let razorpayAmountInPaise: number | null = null;

    if (isRazorpayConfigured() && totalAmount > 0) {
      const razorpay = getRazorpayClient();
      const rzpOrder = await razorpay!.orders.create({
        amount: Math.round(totalAmount * 100), // paise
        currency: "INR",
        receipt: orderCode
      });
      razorpayOrderId = rzpOrder.id;
      razorpayAmountInPaise = rzpOrder.amount as number;
    }

    const orderRecord = {
      order_code: orderCode,
      order_type: resolvedOrderType,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail || null,
      item_summary: { items: items || [], serviceOrPackageId, eventDate, eventLocation },
      status: "order_placed",
      payment_status: "pending",
      total_amount: totalAmount,
      delivery_method: deliveryMethod || null,
      delivery_address: deliveryAddress || null,
      razorpay_order_id: razorpayOrderId
    };

    // Persist to Supabase if configured, otherwise the order still flows
    // through checkout/tracking using the generated order code alone.
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseServiceClient();
      if (supabase) {
        await supabase.from("orders").insert(orderRecord);
      }
    }

    if (razorpayOrderId) {
      return NextResponse.json({
        orderCode,
        razorpayOrderId,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        amountInPaise: razorpayAmountInPaise
      });
    }

    return NextResponse.json({ orderCode, razorpayOrderId: null, paymentConfigured: false });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
