import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsappFab from "@/components/WhatsappFab";
import { CartProvider } from "@/components/CartProvider";

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
        <CartProvider>
          <Nav />
          <main>{children}</main>
          <Footer />
          <WhatsappFab />
        </CartProvider>
      </body>
    </html>
  );
}
