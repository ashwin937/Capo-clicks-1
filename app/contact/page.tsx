import type { Metadata } from "next";
import ContactClient from "@/components/ContactClient";

export const metadata: Metadata = {
  title: "Contact Us — Book Your Shoot in Coimbatore",
  description:
    "Get in touch with Capo Clicks Photography in Coimbatore for wedding, baby shoot, and event photography bookings, or custom photo framing enquiries. Call, WhatsApp, or message us directly.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Capo Clicks Photography",
    description: "Book a shoot or ask about custom framing — Coimbatore, Tamil Nadu.",
    url: "/contact",
    type: "website"
  }
};

export default function ContactPage() {
  return <ContactClient />;
}
