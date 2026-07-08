"use client";

import { useEffect, useState } from "react";

type FrameSize = { id: string; label: string; price: number };
type Package = { id: string; name: string; price: number; badge?: string; includes: string[] };
type QuoteService = { id: string; name: string; description?: string; starting_price?: number | null };

function fmt(n: number) {
  return "\u20B9" + Number(n).toLocaleString("en-IN");
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminEditor({ supabaseConfigured }: { supabaseConfigured: boolean }) {
  const [tab, setTab] = useState<"frames" | "packages" | "services" | "gallery">("frames");

  return (
    <div className="mt-16">
      <h2 className="font-display text-xl text-goldLight mb-2">Manage Site Content</h2>
      {!supabaseConfigured && (
        <p className="text-sm text-muted mb-6 italic">
          Supabase isn't connected, so pricing tabs are showing built-in defaults from{" "}
          <code>lib/data.ts</code> and the gallery tab is empty — none of them can save changes yet. Connect
          Supabase (see README) to make this editor fully live.
        </p>
      )}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: "frames", label: "Frame Sizes" },
          { id: "packages", label: "Packages" },
          { id: "services", label: "Quote Services" },
          { id: "gallery", label: "Gallery" }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`text-xs uppercase tracking-wide px-4 py-2 rounded-full border ${
              tab === t.id ? "bg-gold text-black border-gold" : "border-line text-muted hover:border-gold"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "frames" && <FrameSizesEditor supabaseConfigured={supabaseConfigured} />}
      {tab === "packages" && <PackagesEditor supabaseConfigured={supabaseConfigured} />}
      {tab === "services" && <QuoteServicesEditor supabaseConfigured={supabaseConfigured} />}
      {tab === "gallery" && <GalleryEditor supabaseConfigured={supabaseConfigured} />}
    </div>
  );
}

function StatusMsg({ msg, error }: { msg: string; error?: boolean }) {
  if (!msg) return null;
  return <p className={`text-xs mb-4 ${error ? "text-red-400" : "text-goldLight"}`}>{msg}</p>;
}

function FrameSizesEditor({ supabaseConfigured }: { supabaseConfigured: boolean }) {
  const [items, setItems] = useState<FrameSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [statusError, setStatusError] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newPrice, setNewPrice] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/frame-sizes");
    const data = await res.json();
    setItems(data.items || []);
    if (data.note) {
      setStatusError(false);
      setStatus(data.note);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(item: FrameSize) {
    setStatus("");
    const res = await fetch("/api/admin/frame-sizes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    });
    const data = await res.json();
    if (!res.ok) {
      setStatusError(true);
      setStatus(data.error || "Save failed");
    } else {
      setStatusError(false);
      setStatus(`Saved ${item.label}`);
      load();
    }
  }

  async function remove(id: string) {
    const res = await fetch("/api/admin/frame-sizes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (!res.ok) {
      setStatusError(true);
      setStatus(data.error || "Delete failed");
    } else {
      setStatusError(false);
      setStatus("Deleted");
      load();
    }
  }

  async function addNew() {
    if (!newLabel || !newPrice) return;
    const id = slugify(newLabel);
    await save({ id, label: newLabel, price: Number(newPrice) });
    setNewLabel("");
    setNewPrice("");
  }

  if (loading) return <p className="text-sm text-muted">Loading...</p>;

  return (
    <div>
      <StatusMsg msg={status} error={statusError} />
      <div className="border border-line">
        {items.map((item, i) => (
          <FrameRow key={item.id} item={item} onSave={save} onDelete={remove} disabled={!supabaseConfigured} isLast={i === items.length - 1} />
        ))}
      </div>

      <div className="card p-5 mt-6">
        <p className="text-xs uppercase tracking-wide text-muted mb-3">Add new size</p>
        <div className="flex gap-3 flex-wrap">
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="e.g. 20 x 24 in"
            className="flex-1 min-w-[160px] bg-black border border-line px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-gold"
          />
          <input
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            type="number"
            placeholder="Price (₹)"
            className="w-32 bg-black border border-line px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-gold"
          />
          <button onClick={addNew} disabled={!supabaseConfigured} className="btn btn-solid !text-xs">
            Add Size
          </button>
        </div>
      </div>
    </div>
  );
}

function FrameRow({
  item,
  onSave,
  onDelete,
  disabled,
  isLast
}: {
  item: FrameSize;
  onSave: (i: FrameSize) => void;
  onDelete: (id: string) => void;
  disabled: boolean;
  isLast: boolean;
}) {
  const [label, setLabel] = useState(item.label);
  const [price, setPrice] = useState(String(item.price));
  const dirty = label !== item.label || Number(price) !== item.price;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${!isLast ? "border-b border-line" : ""}`}>
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="flex-1 bg-transparent text-sm focus:outline-none border-b border-transparent focus:border-gold"
      />
      <span className="text-muted text-sm">₹</span>
      <input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        type="number"
        className="w-24 bg-transparent text-sm font-mono focus:outline-none border-b border-transparent focus:border-gold"
      />
      <button
        onClick={() => onSave({ ...item, label, price: Number(price) })}
        disabled={disabled || !dirty}
        className="text-xs text-goldLight disabled:text-muted disabled:opacity-40 uppercase tracking-wide"
      >
        Save
      </button>
      <button onClick={() => onDelete(item.id)} disabled={disabled} className="text-xs text-muted hover:text-red-400 disabled:opacity-40">
        Delete
      </button>
    </div>
  );
}

