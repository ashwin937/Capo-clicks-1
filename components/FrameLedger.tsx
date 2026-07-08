"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { COLLAGE_DESIGN_FEE, FrameSize } from "@/lib/data";
import { useCart } from "./CartProvider";

function fmt(n: number) {
  return "\u20B9" + n.toLocaleString("en-IN");
}

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_COLLAGE_FILES = 10;

export default function FrameLedger({ mode, sizes }: { mode: "frame" | "collage_frame"; sizes: FrameSize[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [added, setAdded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addItem } = useCart();
  const router = useRouter();

  const size = sizes[selectedIndex];

  if (!size) {
    return <p className="text-sm text-muted">No frame sizes are configured yet.</p>;
  }

  const designFee = mode === "collage_frame" ? COLLAGE_DESIGN_FEE : 0;
  const total = (size.price + designFee) * qty;

  function handleUploadClick() {
    setUploadError("");
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files || []);
    e.target.value = ""; // allow re-selecting the same file later

    const valid: File[] = [];
    for (const file of picked) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError(`${file.name} isn't a JPG or PNG image.`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        setUploadError(`${file.name} is larger than 10MB.`);
        continue;
      }
      valid.push(file);
    }

    if (mode === "frame") {
      setFiles(valid.slice(0, 1));
    } else {
      setFiles((prev) => [...prev, ...valid].slice(0, MAX_COLLAGE_FILES));
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleAddToCart() {
    setUploadError("");
    let uploadedUrls: string[] = [];

    if (files.length > 0) {
      setUploading(true);
      try {
        const formData = new FormData();
        files.forEach((f) => formData.append("files", f));
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (res.ok) {
          uploadedUrls = data.urls;
        } else if (res.status === 501) {
          // Storage not connected yet — still let the order through, but be
          // upfront that only the file name was recorded, not the photo itself.
          setUploadError(
            "Heads up: photo storage isn't connected yet, so only the file name is being saved with this order — please WhatsApp us the actual photo after ordering."
          );
        } else {
          setUploadError(data.error || "Upload failed. Please try again.");
          setUploading(false);
          return;
        }
      } catch {
        setUploadError("Upload failed — check your connection and try again.");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    addItem({
      id: `${mode}-${size.id}-${Date.now()}`,
      type: mode,
      sizeId: size.id,
      sizeLabel: size.label,
      unitPrice: size.price,
      quantity: qty,
      designFee: designFee || undefined,
      uploadedFileName: files.map((f) => f.name).join(", ") || undefined,
      uploadedFileUrl: mode === "frame" ? uploadedUrls[0] : undefined,
      uploadedFileUrls: mode === "collage_frame" ? uploadedUrls : undefined,
      customTitle: title || undefined,
      customCaption: caption || undefined
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="grid md:grid-cols-[1.4fr_1fr] gap-10 items-start">
      <div>
        <div className="border border-line">
          {sizes.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setSelectedIndex(i)}
              className={`w-full flex justify-between items-center px-5 py-3 font-mono text-sm border-b border-line last:border-b-0 transition text-left ${
                i === selectedIndex ? "bg-gold/10 text-goldLight" : "hover:bg-gold/5"
              }`}
            >
              <span>{s.label}</span>
              <span className="text-gold">{fmt(s.price)}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-6">
          {["Wedding Photos", "Family Portraits", "Baby Shoots", "Couple Photos", "Wall Decor"].map((t) => (
            <span key={t} className="text-[11px] uppercase tracking-wide border border-line text-muted px-3 py-1.5 rounded-full">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="card p-6 md:sticky md:top-24">
        <span className="eyebrow block mb-1.5">Order slip</span>
        <h3 className="font-display text-xl text-goldLight mb-5">
          {mode === "collage_frame" ? "Custom collage frame" : "Custom frame"}
        </h3>

        <div className="flex justify-between py-2.5 border-b border-dashed border-line text-sm">
          <span className="text-muted">Size</span>
          <span className="font-mono">{size.label}</span>
        </div>
        <div className="flex justify-between py-2.5 border-b border-dashed border-line text-sm">
          <span className="text-muted">Base price</span>
          <span className="font-mono">{fmt(size.price)}</span>
        </div>
        {mode === "collage_frame" && (
          <div className="flex justify-between py-2.5 border-b border-dashed border-line text-sm">
            <span className="text-muted">Design fee</span>
            <span className="font-mono">{fmt(designFee)}</span>
          </div>
        )}
        <div className="flex justify-between items-center py-2.5 border-b border-dashed border-line text-sm">
          <span className="text-muted">Quantity</span>
          <span className="flex items-center gap-3.5">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-[26px] h-[26px] border border-gold text-goldLight rounded-sm">&minus;</button>
            <span className="font-mono">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} className="w-[26px] h-[26px] border border-gold text-goldLight rounded-sm">+</button>
          </span>
        </div>

        {mode === "collage_frame" && (
          <div className="my-4 space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title / names (optional)"
              className="w-full bg-black border border-line px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-gold"
            />
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Short caption (optional)"
              className="w-full bg-black border border-line px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-gold"
            />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          multiple={mode === "collage_frame"}
          onChange={handleFileChange}
          className="hidden"
        />

        <div
          onClick={handleUploadClick}
          className="border border-dashed border-line hover:border-gold text-center text-xs text-muted p-4 my-4 rounded-sm cursor-pointer"
        >
          {mode === "collage_frame"
            ? files.length > 0
              ? `${files.length} photo(s) selected — click to add more`
              : "+ Upload up to 10 photos for your collage (JPG/PNG, max 10MB each)"
            : files.length > 0
              ? "Click to replace photo"
              : "+ Upload your photo (JPG/PNG, max 10MB)"}
        </div>

        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {files.map((f, i) => (
              <span key={f.name + i} className="flex items-center gap-2 text-xs bg-black border border-line rounded-sm px-2.5 py-1.5">
                <img
                  src={URL.createObjectURL(f)}
                  alt={f.name}
                  className="w-6 h-6 object-cover rounded-sm"
                />
                <span className="text-cream max-w-[110px] truncate">{f.name}</span>
                <button onClick={() => removeFile(i)} className="text-muted hover:text-red-400">&times;</button>
              </span>
            ))}
          </div>
        )}

        {uploadError && <p className="text-xs text-red-400 mb-4">{uploadError}</p>}

        {mode === "collage_frame" && (
          <p className="text-xs text-muted mb-4">
            Custom collage orders include design time — our team will share a preview before printing.
          </p>
        )}

        <div className="flex justify-between items-center py-3 font-display text-lg text-goldLight">
          <span>Total</span>
          <span className="font-mono">{fmt(total)}</span>
        </div>

        <button onClick={handleAddToCart} disabled={uploading} className="btn btn-solid w-full mb-2">
          {uploading ? "Uploading..." : added ? "Added to cart ✓" : "Add to Cart"}
        </button>
        <button onClick={() => router.push("/cart")} className="btn btn-outline w-full !text-xs">
          Go to Cart
        </button>
      </div>
    </div>
  );
}
