"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { createProperty, updateProperty } from "@/app/actions/properties";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Building,
  Image as ImageIcon,
  LoaderCircle,
  MapPin,
  Sparkles,
  Upload,
  Video,
  X,
} from "lucide-react";

/**
 * Check whether a URL is compatible with next/image.
 * next/image only accepts relative paths starting with "/" or absolute http(s) URLs.
 */
function isValidImageSrc(src: string): boolean {
  if (!src) return false;
  if (src.startsWith("/")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Renders a next/image `<Image>` when `src` is a valid web URL,
 * otherwise falls back to a native `<img>` tag so that admin previews
 * don't crash when the database contains local filesystem paths.
 */
function SafeImage({ src, alt, fill, sizes, style }: {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
}) {
  if (isValidImageSrc(src)) {
    return <Image src={src} alt={alt} fill={fill} sizes={sizes} style={style} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{
        ...style,
        ...(fill ? { position: "absolute", inset: 0, width: "100%", height: "100%" } : {}),
      }}
    />
  );
}

interface PropertyImage {
  id?: string;
  imageUrl: string;
  caption?: string | null;
  sortOrder?: number;
}

interface PropertyFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: number;
    currency: string;
    propertyType: string;
    listingType: string;
    status: string;
    bedrooms: number;
    bathrooms: number;
    size: number;
    sizeUnit: string;
    location: string;
    address: string;
    featuredImage: string | null;
    amenities: string[];
    yearBuilt: number | null;
    isFeatured: boolean;
    agentId: string | null;
    images?: PropertyImage[];
  };
  agents?: { id: string; name: string }[];
}

interface UploadState {
  uploading: boolean;
  progress: number;
}

interface UploadResponseFile {
  path: string;
}

const AMENITY_OPTIONS = [
  "Swimming Pool",
  "Garden",
  "Garage",
  "Security System",
  "Fireplace",
  "Staff Quarters",
  "Solar Panels",
  "Borehole",
  "Gym",
  "Rooftop Terrace",
  "Concierge",
  "Smart Home System",
  "Elevator",
  "Play Area",
  "CCTV",
  "Backup Generator",
];

const PROPERTY_TYPES = ["house", "apartment", "land", "commercial", "villa", "townhouse"];
const LISTING_TYPES = ["sale", "rent"];
const STATUS_OPTIONS = ["on-sale", "sold", "rented", "pending"];

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function extractUploadedPaths(payload: unknown) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "files" in payload &&
    Array.isArray(payload.files)
  ) {
    return payload.files
      .map((file) => {
        if (typeof file === "object" && file !== null && "path" in file) {
          return (file as UploadResponseFile).path;
        }

        return null;
      })
      .filter((path): path is string => Boolean(path));
  }

  return [];
}

function uploadFiles(files: File[], onProgress: (progress: number) => void) {
  return new Promise<string[]>((resolve, reject) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const request = new XMLHttpRequest();
    request.open("POST", "/api/upload");
    request.responseType = "json";

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    request.onload = () => {
      const response =
        typeof request.response === "string" ? JSON.parse(request.response) : request.response;

      if (request.status >= 200 && request.status < 300) {
        const uploadedPaths = extractUploadedPaths(response);

        if (uploadedPaths.length > 0) {
          onProgress(100);
          resolve(uploadedPaths);
          return;
        }

        reject(new Error("Upload completed but no file paths were returned."));
        return;
      }

      const message =
        typeof response === "object" &&
        response !== null &&
        "error" in response &&
        typeof response.error === "string"
          ? response.error
          : "Upload failed.";

      reject(new Error(message));
    };

    request.onerror = () => reject(new Error("Upload failed."));
    request.send(formData);
  });
}

function MediaUploadCard({
  title,
  description,
  onClick,
  onDrop,
  onDragOver,
  onDragLeave,
  isActive,
  disabled,
}: {
  title: string;
  description: string;
  onClick: () => void;
  onDrop: (event: DragEvent<HTMLButtonElement>) => void;
  onDragOver: (event: DragEvent<HTMLButtonElement>) => void;
  onDragLeave: () => void;
  isActive: boolean;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      disabled={disabled}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.65rem",
        width: "100%",
        minHeight: "164px",
        padding: "1.4rem",
        borderRadius: "18px",
        border: `2px dashed ${isActive ? "#16a34a" : "rgba(22, 163, 74, 0.22)"}`,
        background: isActive ? "rgba(22, 163, 74, 0.08)" : "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)",
        color: "var(--text-primary)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.7 : 1,
        transition: "all 0.2s ease",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: "rgba(22, 163, 74, 0.12)",
          color: "#16a34a",
        }}
      >
        <Upload size={22} />
      </span>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 700, fontSize: "0.96rem" }}>{title}</div>
        <div style={{ color: "var(--text-secondary)", fontSize: "0.86rem", marginTop: "0.25rem" }}>
          {description}
        </div>
      </div>
    </button>
  );
}

