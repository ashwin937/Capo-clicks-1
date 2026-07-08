// Static seed data. In production this is mirrored into Supabase (see
// supabase/schema.sql) and the admin dashboard reads/writes the DB instead —
// but the site works out of the box against this file with zero setup.

export type FrameSize = {
  id: string;
  label: string;
  price: number;
};

export const frameSizes: FrameSize[] = [
  { id: "6x4", label: "6 x 4 in", price: 149 },
  { id: "7x5", label: "7 x 5 in", price: 199 },
  { id: "9x6", label: "9 x 6 in", price: 299 },
  { id: "10x8", label: "10 x 8 in", price: 349 },
  { id: "12x8-a4", label: "12 x 8 in (A4)", price: 399 },
  { id: "10x15", label: "10 x 15 in", price: 549 },
  { id: "16x12-a3", label: "16 x 12 in (A3)", price: 749 },
  { id: "12x18", label: "12 x 18 in", price: 799 },
  { id: "16x20", label: "16 x 20 in", price: 1299 },
  { id: "16x24", label: "16 x 24 in", price: 1499 },
  { id: "18x24", label: "18 x 24 in", price: 1799 },
  { id: "20x30", label: "20 x 30 in", price: 2249 },
  { id: "24x36", label: "24 x 36 in", price: 3499 },
  { id: "30x40", label: "30 x 40 in", price: 4199 },
  { id: "30x48", label: "30 x 48 in", price: 5199 },
  { id: "36x60", label: "36 x 60 in", price: 6299 }
];

// Flat design fee added on top of the base frame price for custom collage orders
export const COLLAGE_DESIGN_FEE = 499;

export type Package = {
  id: string;
  name: string;
  price: number;
  badge?: string;
  includes: string[];
};

export const packages: Package[] = [
  {
    id: "baby-shoot-special",
    name: "Baby Shoot Special Offer",
    price: 11999,
    badge: "Limited slots available",
    includes: [
      "30-page premium album",
      "2 photo frames",
      "10 edited photos",
      "Cinematic reels",
      "1 wall calendar (12x18 inch)"
    ]
  },
  {
    id: "reception-photography",
    name: "Reception Photography Package",
    price: 18800,
    badge: "Limited booking slots available",
    includes: [
      "Traditional photography",
      "Premium album — 1 no.",
      "Family photo frame — 1 no.",
      "Unlimited soft copies",
      "Free e-invitation design",
      "Complimentary pre-wedding / post-wedding shoot"
    ]
  },
  {
    id: "reception-photo-video",
    name: "Reception Photography & Videography Package",
    price: 28800,
    badge: "Limited booking slots available",
    includes: [
      "Traditional photography",
      "Traditional videography",
      "Premium album — 1 no. (40 pages)",
      "Traditional long video",
      "64 GB pen drive",
      "Family photo frame — 1 no.",
      "Unlimited soft copies",
      "Free e-invitation design",
      "Complimentary pre-wedding / post-wedding shoot"
    ]
  }
];

export type QuoteService = {
  id: string;
  name: string;
  description: string;
};

export const quoteServices: QuoteService[] = [
  { id: "wedding", name: "Wedding Photography", description: "Full-day wedding coverage, custom quotes based on events and locations." },
  { id: "birthday-events", name: "Birthday & Events", description: "Birthdays, anniversaries, and celebrations of any size." },
  { id: "outdoor", name: "Outdoor Shoots", description: "Location shoots — portraits, couples, pre-wedding." },
  { id: "cinematic-reels", name: "Cinematic Reels", description: "Standalone cinematic video reels for any occasion." },
  { id: "album-design", name: "Album Design", description: "Custom album layout and design service." },
  { id: "photo-editing", name: "Photo Editing", description: "Professional retouching and color grading." },
  { id: "flex-editing", name: "Flex Editing", description: "Large-format flex/banner design and editing." }
];

export type OrderStatus =
  | "order_placed"
  | "design_in_progress"
  | "design_approved"
  | "in_production"
  | "ready_or_shipped"
  | "delivered";

export const statusLabels: Record<OrderStatus, string> = {
  order_placed: "Order Placed",
  design_in_progress: "Design in Progress",
  design_approved: "Design Approved",
  in_production: "In Production",
  ready_or_shipped: "Ready for Pickup / Shipped",
  delivered: "Delivered"
};

export const galleryCategories = [
  "Wedding",
  "Birthday & Events",
  "Outdoor",
  "Baby Shoots",
  "Framed Art",
  "Custom Collage Frames"
] as const;
