import type { Metadata } from "next";
import GalleryClient from "@/components/GalleryClient";

export const metadata: Metadata = {
  title: "Photography Portfolio — Weddings, Baby Shoots & Events",
  description:
    "Browse Capo Clicks' photography portfolio: weddings, baby shoots, birthdays, outdoor shoots, and custom framed collages, shot in and around Coimbatore.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: "Photography Portfolio | Capo Clicks",
    description:
      "Wedding, baby shoot, birthday, and event photography — plus custom collage frames — from Capo Clicks in Coimbatore.",
    url: "/gallery",
    type: "website"
  }
};

export default function GalleryPage() {
  return <GalleryClient />;
}
