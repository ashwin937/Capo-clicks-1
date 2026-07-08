import { getFrameSizes, getPackages } from "@/lib/publicData";
import { COLLAGE_DESIGN_FEE } from "@/lib/data";

type CartItemInput = {
  type: "frame" | "collage_frame";
  sizeId: string;
  quantity: number;
};

// Recomputes the real order total from live pricing data (frame sizes /
// packages, whichever the admin has actually set) rather than trusting
// whatever number the browser sent. This is what stops someone from editing
// the request in devtools to pay less than the real price.
export async function computeOrderTotal(params: {
  orderType: "frame" | "collage_frame" | "photoshoot";
  items?: CartItemInput[];
  serviceOrPackageId?: string | null;
}): Promise<{ total: number; valid: boolean; reason?: string }> {
  const { orderType, items, serviceOrPackageId } = params;

  if (orderType === "photoshoot") {
    if (!serviceOrPackageId) return { total: 0, valid: true };
    const packages = await getPackages();
    const pkg = packages.find((p) => p.id === serviceOrPackageId);
    // Quote-based services (not in the fixed packages list) have no
    // pre-set price — a deposit/quote is arranged manually, so 0 is correct.
    if (!pkg) return { total: 0, valid: true };
    return { total: pkg.price, valid: true };
  }

  if (!items || items.length === 0) {
    return { total: 0, valid: false, reason: "No items in order" };
  }

  const sizes = await getFrameSizes();
  let total = 0;

  for (const item of items) {
    const size = sizes.find((s) => s.id === item.sizeId);
    if (!size) {
      return { total: 0, valid: false, reason: `Unknown frame size: ${item.sizeId}` };
    }
    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const unitPrice = size.price + (item.type === "collage_frame" ? COLLAGE_DESIGN_FEE : 0);
    total += unitPrice * qty;
  }

  return { total, valid: true };
}
