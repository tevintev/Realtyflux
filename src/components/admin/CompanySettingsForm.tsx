"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Save,
  LoaderCircle,
  Upload,
  Link as LinkIcon,
  CheckCircle,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
} from "lucide-react";
import { updateCompanySettings, type CompanySettingsInput } from "@/app/actions/settings";

interface CompanySettingsData {
  id: string;
  companyName: string;
  logo: string | null;
  mission: string | null;
  about: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  tiktokUrl: string | null;
  heroImages: string[];
}

const MAX_HERO_IMAGES = 3;

const iconButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 30,
  height: 30,
  borderRadius: 8,
  border: "1px solid var(--color-stone-200)",
  background: "var(--bg-secondary)",
  color: "var(--text-primary)",
  cursor: "pointer",
};

function uploadImageFile(file: File, onProgress: (p: number) => void) {
  return new Promise<string>((resolve, reject) => {
    const formData = new FormData();
    formData.append("files", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      const res = typeof xhr.response === "string" ? JSON.parse(xhr.response) : xhr.response;
      if (xhr.status >= 200 && xhr.status < 300 && res?.files?.[0]?.path) {
        resolve(res.files[0].path as string);
      } else {
        reject(new Error(res?.error || "Image upload failed."));
      }
    };
    xhr.onerror = () => reject(new Error("Image upload failed."));
    xhr.send(formData);
  });
}

