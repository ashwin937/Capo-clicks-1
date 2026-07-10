import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TaglineMarquee from "@/components/TaglineMarquee";
import WhatsappFab from "@/components/WhatsappFab";
import { CartProvider } from "@/components/CartProvider";
import Aurora from "../components/Aurora";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "Capo Clicks Photography — Studio & Custom Framing, Coimbatore",
    template: "%s | Capo Clicks Photography"
  },
  description:
    "Wedding, baby shoot and event photography plus custom photo framing in Coimbatore. Capturing Moments. Creating Memories.",
  metadataBase: new URL(siteUrl),
  keywords: [
    "photography Coimbatore",
    "wedding photographer Coimbatore",
    "baby shoot photography Coimbatore",
    "custom photo frames Coimbatore",
    "collage frames online India",
    "event photography Coimbatore"
  ],
  openGraph: {
    siteName: "Capo Clicks Photography",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Capo Clicks Photography" }]
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.jpg"]
  },
  robots: {
    index: true,
    follow: true
  }
};

// LocalBusiness structured data — helps Google show Capo Clicks with rich
// results (address, phone, opening context) in local search.
function LocalBusinessJsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "Photographer",
    name: "Capo Clicks Photography",
    image: `${siteUrl}/og-image.jpg`,
    url: siteUrl,
    telephone: process.env.NEXT_PUBLIC_PHONE_1 || undefined,
    email: process.env.NEXT_PUBLIC_EMAIL || "capoclicks@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Coimbatore",
      addressRegion: "Tamil Nadu",
      addressCountry: "IN"
    },
    sameAs: process.env.NEXT_PUBLIC_INSTAGRAM_URL ? [process.env.NEXT_PUBLIC_INSTAGRAM_URL] : [],
    priceRange: "₹₹"
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body">
        <LocalBusinessJsonLd />
        <Aurora colorStops={["#8a6d1a", "#e8cf7a", "#c9a227"]} amplitude={1.0} blend={0.6} speed={0.4} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <CartProvider>
            <Nav />
            <main>{children}</main>
            <TaglineMarquee />
            <Footer />
            <WhatsappFab />
          </CartProvider>
        </div>
      </body>
    </html>
  );
}
