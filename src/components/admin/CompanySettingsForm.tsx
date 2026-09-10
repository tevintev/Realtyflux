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
  linkedinUrl: string | null;
}

function uploadLogoFile(file: File, onProgress: (p: number) => void) {
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
        reject(new Error(res?.error || "Logo upload failed."));
      }
    };
    xhr.onerror = () => reject(new Error("Logo upload failed."));
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
  const [linkedinUrl, setLinkedinUrl] = useState(settings.linkedinUrl || "");
  const [logoUrl, setLogoUrl] = useState(settings.logo || "");

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
      const path = await uploadLogoFile(file, setLogoProgress);
      setLogoUrl(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logo upload failed.");
    } finally {
      setLogoUploading(false);
      setLogoProgress(0);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (logoUploading) return;
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
      linkedinUrl: linkedinUrl || undefined,
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
          disabled={saving || logoUploading}
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
            <label className="input-label" htmlFor="linkedin">
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                <LinkIcon size={13} style={{ color: "#0a66c2" }} />
                <span style={{ color: "#0a66c2" }}>LinkedIn</span>
              </span>
            </label>
            <input id="linkedin" type="url" className="input-field" placeholder="https://linkedin.com/company/yourcompany" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Bottom Save button */}
      <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: "2rem" }}>
        <button
          type="submit"
          disabled={saving || logoUploading}
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