function PackagesEditor({ supabaseConfigured }: { supabaseConfigured: boolean }) {
  const [items, setItems] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [statusError, setStatusError] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/packages");
    const data = await res.json();
    setItems(data.items || []);
    if (data.note) {
      setStatusError(false);
      setStatus(data.note);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(pkg: Package) {
    const res = await fetch("/api/admin/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pkg)
    });
    const data = await res.json();
    if (!res.ok) {
      setStatusError(true);
      setStatus(data.error || "Save failed");
    } else {
      setStatusError(false);
      setStatus(`Saved ${pkg.name}`);
      load();
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading...</p>;

  return (
    <div>
      <StatusMsg msg={status} error={statusError} />
      <div className="space-y-5">
        {items.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} onSave={save} disabled={!supabaseConfigured} />
        ))}
      </div>
    </div>
  );
}

function PackageCard({ pkg, onSave, disabled }: { pkg: Package; onSave: (p: Package) => void; disabled: boolean }) {
  const [name, setName] = useState(pkg.name);
  const [price, setPrice] = useState(String(pkg.price));
  const [badge, setBadge] = useState(pkg.badge || "");
  const [includesText, setIncludesText] = useState(pkg.includes.join("\n"));

  function handleSave() {
    onSave({
      ...pkg,
      name,
      price: Number(price),
      badge,
      includes: includesText.split("\n").map((l) => l.trim()).filter(Boolean)
    });
  }

  return (
    <div className="card p-5">
      <div className="grid md:grid-cols-2 gap-3 mb-3">
        <input value={name} onChange={(e) => setName(e.target.value)} className="bg-black border border-line px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-gold" />
        <div className="flex items-center gap-2">
          <span className="text-muted text-sm">₹</span>
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" className="flex-1 bg-black border border-line px-3 py-2 text-sm font-mono rounded-sm focus:outline-none focus:border-gold" />
        </div>
      </div>
      <input
        value={badge}
        onChange={(e) => setBadge(e.target.value)}
        placeholder="Badge text (optional, e.g. Limited slots available)"
        className="w-full bg-black border border-line px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-gold mb-3"
      />
      <textarea
        value={includesText}
        onChange={(e) => setIncludesText(e.target.value)}
        rows={5}
        placeholder="One inclusion per line"
        className="w-full bg-black border border-line px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-gold mb-3"
      />
      <button onClick={handleSave} disabled={disabled} className="btn btn-solid !text-xs !py-2 disabled:opacity-40">
        Save Package
      </button>
    </div>
  );
}

