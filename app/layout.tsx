import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsappFab from "@/components/WhatsappFab";
import { CartProvider } from "@/components/CartProvider";

export const metadata: Metadata = {
  title: "Capo Clicks Photography — Studio & Custom Framing, Coimbatore",
  description:
    "Wedding, baby shoot and event photography plus custom photo framing in Coimbatore. Capturing Moments. Creating Memories.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body">
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
