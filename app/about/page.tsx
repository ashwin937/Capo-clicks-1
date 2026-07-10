import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — Capo Clicks Photography, Coimbatore",
  description:
    "Learn about Capo Clicks Photography, a Coimbatore-based studio specializing in weddings, baby shoots, events, and custom photo framing.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Capo Clicks Photography",
    description:
      "A Coimbatore-based photography studio built around one idea: every picture tells a story worth keeping.",
    url: "/about",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <div className="eyebrow mb-3 text-amber-500 font-semibold tracking-widest uppercase">
          About Capo Clicks
        </div>

        <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
          Every Picture Holds a Story.
          <br />
          <span className="text-amber-500">
            We Make It Last Forever.
          </span>
        </h1>

        <p className="text-lg text-muted leading-relaxed max-w-3xl mx-auto">
          At <strong>Capo Clicks Photography</strong>, we believe memories are
          life's most valuable treasures. A photograph is more than an image—
          it captures emotions, celebrations, milestones, and moments that can
          never be recreated. Our passion is transforming those unforgettable
          memories into timeless photographs and beautifully handcrafted frames
          that become a part of your home and your story.
        </p>
      </div>

      <div className="space-y-8 text-muted leading-8 text-lg">
        <p>
          Based in <strong>Coimbatore</strong>, Capo Clicks specializes in
          weddings, receptions, baby shoots, family portraits, events, and
          personalized photo framing. From the moment we capture your memories
          to the final framed masterpiece, every detail is handled with care,
          creativity, and precision.
        </p>

        <p>
          With <strong className="text-amber-500">100+ custom frames</strong>{" "}
          crafted for happy customers, we have had the privilege of preserving
          countless birthdays, anniversaries, weddings, graduations, and family
          milestones. Every frame is designed not just to decorate a wall, but
          to celebrate the emotions behind every photograph.
        </p>

        <p>
          Our custom framing service is designed to bring your memories to life.
          Whether it is a single portrait, a premium wall frame, or a
          personalized collage that tells an entire journey, we create each
          piece using quality materials, elegant designs, and careful
          craftsmanship to ensure it lasts for generations.
        </p>

        <p>
          What truly sets us apart is our commitment to quality, attention to
          detail, and customer satisfaction. Every order receives the same
          dedication because we understand that behind every photograph is a
          memory that deserves to be cherished forever.
        </p>
      </div>

      <div className="mt-16 grid md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-zinc-800 p-6 text-center">
          <h3 className="text-4xl font-bold text-amber-500">100+</h3>
          <p className="mt-2 font-medium">Memories Beautifully Framed</p>
        </div>

        <div className="rounded-xl border border-zinc-800 p-6 text-center">
          <h3 className="text-4xl font-bold text-amber-500">Premium</h3>
          <p className="mt-2 font-medium">Quality Materials & Craftsmanship</p>
        </div>

        <div className="rounded-xl border border-zinc-800 p-6 text-center">
          <h3 className="text-4xl font-bold text-amber-500">100%</h3>
          <p className="mt-2 font-medium">Personalized Designs</p>
        </div>
      </div>

      <div className="mt-16 text-center border-t border-zinc-800 pt-10">
        <h2 className="font-display text-3xl font-bold mb-4">
          Our Vision
        </h2>

        <p className="text-lg text-muted max-w-3xl mx-auto leading-relaxed">
          To become the trusted destination where every cherished memory finds
          its perfect frame—bringing warmth, happiness, and timeless beauty into
          every home.
        </p>

        <blockquote className="mt-10 text-2xl md:text-3xl italic font-semibold text-amber-500">
          "Where every click becomes a memory,
          <br />
          and every memory becomes a masterpiece."
        </blockquote>
      </div>
    </div>
  );
}