export default function CompanySettingsForm({ settings }: { settings: CompanySettingsData }) {
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [email, setEmail] = useState(settings.email || "");
  const [phone, setPhone] = useState(settings.phone || "");
  const [address, setAddress] = useState(settings.address || "");
  const [mission, setMission] = useState(settings.mission || "");
  const [about, setAbout] = useState(settings.about || "");
  const [facebookUrl, setFacebookUrl] = useState(settings.facebookUrl || "");
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl || "");
  const [twitterUrl, setTwitterUrl] = useState(settings.twitterUrl || "");
  const [tiktokUrl, setTiktokUrl] = useState(settings.tiktokUrl || "");
  const [logoUrl, setLogoUrl] = useState(settings.logo || "");
  const [heroImages, setHeroImages] = useState<string[]>(settings.heroImages ?? []);
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroProgress, setHeroProgress] = useState(0);

  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    setLogoProgress(0);
    setError("");
    try {
      const path = await uploadImageFile(file, setLogoProgress);
      setLogoUrl(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logo upload failed.");
    } finally {
      setLogoUploading(false);
      setLogoProgress(0);
      e.target.value = "";
    }
  };

  const handleHeroChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (picked.length === 0) return;

    const room = MAX_HERO_IMAGES - heroImages.length;
    setError(
      picked.length > room
        ? `You can add ${room} more image${room === 1 ? "" : "s"} (maximum ${MAX_HERO_IMAGES}); only the first ${room} will be uploaded.`
        : ""
    );
    setHeroUploading(true);
    try {
      for (const file of picked.slice(0, room)) {
        if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image.`);
        if (file.size > 10 * 1024 * 1024) throw new Error(`${file.name} is larger than 10 MB.`);
        setHeroProgress(0);
        const path = await uploadImageFile(file, setHeroProgress);
        setHeroImages((current) => [...current, path].slice(0, MAX_HERO_IMAGES));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setHeroUploading(false);
      setHeroProgress(0);
    }
  };

  const moveHero = (index: number, step: -1 | 1) =>
    setHeroImages((list) => {
      const to = index + step;
      if (to < 0 || to >= list.length) return list;
      const next = [...list];
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });

  const removeHero = (index: number) => setHeroImages((list) => list.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (logoUploading || heroUploading) return;
    setSaving(true);
    setError("");
    setSuccess(false);

    const payload: CompanySettingsInput = {
      companyName,
      logo: logoUrl || undefined,
      email: email || undefined,
      phone: phone || undefined,
      address: address || undefined,
      mission: mission || undefined,
      about: about || undefined,
      facebookUrl: facebookUrl || undefined,
      instagramUrl: instagramUrl || undefined,
      twitterUrl: twitterUrl || undefined,
      tiktokUrl: tiktokUrl || undefined,
      heroImages,
    };

    const res = await updateCompanySettings(payload);
    setSaving(false);
    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            Company Settings
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: "0.2rem 0 0" }}>
            Update your brand information, contact details, and social links.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving || logoUploading || heroUploading}
          className="btn-primary"
          style={{ padding: "0.65rem 1.75rem", fontSize: "0.9rem", border: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          {saving ? <LoaderCircle size={16} className="settings-spin" /> : <Save size={16} />}
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", color: "#dc2626", padding: "0.9rem 1rem", borderRadius: "var(--radius-md)", fontSize: "0.9rem" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", color: "#15803d", padding: "0.9rem 1rem", borderRadius: "var(--radius-md)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CheckCircle size={16} />
          Settings saved successfully!
        </div>
      )}

      {/* Logo section */}
      <div className="card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--color-stone-200)" }}>
          <Building2 size={18} style={{ color: "#16a34a" }} />
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Logo & Branding</h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
          {/* Preview */}
          <div style={{ width: "100px", height: "100px", borderRadius: "16px", border: "2px solid var(--color-stone-200)", overflow: "hidden", background: "#f5f5f4", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Company logo"
                width={100}
                height={100}
                style={{ objectFit: "contain", width: "100%", height: "100%" }}
                unoptimized={!logoUrl.startsWith("/")}
              />
            ) : (
              <Building2 size={40} style={{ color: "var(--color-stone-300)" }} />
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <label
              htmlFor="logo-upload"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.65rem 1.25rem",
                borderRadius: "var(--radius-full)",
                border: "2px solid var(--color-stone-300)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 600,
                fontSize: "0.88rem",
                cursor: logoUploading ? "not-allowed" : "pointer",
                opacity: logoUploading ? 0.7 : 1,
                transition: "all 0.2s ease",
              }}
            >
              <Upload size={15} />
              {logoUploading ? `Uploading… ${logoProgress}%` : "Upload New Logo"}
              <input
                id="logo-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleLogoChange}
                style={{ display: "none" }}
              />
            </label>
            {logoUrl && (
              <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", margin: 0 }}>
                Current: <code style={{ fontSize: "0.75rem" }}>{logoUrl}</code>
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="input-label" htmlFor="companyName">Company Name</label>
          <input
            id="companyName"
            type="text"
            required
            className="input-field"
            placeholder="Realty Flux"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>
      </div>

      {/* Contact Info */}
      <div className="card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--color-stone-200)" }}>
          <Phone size={18} style={{ color: "#16a34a" }} />
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Contact Information</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="settings-two-col">
          <div>
            <label className="input-label" htmlFor="email">
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                <Mail size={13} /> Email Address
              </span>
            </label>
            <input id="email" type="email" className="input-field" placeholder="hello@realtyflux.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="input-label" htmlFor="phone">
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                <Phone size={13} /> Phone Number
              </span>
            </label>
            <input id="phone" type="tel" className="input-field" placeholder="+254 700 123 456" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="input-label" htmlFor="address">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <MapPin size={13} /> Physical Address
            </span>
          </label>
          <input id="address" type="text" className="input-field" placeholder="Westlands Business Park, 4th Floor, Nairobi, Kenya" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
      </div>

      {/* About & Mission */}
      <div className="card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--color-stone-200)" }}>
          <Globe size={18} style={{ color: "#16a34a" }} />
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>About & Mission</h2>
        </div>

        <div>
          <label className="input-label" htmlFor="mission">Mission Statement</label>
          <textarea
            id="mission"
            rows={3}
            className="input-field"
            placeholder="To transform the real estate experience through transparency and innovation..."
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            style={{ resize: "vertical" }}
          />
        </div>

        <div>
          <label className="input-label" htmlFor="about">About Us</label>
          <textarea
            id="about"
            rows={5}
            className="input-field"
            placeholder="Tell your story — who you are, what you do, and what makes you different..."
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            style={{ resize: "vertical" }}
          />
        </div>
      </div>

      {/* Homepage hero images */}
      <div className="card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--color-stone-200)" }}>
          <ImageIcon size={18} style={{ color: "#16a34a" }} />
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Homepage Hero Images</h2>
          <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            {heroImages.length} of {MAX_HERO_IMAGES}
          </span>
        </div>

        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6, margin: 0 }}>
          Upload up to {MAX_HERO_IMAGES} photos for the large banner at the top of the homepage. With two or more they
          slide automatically every few seconds. Landscape photos of at least 1920×1080 work best (10 MB maximum each).
          With none uploaded, the default lobby photo is used. Click <strong>Save Settings</strong> to publish your changes.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
          {heroImages.map((src, i) => (
            <div key={`${src}-${i}`} style={{ border: "1px solid var(--color-stone-200)", borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--bg-secondary)" }}>
              <div style={{ position: "relative", aspectRatio: "16 / 9", background: "var(--color-stone-100)" }}>
                <Image src={src} alt={`Hero image ${i + 1}`} fill sizes="260px" style={{ objectFit: "cover" }} unoptimized={!src.startsWith("/")} />
                <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.65)", color: "#fff", borderRadius: 999, padding: "0.1rem 0.55rem", fontSize: "0.75rem", fontWeight: 700 }}>
                  {i + 1}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.45rem 0.5rem" }}>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <button type="button" onClick={() => moveHero(i, -1)} disabled={i === 0} aria-label="Move earlier" style={{ ...iconButtonStyle, opacity: i === 0 ? 0.35 : 1, cursor: i === 0 ? "default" : "pointer" }}>
                    <ChevronLeft size={16} />
                  </button>
                  <button type="button" onClick={() => moveHero(i, 1)} disabled={i === heroImages.length - 1} aria-label="Move later" style={{ ...iconButtonStyle, opacity: i === heroImages.length - 1 ? 0.35 : 1, cursor: i === heroImages.length - 1 ? "default" : "pointer" }}>
                    <ChevronRight size={16} />
                  </button>
                </div>
                <button type="button" onClick={() => removeHero(i)} aria-label="Remove image" style={{ ...iconButtonStyle, color: "#dc2626" }}>
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}

          {heroImages.length < MAX_HERO_IMAGES && (
            <label
              htmlFor="hero-upload"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                minHeight: 150,
                border: "2px dashed var(--color-stone-300)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-secondary)",
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 600,
                fontSize: "0.88rem",
                cursor: heroUploading ? "not-allowed" : "pointer",
                opacity: heroUploading ? 0.7 : 1,
                transition: "border-color 0.2s ease, color 0.2s ease",
              }}
            >
              <Plus size={22} />
              {heroUploading ? `Uploading… ${heroProgress}%` : "Add image"}
              <input
                id="hero-upload"
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,image/avif"
                onChange={handleHeroChange}
                disabled={heroUploading}
                style={{ display: "none" }}
              />
            </label>
          )}
        </div>
      </div>

      {/* Social Links */}
      <div className="card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--color-stone-200)" }}>
          <Globe size={18} style={{ color: "#16a34a" }} />
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Social Media Links</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="settings-two-col">
          <div>
            <label className="input-label" htmlFor="facebook">
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                <LinkIcon size={13} style={{ color: "#1877f2" }} />
                <span style={{ color: "#1877f2" }}>Facebook</span>
              </span>
            </label>
            <input id="facebook" type="url" className="input-field" placeholder="https://facebook.com/yourpage" value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} />
          </div>
          <div>
            <label className="input-label" htmlFor="instagram">
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                <LinkIcon size={13} style={{ color: "#e1306c" }} />
                <span style={{ color: "#e1306c" }}>Instagram</span>
              </span>
            </label>
            <input id="instagram" type="url" className="input-field" placeholder="https://instagram.com/yourhandle" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} />
          </div>
          <div>
            <label className="input-label" htmlFor="twitter">
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                <LinkIcon size={13} style={{ color: "#1da1f2" }} />
                <span style={{ color: "#1da1f2" }}>Twitter / X</span>
              </span>
            </label>
            <input id="twitter" type="url" className="input-field" placeholder="https://twitter.com/yourhandle" value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} />
          </div>
          <div>
            <label className="input-label" htmlFor="tiktok">
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                <LinkIcon size={13} style={{ color: "#111111" }} />
                <span style={{ color: "#111111" }}>TikTok</span>
              </span>
            </label>
            <input id="tiktok" type="url" className="input-field" placeholder="https://tiktok.com/@yourhandle" value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Bottom Save button */}
      <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: "2rem" }}>
        <button
          type="submit"
          disabled={saving || logoUploading || heroUploading}
          className="btn-primary"
          style={{ padding: "0.8rem 2.5rem", fontSize: "0.95rem", border: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          {saving ? <LoaderCircle size={16} className="settings-spin" /> : <Save size={16} />}
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>

      <style jsx global>{`
        .settings-spin {
          animation: settings-spin-anim 0.8s linear infinite;
        }
        @keyframes settings-spin-anim {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 600px) {
          .settings-two-col {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </form>
  );
}