function QuoteServicesEditor({ supabaseConfigured }: { supabaseConfigured: boolean }) {
  const [items, setItems] = useState<QuoteService[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [statusError, setStatusError] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/quote-services");
    const data = await res.json();
    setItems(data.items || []);
    if (data.note) {
      setStatusError(false);
      setStatus(data.note);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(svc: QuoteService) {
    const res = await fetch("/api/admin/quote-services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(svc)
    });
    const data = await res.json();
    if (!res.ok) {
      setStatusError(true);
      setStatus(data.error || "Save failed");
    } else {
      setStatusError(false);
      setStatus(`Saved ${svc.name}`);
      load();
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading...</p>;

  return (
    <div>
      <StatusMsg msg={status} error={statusError} />
      <div className="space-y-4">
        {items.map((svc) => (
          <ServiceRow key={svc.id} svc={svc} onSave={save} disabled={!supabaseConfigured} />
        ))}
      </div>
    </div>
  );
}

function ServiceRow({ svc, onSave, disabled }: { svc: QuoteService; onSave: (s: QuoteService) => void; disabled: boolean }) {
  const [name, setName] = useState(svc.name);
  const [description, setDescription] = useState(svc.description || "");
  const [startingPrice, setStartingPrice] = useState(svc.starting_price ? String(svc.starting_price) : "");

  return (
    <div className="card p-5">
      <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black border border-line px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-gold mb-3" />
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full bg-black border border-line px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-gold mb-3" />
      <div className="flex gap-3 items-center">
        <span className="text-muted text-sm">Starting price (optional) ₹</span>
        <input value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} type="number" className="w-32 bg-black border border-line px-3 py-2 text-sm font-mono rounded-sm focus:outline-none focus:border-gold" />
        <button
          onClick={() => onSave({ ...svc, name, description, starting_price: startingPrice ? Number(startingPrice) : null })}
          disabled={disabled}
          className="btn btn-solid !text-xs !py-2 ml-auto disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </div>
  );
}

type GalleryItem = { id: string; title: string; category: string; image_url: string };

const GALLERY_CATEGORIES = ["Wedding", "Birthday & Events", "Outdoor", "Baby Shoots", "Framed Art", "Custom Collage Frames"];

function GalleryEditor({ supabaseConfigured }: { supabaseConfigured: boolean }) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [statusError, setStatusError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(GALLERY_CATEGORIES[0]);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/gallery");
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload() {
    if (!file || !title) {
      setStatusError(true);
      setStatus("Choose a photo and enter a title first.");
      return;
    }
    setUploading(true);
    setStatus("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("category", category);

    const res = await fetch("/api/admin/gallery", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setStatusError(true);
      setStatus(data.error || "Upload failed");
    } else {
      setStatusError(false);
      setStatus("Uploaded!");
      setFile(null);
      setTitle("");
      load();
    }
  }

  async function remove(id: string) {
    const res = await fetch("/api/admin/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (!res.ok) {
      setStatusError(true);
      setStatus(data.error || "Delete failed");
    } else {
      setStatusError(false);
      setStatus("Deleted");
      load();
    }
  }

  return (
    <div>
      <StatusMsg msg={status} error={statusError} />

      <div className="card p-5 mb-8">
        <p className="text-xs uppercase tracking-wide text-muted mb-3">Upload new photo</p>
        <div className="flex gap-3 flex-wrap items-center">
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-xs text-muted flex-1 min-w-[180px]"
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title, e.g. Wedding — Priya & Arjun"
            className="flex-1 min-w-[180px] bg-black border border-line px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-gold"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-black border border-line px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-gold"
          >
            {GALLERY_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button onClick={handleUpload} disabled={!supabaseConfigured || uploading} className="btn btn-solid !text-xs disabled:opacity-40">
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">No photos uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map((item) => (
            <div key={item.id} className="border border-line relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image_url} alt={item.title} className="w-full aspect-[3/4] object-cover" />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition flex flex-col justify-between p-2">
                <span className="text-[10px] text-goldLight uppercase">{item.category}</span>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] text-cream truncate">{item.title}</span>
                  <button onClick={() => remove(item.id)} className="text-[10px] text-red-400 uppercase">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
