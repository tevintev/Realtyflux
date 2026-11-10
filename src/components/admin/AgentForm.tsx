"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User, Upload, Save, LoaderCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createAgent, updateAgent } from "@/app/actions/agents";

interface AgentFormProps {
  initialData?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    photo: string | null;
    bio: string | null;
  };
}

function uploadPhotoFile(file: File, onProgress: (p: number) => void) {
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
        reject(new Error(res?.error || "Photo upload failed."));
      }
    };
    xhr.onerror = () => reject(new Error("Photo upload failed."));
    xhr.send(formData);
  });
}

export default function AgentForm({ initialData }: AgentFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [bio, setBio] = useState(initialData?.bio || "");
  const [photoUrl, setPhotoUrl] = useState(initialData?.photo || "");

  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoProgress, setPhotoProgress] = useState(0);
  const [error, setError] = useState("");

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    setPhotoProgress(0);
    setError("");
    try {
      const path = await uploadPhotoFile(file, setPhotoProgress);
      setPhotoUrl(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Photo upload failed.");
    } finally {
      setPhotoUploading(false);
      setPhotoProgress(0);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (photoUploading) return;
    setSaving(true);
    setError("");

    const payload = {
      name,
      email: email || undefined,
      phone: phone || undefined,
      photo: photoUrl || undefined,
      bio: bio || undefined,
    };

    const res = isEditing
      ? await updateAgent(initialData!.id, payload)
      : await createAgent(payload);

    setSaving(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    router.push("/admin/agents");
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "640px" }}>
      <div>
        <Link
          href="/admin/agents"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--text-secondary)", fontSize: "0.88rem", textDecoration: "none", marginBottom: "0.75rem" }}
        >
          <ArrowLeft size={14} /> Back to Agents
        </Link>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
          {isEditing ? "Edit Agent" : "Add Agent"}
        </h1>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", color: "#dc2626", padding: "0.9rem 1rem", borderRadius: "var(--radius-md)", fontSize: "0.9rem" }}>
          {error}
        </div>
      )}

      <div className="card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Photo */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ width: "88px", height: "88px", borderRadius: "50%", border: "2px solid var(--color-stone-200)", overflow: "hidden", background: "#f5f5f4", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={name || "Agent photo"}
                width={88}
                height={88}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
                unoptimized={!photoUrl.startsWith("/")}
              />
            ) : (
              <User size={36} style={{ color: "var(--color-stone-300)" }} />
            )}
          </div>

          <label
            htmlFor="agent-photo-upload"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 1.1rem",
              borderRadius: "var(--radius-full)",
              border: "2px solid var(--color-stone-300)",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: photoUploading ? "not-allowed" : "pointer",
              opacity: photoUploading ? 0.7 : 1,
            }}
          >
            <Upload size={14} />
            {photoUploading ? `Uploading… ${photoProgress}%` : "Upload Photo"}
            <input
              id="agent-photo-upload"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />
          </label>
        </div>

        <div>
          <label className="input-label" htmlFor="agent-name">Full Name</label>
          <input
            id="agent-name"
            type="text"
            required
            className="input-field"
            placeholder="e.g. Amara Osei"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label className="input-label" htmlFor="agent-email">Email</label>
            <input
              id="agent-email"
              type="email"
              className="input-field"
              placeholder="agent@realtyflux.co.ke"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="input-label" htmlFor="agent-phone">Phone</label>
            <input
              id="agent-phone"
              type="tel"
              className="input-field"
              placeholder="+254 7XX XXX XXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="input-label" htmlFor="agent-bio">Bio</label>
          <textarea
            id="agent-bio"
            className="input-field"
            rows={4}
            placeholder="Short bio shown to clients (optional)"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            style={{ resize: "vertical" }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving || photoUploading}
        className="btn-primary"
        style={{ padding: "0.75rem 1.75rem", fontSize: "0.92rem", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", alignSelf: "flex-start" }}
      >
        {saving ? <LoaderCircle size={16} className="settings-spin" /> : <Save size={16} />}
        {saving ? "Saving…" : isEditing ? "Save Changes" : "Add Agent"}
      </button>

      <style jsx global>{`
        .settings-spin {
          animation: settings-spin-anim 0.8s linear infinite;
        }
        @keyframes settings-spin-anim {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
}
