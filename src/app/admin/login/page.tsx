"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { login } from "@/app/actions/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const res = await login(null, formData);
      if (res && res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      if (!res || !res.token) {
        setError("Login succeeded but no session token was returned.");
        setLoading(false);
        return;
      }

      // The Server Action only verifies credentials and returns a signed
      // token — it deliberately does not set the cookie itself (see the note
      // in src/app/actions/auth.ts). A plain Route Handler establishes the
      // session instead, since that request/response path doesn't go through
      // the Server Action machinery that was hanging here.
      const sessionRes = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: res.token }),
      });
      if (!sessionRes.ok) {
        setError("Could not establish a session. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch (err) {
      console.error("Login request failed:", err);
      setError(
        err instanceof Error ? `Request failed: ${err.message}` : "Request failed unexpectedly."
      );
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        background: "linear-gradient(135deg, #0f0e0d 0%, #1c1917 100%)",
        overflow: "hidden",
        padding: "1.5rem",
      }}
    >
      {/* Decorative glowing background elements */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "15%",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(22,163,74,0.15) 0%, rgba(22,163,74,0) 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
          animation: "float 8s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "15%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0) 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
          animation: "float 12s ease-in-out infinite alternate",
        }}
      />

      {/* Glass card container */}
      <div
        className="glass-dark animate-scale-in"
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "3rem 2.5rem",
          borderRadius: "1.25rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), var(--shadow-glow)",
          zIndex: 10,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              textDecoration: "none",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src="/logo.png"
                alt="Realty Flux Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.03em",
              }}
            >
              Realty
              <span style={{ color: "#16a34a" }}>Flux</span>
            </span>
          </Link>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: "0.5rem",
            }}
          >
            Admin Portal
          </h1>
          <p style={{ color: "#a8a29e", fontSize: "0.88rem" }}>
            Sign in to manage listings, bookings, and messages
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#fca5a5",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              fontSize: "0.85rem",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label
              className="input-label"
              htmlFor="username"
              style={{ color: "#e7e5e4" }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              disabled={loading}
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                padding: "0.875rem 1.25rem",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "var(--radius-md)",
                color: "#ffffff",
                outline: "none",
                fontSize: "0.95rem",
                transition: "all 0.25s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#16a34a";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(22, 163, 74, 0.15)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
              }}
            />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <label
                className="input-label"
                htmlFor="password"
                style={{ color: "#e7e5e4", marginBottom: 0 }}
              >
                Password
              </label>
              <Link
                href="/admin/forgot-password"
                style={{ color: "#16a34a", fontSize: "0.8rem", textDecoration: "none" }}
              >
                Forgot password?
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                disabled={loading}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.875rem 3rem 0.875rem 1.25rem",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "var(--radius-md)",
                  color: "#ffffff",
                  outline: "none",
                  fontSize: "0.95rem",
                  transition: "all 0.25s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#16a34a";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(22, 163, 74, 0.15)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "0.9rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  color: "#a8a29e",
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: "100%",
              padding: "0.9rem",
              borderRadius: "var(--radius-md)",
              background: "#16a34a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <span
                style={{
                  display: "inline-block",
                  width: "20px",
                  height: "20px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "shimmer 1s linear infinite", // wait, spinner animation
                }}
                className="animate-spin"
              />
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite !important;
        }
      `}</style>
    </div>
  );
}
