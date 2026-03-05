"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2, ExternalLink } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUpload, type ImageItem } from "./ImageUpload";

const SERIF_FONT = "var(--font-playfair), 'Playfair Display', Georgia, serif";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

type EventData = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  date: string;
  location: string | null;
  priceInCents: number;
  maxSeats: number | null;
  published: boolean;
  images: { id: string; url: string; gcsPath: string; order: number }[];
};

export function EventForm({ event }: { event?: EventData }) {
  const router = useRouter();
  const isEditing = !!event;

  const [title, setTitle] = useState(event?.title ?? "");
  const [slug, setSlug] = useState(event?.slug ?? "");
  const [slugManual, setSlugManual] = useState(isEditing);
  const [description, setDescription] = useState(event?.description ?? "");
  const [date, setDate] = useState(() => {
    if (!event?.date) return "";
    const d = new Date(event.date);
    return d.toISOString().slice(0, 16);
  });
  const [location, setLocation] = useState(event?.location ?? "");
  const [price, setPrice] = useState(() => (event ? (event.priceInCents / 100).toFixed(2) : ""));
  const [maxSeats, setMaxSeats] = useState(() => (event?.maxSeats ? String(event.maxSeats) : ""));
  const [published, setPublished] = useState(event?.published ?? false);
  const [images, setImages] = useState<ImageItem[]>(() =>
    event?.images.map((img) => ({
      id: img.id,
      url: img.url,
      gcsPath: img.gcsPath,
      order: img.order,
    })) ?? []
  );

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!slugManual) setSlug(slugify(title));
  }, [title, slugManual]);

  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => setSaved(false), 2000);
      return () => clearTimeout(t);
    }
  }, [saved]);

  async function handleSave() {
    setSaving(true);
    setError(null);

    const body = {
      title,
      slug,
      description: description || null,
      date,
      location: location || null,
      priceInCents: Math.round(parseFloat(price) * 100),
      maxSeats: maxSeats ? parseInt(maxSeats) : null,
      published,
      images: images.map((img, i) => ({
        id: img.id,
        url: img.url,
        gcsPath: img.gcsPath,
        order: i,
        isNew: img.isNew,
      })),
    };

    const url = isEditing ? `/api/admin/events/${event.id}` : "/api/admin/events";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save event");
      setSaving(false);
      return;
    }

    const data = await res.json();
    setSaving(false);
    setSaved(true);

    if (!isEditing) {
      router.push(`/admin/events/${data.event.id}/edit`);
    } else {
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!event || !confirm("Delete this event? This will also remove all registrations and images.")) return;
    setDeleting(true);
    await fetch(`/api/admin/events/${event.id}`, { method: "DELETE" });
    router.push("/admin");
  }

  const inputClass =
    "w-full h-10 px-3 text-sm border border-[#e0d6c8] rounded-md bg-white text-[#2a231a] transition-all focus:outline-none focus:border-[#b5604a] focus:ring-2 focus:ring-[rgba(181,96,74,0.15)]";
  const labelClass = "block text-[11px] font-bold text-[#2a231a] uppercase tracking-[0.14em] mb-1.5";

  return (
    <>
      <style>{`
        .line-grid-admin {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(#e0d6c8 1px, transparent 1px),
            linear-gradient(90deg, #e0d6c8 1px, transparent 1px);
          background-size: 64px 64px;
          opacity: 0.28;
        }
      `}</style>

      <div className="min-h-screen bg-[#f0e9db] relative">
        <div className="line-grid-admin" />

        {/* Top bar */}
        <header className="relative border-b border-[#e0d6c8] bg-[rgba(253,250,245,0.9)] backdrop-blur-lg sticky top-0 z-30">
          <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center justify-between">
            <button
              onClick={() => router.push("/admin")}
              className="flex items-center gap-2 text-[12px] font-semibold text-[#8c7f6e] hover:text-[#2a231a] transition-colors bg-transparent border-none cursor-pointer"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>

            <div className="flex items-center gap-3">
              {saved && (
                <span className="text-[12px] font-semibold text-[#4a7a6a]">Saved!</span>
              )}
              {error && (
                <span className="text-[12px] font-semibold text-[#b5604a]">{error}</span>
              )}

              {isEditing && (
                <a
                  href={`/events/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 h-9 px-3 text-[11px] font-bold tracking-[0.12em] uppercase border border-[#e0d6c8] rounded-md bg-[#fdfaf5] text-[#8c7f6e] no-underline transition-all hover:border-[#b5604a] hover:text-[#b5604a]"
                >
                  <ExternalLink size={12} />
                  Preview
                </a>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 h-9 px-5 text-[11px] font-bold tracking-[0.12em] uppercase bg-[#b5604a] text-white rounded-md cursor-pointer transition-all hover:bg-[#9a4e3b] border-none disabled:opacity-60"
              >
                <Save size={14} />
                {saving ? "Saving…" : isEditing ? "Save Changes" : "Create Event"}
              </button>
            </div>
          </div>
        </header>

        <main className="relative max-w-[1200px] mx-auto px-6 py-8">
          {/* Page title */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.22em] uppercase border border-[#e8b4a4] px-3 py-1 rounded-full text-[#b5604a] bg-[rgba(181,96,74,0.06)] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b5604a]" />
              {isEditing ? "Edit Event" : "New Event"}
            </div>
            <h1
              className="text-[clamp(26px,3.5vw,36px)] font-light text-[#2a231a]"
              style={{ fontFamily: SERIF_FONT }}
            >
              {isEditing ? title || "Untitled Event" : "Create a new event"}
            </h1>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
            {/* Main content */}
            <div className="flex flex-col gap-6">
              {/* Title & Slug card */}
              <div className="bg-[#fdfaf5] border border-[#e0d6c8] rounded-xl p-6 space-y-4">
                <div>
                  <label className={labelClass}>Title</label>
                  <input
                    className={inputClass}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Friday Night Poker"
                  />
                </div>
                <div>
                  <label className={labelClass}>Slug</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#8c7f6e]">/events/</span>
                    <input
                      className={inputClass}
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        setSlugManual(true);
                      }}
                      placeholder="friday-night-poker"
                    />
                  </div>
                </div>
              </div>

              {/* Description card */}
              <div className="bg-[#fdfaf5] border border-[#e0d6c8] rounded-xl p-6">
                <label className={`${labelClass} mb-3`}>Description</label>
                <RichTextEditor
                  content={description}
                  onChange={setDescription}
                  placeholder="Describe the event — rules, what to expect, schedule…"
                />
              </div>

              {/* Images card */}
              <div className="bg-[#fdfaf5] border border-[#e0d6c8] rounded-xl p-6">
                <label className={`${labelClass} mb-3`}>
                  Images
                  <span className="ml-2 text-[#8c7f6e] font-normal normal-case tracking-normal">
                    — first image is the cover
                  </span>
                </label>
                <ImageUpload images={images} onChange={setImages} folder="events" />
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-6">
              {/* Details card */}
              <div className="bg-[#fdfaf5] border border-[#e0d6c8] rounded-xl p-6 space-y-4">
                <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#8c7f6e] pb-2 border-b border-[#e0d6c8]">
                  Event Details
                </div>

                <div>
                  <label className={labelClass}>Date & Time</label>
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    className={inputClass}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Poker Studio, Room 1"
                  />
                </div>

                <div>
                  <label className={labelClass}>Price (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={inputClass}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="50.00"
                  />
                </div>

                <div>
                  <label className={labelClass}>Max Seats</label>
                  <input
                    type="number"
                    min="1"
                    className={inputClass}
                    value={maxSeats}
                    onChange={(e) => setMaxSeats(e.target.value)}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>

              {/* Publish card */}
              <div className="bg-[#fdfaf5] border border-[#e0d6c8] rounded-xl p-6">
                <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#8c7f6e] pb-2 border-b border-[#e0d6c8] mb-4">
                  Visibility
                </div>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-sm font-semibold text-[#2a231a]">
                      {published ? "Published" : "Draft"}
                    </div>
                    <div className="text-[12px] text-[#8c7f6e] mt-0.5">
                      {published ? "Visible to everyone" : "Only visible to admins"}
                    </div>
                  </div>
                  <div
                    className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${
                      published ? "bg-[#4a7a6a]" : "bg-[#e0d6c8]"
                    }`}
                    onClick={() => setPublished(!published)}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                        published ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </div>
                </label>
              </div>

              {/* Save button (mobile-friendly duplicate) */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-[#b5604a] text-white text-[12px] font-bold tracking-[0.16em] uppercase py-3.5 rounded-md cursor-pointer transition-all hover:bg-[#9a4e3b] border-none disabled:opacity-60 lg:hidden"
              >
                <Save size={14} />
                {saving ? "Saving…" : isEditing ? "Save Changes" : "Create Event"}
              </button>

              {/* Danger zone */}
              {isEditing && (
                <div className="bg-[#fdfaf5] border border-[#e0d6c8] rounded-xl p-6">
                  <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#b5604a] pb-2 border-b border-[#e0d6c8] mb-4">
                    Danger Zone
                  </div>
                  <p className="text-[12px] text-[#8c7f6e] mb-4 leading-relaxed">
                    Deleting this event will permanently remove it along with all registrations and images.
                  </p>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full flex items-center justify-center gap-2 text-[12px] font-bold tracking-[0.14em] uppercase py-2.5 rounded-md border border-[#e0d6c8] bg-transparent text-[#b5604a] cursor-pointer transition-all hover:bg-[rgba(181,96,74,0.06)] hover:border-[#e8b4a4] disabled:opacity-60"
                  >
                    <Trash2 size={14} />
                    {deleting ? "Deleting…" : "Delete Event"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
