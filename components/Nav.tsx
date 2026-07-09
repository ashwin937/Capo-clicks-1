"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export default function Nav() {
  const { items } = useCart();
  const count = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-line">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Capo Clicks Photography logo" width={44} height={44} className="w-11 h-11 object-contain" />
          <div className="font-display font-bold text-lg tracking-wide text-goldLight leading-none">
            CAPO CLICKS
            <span className="block font-mono text-[9px] tracking-[0.3em] text-muted font-normal mt-0.5">
              PHOTOGRAPHY
            </span>
          </div>
        </Link>

        <div className="hidden md:flex gap-7 text-[13px] text-muted">
          <Link href="/services" className="hover:text-goldLight transition">Services</Link>
          <Link href="/frames" className="hover:text-goldLight transition">Frames</Link>
          <Link href="/collage-frames" className="hover:text-goldLight transition">Collage Frames</Link>
          <Link href="/gallery" className="hover:text-goldLight transition">Gallery</Link>
          <Link href="/about" className="hover:text-goldLight transition">About</Link>
          <Link href="/track" className="hover:text-goldLight transition">Track Order</Link>
          <Link href="/contact" className="hover:text-goldLight transition">Contact</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative text-goldLight text-sm">
            Cart
            {count > 0 && (
              <span className="absolute -top-2 -right-3 bg-gold text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <Link href="/booking" className="btn btn-solid !py-2 !px-4 !text-xs">
            Book a Shoot
          </Link>
        </div>
      </div>
    </nav>
  );
}