export default function PropertyForm({ initialData, agents = [] }: PropertyFormProps) {
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [dragTarget, setDragTarget] = useState<"cover" | "gallery" | "video" | null>(null);
  const [coverUpload, setCoverUpload] = useState<UploadState>({ uploading: false, progress: 0 });
  const [galleryUpload, setGalleryUpload] = useState<UploadState>({ uploading: false, progress: 0 });
  const [videoUpload, setVideoUpload] = useState<UploadState>({ uploading: false, progress: 0 });

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
  const [price, setPrice] = useState(initialData?.price ? Number(initialData.price) : 0);
  const [currency, setCurrency] = useState(initialData?.currency || "KES");
  const [propertyType, setPropertyType] = useState(initialData?.propertyType || "house");
  const [listingType, setListingType] = useState(initialData?.listingType || "sale");
  const [status, setStatus] = useState(initialData?.status || "on-sale");
  const [bedrooms, setBedrooms] = useState(initialData?.bedrooms || 0);
  const [bathrooms, setBathrooms] = useState(initialData?.bathrooms || 0);
  const [size, setSize] = useState(initialData?.size ? Number(initialData.size) : 0);
  const [sizeUnit, setSizeUnit] = useState(initialData?.sizeUnit || "sq ft");
  const [location, setLocation] = useState(initialData?.location || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || "");
  const [yearBuilt, setYearBuilt] = useState<number | "">(initialData?.yearBuilt ?? "");
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [agentId, setAgentId] = useState(initialData?.agentId || "");
  const [galleryImages, setGalleryImages] = useState<string[]>(
    initialData?.images?.map((img) => img.imageUrl) || []
  );
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialData?.amenities || []);

  const isUploading = coverUpload.uploading || galleryUpload.uploading || videoUpload.uploading;

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities((current) =>
      current.includes(amenity)
        ? current.filter((item) => item !== amenity)
        : [...current, amenity]
    );
  };

  const resetInputValue = (input: HTMLInputElement | null) => {
    if (input) {
      input.value = "";
    }
  };

  const runUpload = async (
    files: File[],
    kind: "cover" | "gallery" | "video",
    onComplete: (uploadedPaths: string[]) => void
  ) => {
    if (files.length === 0) {
      return;
    }

    setUploadError("");

    const setUploadState =
      kind === "cover" ? setCoverUpload
      : kind === "video" ? setVideoUpload
      : setGalleryUpload;
    setUploadState({ uploading: true, progress: 0 });

    try {
      const uploadedPaths = await uploadFiles(files, (progress) => {
        setUploadState({ uploading: true, progress });
      });

      onComplete(uploadedPaths);
    } catch (uploadFailure) {
      setUploadError(uploadFailure instanceof Error ? uploadFailure.message : "Upload failed.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setUploadState({ uploading: false, progress: 0 });
      setDragTarget(null);
      if (kind === "cover") resetInputValue(coverInputRef.current);
      else if (kind === "video") resetInputValue(videoInputRef.current);
      else resetInputValue(galleryInputRef.current);
    }
  };

  const handleCoverSelection = async (files: FileList | File[]) => {
    const selectedFiles = Array.from(files).slice(0, 1);
    await runUpload(selectedFiles, "cover", ([uploadedPath]) => {
      if (uploadedPath) {
        setFeaturedImage(uploadedPath);
      }
    });
  };

  const handleGallerySelection = async (files: FileList | File[]) => {
    const selectedFiles = Array.from(files);
    await runUpload(selectedFiles, "gallery", (uploadedPaths) => {
      setGalleryImages((current) => [...current, ...uploadedPaths]);
    });
  };

  const handleVideoSelection = async (files: FileList | File[]) => {
    const selectedFiles = Array.from(files);
    await runUpload(selectedFiles, "video", (uploadedPaths) => {
      setGalleryImages((current) => [...current, ...uploadedPaths]);
    });
  };

  const moveGalleryImage = (index: number, direction: "up" | "down") => {
    setGalleryImages((current) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const updated = [...current];
      [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
      return updated;
    });
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (isUploading) {
      setError("Please wait for the current upload to finish before saving.");
      return;
    }

    setLoading(true);

    const payload = {
      title,
      slug,
      description,
      shortDescription,
      price: Number(price),
      currency,
      propertyType,
      listingType,
      status,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      size: Number(size),
      sizeUnit,
      location,
      address,
      featuredImage: featuredImage || undefined,
      amenities: selectedAmenities,
      yearBuilt: yearBuilt === "" ? null : Number(yearBuilt),
      isFeatured,
      agentId: agentId || undefined,
      gallery: galleryImages,
    };

    const response = initialData?.id
      ? await updateProperty(initialData.id, payload)
      : await createProperty(payload);

    if (response?.error) {
      setError(response.error);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    router.push("/admin/properties");
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <input
        ref={coverInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        onChange={(event) => {
          if (event.target.files) {
            void handleCoverSelection(event.target.files);
          }
        }}
        style={{ display: "none" }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        multiple
        onChange={(event) => {
          if (event.target.files) {
            void handleGallerySelection(event.target.files);
          }
        }}
        style={{ display: "none" }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/x-msvideo"
        multiple
        onChange={(event) => {
          if (event.target.files) {
            void handleVideoSelection(event.target.files);
          }
        }}
        style={{ display: "none" }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link
            href="/admin/properties"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "var(--bg-secondary)",
              border: "1px solid var(--color-stone-200)",
              color: "var(--text-primary)",
            }}
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              {initialData ? "Edit Property" : "Add Property"}
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: "0.1rem 0 0" }}>
              {initialData ? `Editing listing ID: ${initialData.id}` : "Create a new property listing."}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginLeft: "auto" }}>
          <Link href="/admin/properties" className="btn-secondary" style={{ padding: "0.6rem 1.5rem", fontSize: "0.88rem" }}>
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || isUploading}
            className="btn-primary"
            style={{ padding: "0.6rem 1.5rem", fontSize: "0.88rem", border: "none" }}
          >
            {loading ? "Saving..." : isUploading ? "Uploading..." : "Save Listing"}
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.15)",
            color: "#dc2626",
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.9rem",
          }}
        >
          {error}
        </div>
      )}

      {uploadError && (
        <div
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            color: "#b45309",
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.9rem",
          }}
        >
          {uploadError}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "2rem",
        }}
        className="form-grid"
      >
        <div className="card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--color-stone-200)" }}>
            <Building size={18} style={{ color: "#16a34a" }} />
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Basic Information</h2>
          </div>

          <div>
            <label className="input-label" htmlFor="title">Property Title</label>
            <input
              id="title"
              type="text"
              required
              className="input-field"
              placeholder="e.g. Serene Garden Villa"
              value={title}
              onChange={(event) => {
                const nextTitle = event.target.value;
                setTitle(nextTitle);

                if (!initialData) {
                  setSlug(generateSlug(nextTitle));
                }
              }}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="slug">Slug (URL Route)</label>
            <input
              id="slug"
              type="text"
              required
              className="input-field"
              placeholder="e.g. serene-garden-villa"
              value={slug}
              onChange={(event) => setSlug(event.target.value.toLowerCase().replace(/\s+/g, "-"))}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="input-label" htmlFor="price">Price</label>
              <input
                id="price"
                type="number"
                required
                min={0}
                className="input-field"
                placeholder="45000000"
                value={price}
                onChange={(event) => setPrice(Number(event.target.value))}
              />
            </div>
            <div>
              <label className="input-label" htmlFor="currency">Currency</label>
              <input
                id="currency"
                type="text"
                required
                className="input-field"
                placeholder="KES"
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }} className="triple-select">
            <div>
              <label className="input-label" htmlFor="propertyType">Type</label>
              <select
                id="propertyType"
                className="input-field"
                value={propertyType}
                onChange={(event) => setPropertyType(event.target.value)}
                style={{ appearance: "auto" }}
              >
                {PROPERTY_TYPES.map((item) => (
                  <option key={item} value={item} style={{ textTransform: "capitalize" }}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label" htmlFor="listingType">Purpose</label>
              <select
                id="listingType"
                className="input-field"
                value={listingType}
                onChange={(event) => setListingType(event.target.value)}
                style={{ appearance: "auto" }}
              >
                {LISTING_TYPES.map((item) => (
                  <option key={item} value={item} style={{ textTransform: "capitalize" }}>
                    For {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label" htmlFor="status">Status</label>
              <select
                id="status"
                className="input-field"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                style={{ appearance: "auto" }}
              >
                {STATUS_OPTIONS.map((item) => (
                  <option key={item} value={item} style={{ textTransform: "capitalize" }}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="input-label" htmlFor="shortDescription">Short Summary (Featured snippets)</label>
            <textarea
              id="shortDescription"
              required
              rows={2}
              className="input-field"
              placeholder="e.g. Stunning 4-bed villa in Karen with pool, garden, and panoramic views."
              value={shortDescription}
              onChange={(event) => setShortDescription(event.target.value)}
              style={{ resize: "vertical" }}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="description">Full Description</label>
            <textarea
              id="description"
              required
              rows={5}
              className="input-field"
              placeholder="Enter detailed description about the property, rooms, security, layout..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              style={{ resize: "vertical" }}
            />
          </div>
        </div>

        <div className="card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--color-stone-200)" }}>
            <MapPin size={18} style={{ color: "#16a34a" }} />
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Specifications & Location</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }} className="triple-select">
            <div>
              <label className="input-label" htmlFor="bedrooms">Bedrooms</label>
              <input
                id="bedrooms"
                type="number"
                min={0}
                className="input-field"
                value={bedrooms}
                onChange={(event) => setBedrooms(Number(event.target.value))}
              />
            </div>
            <div>
              <label className="input-label" htmlFor="bathrooms">Bathrooms</label>
              <input
                id="bathrooms"
                type="number"
                min={0}
                className="input-field"
                value={bathrooms}
                onChange={(event) => setBathrooms(Number(event.target.value))}
              />
            </div>
            <div>
              <label className="input-label" htmlFor="yearBuilt">Year Built</label>
              <input
                id="yearBuilt"
                type="number"
                placeholder="2021"
                className="input-field"
                value={yearBuilt}
                onChange={(event) => setYearBuilt(event.target.value === "" ? "" : Number(event.target.value))}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
            <div>
              <label className="input-label" htmlFor="size">Size</label>
              <input
                id="size"
                type="number"
                min={1}
                required
                className="input-field"
                placeholder="4500"
                value={size}
                onChange={(event) => setSize(Number(event.target.value))}
              />
            </div>
            <div>
              <label className="input-label" htmlFor="sizeUnit">Unit</label>
              <input
                id="sizeUnit"
                type="text"
                required
                className="input-field"
                placeholder="sq ft"
                value={sizeUnit}
                onChange={(event) => setSizeUnit(event.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="input-label" htmlFor="location">City/Sub-County Location</label>
            <input
              id="location"
              type="text"
              required
              className="input-field"
              placeholder="e.g. Karen, Nairobi"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="address">Physical Address</label>
            <input
              id="address"
              type="text"
              required
              className="input-field"
              placeholder="e.g. 12 Karen Road, Karen"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }}>
            <div>
              <label className="input-label" htmlFor="agent">Assign Agent</label>
              <select
                id="agent"
                className="input-field"
                style={{ appearance: "auto" }}
                value={agentId}
                onChange={(event) => setAgentId(event.target.value)}
              >
                <option value="">No agent assigned</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              {agents.length === 0 && (
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.4rem" }}>
                  No agents yet —{" "}
                  <Link href="/admin/agents/new" style={{ color: "#16a34a" }}>
                    add one
                  </Link>{" "}
                  to assign them to listings.
                </p>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
              <input
                id="isFeatured"
                type="checkbox"
                checked={isFeatured}
                onChange={(event) => setIsFeatured(event.target.checked)}
                style={{ width: "18px", height: "18px", accentColor: "#16a34a" }}
              />
              <label
                className="input-label"
                htmlFor="isFeatured"
                style={{ margin: 0, cursor: "pointer", fontWeight: 600 }}
              >
                Mark as &quot;Featured Listing&quot; (Promotes to Homepage)
              </label>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--color-stone-200)" }}>
            <ImageIcon size={18} style={{ color: "#f59e0b" }} />
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Media & Gallery</h2>
          </div>

          <div style={{ display: "grid", gap: "1rem" }}>
            <div>
              <label className="input-label">Cover Image</label>
              {featuredImage ? (
                <div
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: "18px",
                    border: "1px solid var(--color-stone-200)",
                    background: "#f8fafc",
                  }}
                >
                  <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" }}>
                    <SafeImage
                      src={featuredImage}
                      alt="Cover preview"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "0.9rem 1rem",
                      flexWrap: "wrap",
                      background: "rgba(255, 255, 255, 0.92)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>Cover image ready</div>
                      <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "0.15rem" }}>
                        {featuredImage}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
                      <button type="button" className="btn-secondary" style={{ padding: "0.6rem 1rem" }} onClick={() => coverInputRef.current?.click()}>
                        Replace
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: "0.6rem 1rem", color: "#dc2626", borderColor: "rgba(239, 68, 68, 0.3)" }}
                        onClick={() => setFeaturedImage("")}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <MediaUploadCard
                  title="Upload cover image"
                  description="Click to browse or drag an image here."
                  onClick={() => coverInputRef.current?.click()}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragTarget(null);
                    if (event.dataTransfer.files.length > 0) {
                      void handleCoverSelection(event.dataTransfer.files);
                    }
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragTarget("cover");
                  }}
                  onDragLeave={() => setDragTarget((current) => (current === "cover" ? null : current))}
                  isActive={dragTarget === "cover"}
                  disabled={coverUpload.uploading}
                />
              )}

              {coverUpload.uploading && (
                <div style={{ marginTop: "0.85rem", display: "grid", gap: "0.45rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                    <LoaderCircle size={16} className="spin-loader" />
                    Uploading cover image...
                  </div>
                  <div style={{ height: "8px", borderRadius: "999px", background: "var(--color-stone-200)", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${coverUpload.progress}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #16a34a, #4ade80)",
                        transition: "width 0.2s ease",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="input-label">Gallery Images</label>
              <MediaUploadCard
                title="Add gallery images"
                description="Drop multiple files here or click to select them."
                onClick={() => galleryInputRef.current?.click()}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragTarget(null);
                  if (event.dataTransfer.files.length > 0) {
                    void handleGallerySelection(event.dataTransfer.files);
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragTarget("gallery");
                }}
                onDragLeave={() => setDragTarget((current) => (current === "gallery" ? null : current))}
                isActive={dragTarget === "gallery"}
                disabled={galleryUpload.uploading}
              />

              {galleryUpload.uploading && (
                <div style={{ marginTop: "0.85rem", display: "grid", gap: "0.45rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                    <LoaderCircle size={16} className="spin-loader" />
                    Uploading gallery images...
                  </div>
                  <div style={{ height: "8px", borderRadius: "999px", background: "var(--color-stone-200)", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${galleryUpload.progress}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
                        transition: "width 0.2s ease",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Video Upload Zone */}
              <div style={{ marginTop: "0.5rem" }}>
                <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Video size={15} style={{ color: "#8b5cf6" }} />
                  Upload Videos
                </label>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragTarget(null);
                    if (event.dataTransfer.files.length > 0) {
                      void handleVideoSelection(event.dataTransfer.files);
                    }
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragTarget("video");
                  }}
                  onDragLeave={() => setDragTarget((c) => (c === "video" ? null : c))}
                  disabled={videoUpload.uploading}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.65rem",
                    width: "100%",
                    minHeight: "130px",
                    padding: "1.25rem",
                    borderRadius: "18px",
                    border: `2px dashed ${dragTarget === "video" ? "#8b5cf6" : "rgba(139,92,246,0.25)"}`,
                    background: dragTarget === "video" ? "rgba(139,92,246,0.07)" : "linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)",
                    color: "var(--text-primary)",
                    cursor: videoUpload.uploading ? "not-allowed" : "pointer",
                    opacity: videoUpload.uploading ? 0.7 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "50%", background: "rgba(139,92,246,0.12)", color: "#8b5cf6" }}>
                    <Video size={20} />
                  </span>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.96rem" }}>Upload property videos</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.86rem", marginTop: "0.25rem" }}>MP4, MOV, WebM — up to 200 MB each</div>
                  </div>
                </button>

                {videoUpload.uploading && (
                  <div style={{ marginTop: "0.85rem", display: "grid", gap: "0.45rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                      <LoaderCircle size={16} className="spin-loader" />
                      Uploading video...
                    </div>
                    <div style={{ height: "8px", borderRadius: "999px", background: "var(--color-stone-200)", overflow: "hidden" }}>
                      <div style={{ width: `${videoUpload.progress}%`, height: "100%", background: "linear-gradient(90deg, #8b5cf6, #c084fc)", transition: "width 0.2s ease" }} />
                    </div>
                  </div>
                )}
              </div>

              {galleryImages.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: "1rem",
                    marginTop: "1rem",
                  }}
                >
                  {galleryImages.map((mediaUrl, index) => {
                    const isVideo = /\.(mp4|mov|webm|avi)$/i.test(mediaUrl);
                    return (
                      <div
                        key={`${mediaUrl}-${index}`}
                        style={{
                          border: "1px solid var(--color-stone-200)",
                          borderRadius: "18px",
                          overflow: "hidden",
                          background: "var(--bg-secondary)",
                          boxShadow: "var(--shadow-sm)",
                        }}
                      >
                        <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 3", background: "#f5f5f4" }}>
                          {isVideo ? (
                            <video
                              src={mediaUrl}
                              controls
                              muted
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <SafeImage
                              src={mediaUrl}
                              alt={`Gallery image ${index + 1}`}
                              fill
                              sizes="(max-width: 768px) 50vw, 20vw"
                              style={{ objectFit: "cover" }}
                            />
                          )}
                        </div>
                        <div style={{ padding: "0.85rem", display: "grid", gap: "0.75rem" }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "0.86rem" }}>
                              {isVideo ? `Video ${index + 1}` : `Image ${index + 1}`}
                            </div>
                            <div style={{ color: "var(--text-secondary)", fontSize: "0.76rem", marginTop: "0.15rem", wordBreak: "break-all" }}>
                              {mediaUrl}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ padding: "0.45rem 0.75rem", minWidth: "unset" }}
                              onClick={() => moveGalleryImage(index, "up")}
                              disabled={index === 0}
                            >
                              <ArrowUp size={15} />
                            </button>
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ padding: "0.45rem 0.75rem", minWidth: "unset" }}
                              onClick={() => moveGalleryImage(index, "down")}
                              disabled={index === galleryImages.length - 1}
                            >
                              <ArrowDown size={15} />
                            </button>
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ padding: "0.45rem 0.75rem", minWidth: "unset", color: "#dc2626", borderColor: "rgba(239, 68, 68, 0.3)" }}
                              onClick={() => removeGalleryImage(index)}
                            >
                              <X size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ margin: "0.85rem 0 0", color: "var(--text-secondary)", fontSize: "0.86rem" }}>
                  No gallery images yet. Upload a few to build the property slideshow.
                </p>
              )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "0.75rem", borderBottom: "1px solid var(--color-stone-200)", marginTop: "0.5rem" }}>
            <Sparkles size={18} style={{ color: "#8b5cf6" }} />
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Amenities / Features</h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "0.75rem",
              marginTop: "0.5rem",
            }}
          >
            {AMENITY_OPTIONS.map((amenity) => {
              const isChecked = selectedAmenities.includes(amenity);

              return (
                <div
                  key={amenity}
                  onClick={() => handleAmenityToggle(amenity)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.6rem 0.85rem",
                    borderRadius: "8px",
                    background: isChecked ? "rgba(22,163,74,0.06)" : "var(--bg-primary)",
                    border: `1px solid ${isChecked ? "#16a34a" : "var(--color-stone-200)"}`,
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    color: isChecked ? "#16a34a" : "var(--text-secondary)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    style={{ accentColor: "#16a34a", pointerEvents: "none" }}
                  />
                  {amenity}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .form-grid {
          grid-template-columns: 1fr !important;
        }

        .spin-loader {
          animation: property-form-spin 0.8s linear infinite;
        }

        @keyframes property-form-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (min-width: 992px) {
          .form-grid {
            grid-template-columns: 1.2fr 1fr !important;
          }
        }

        @media (max-width: 480px) {
          .triple-select {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </form>
  );
}
