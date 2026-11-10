"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { resetPasswordWithRecoveryCode } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("recoveryCode", recoveryCode);
    formData.append("newPassword", newPassword);
    formData.append("confirmPassword", confirmPassword);

    const res = await resetPasswordWithRecoveryCode(null, formData);
    setLoading(false);
    if (res && res.error) {
      setError(res.error);
      return;
    }
    setSuccess(true);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.875rem 1.25rem",
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "var(--radius-md)",
    color: "#ffffff",
    outline: "none",
    fontSize: "0.95rem",
    transition: "all 0.25s ease",
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#16a34a";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(22, 163, 74, 0.15)";
    e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
    e.currentTarget.style.boxShadow = "none";
    e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
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
        }}
      />

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
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.5rem" }}>
            Reset Admin Password
          </h1>
          <p style={{ color: "#a8a29e", fontSize: "0.88rem" }}>
            Enter the server recovery code to set a new password.
          </p>
        </div>

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

        {success ? (
          <div>
            <div
              style={{
                background: "rgba(22, 163, 74, 0.1)",
                border: "1px solid rgba(22, 163, 74, 0.25)",
                color: "#86efac",
                padding: "0.9rem 1rem",
                borderRadius: "var(--radius-md)",
                fontSize: "0.85rem",
                marginBottom: "1.5rem",
                textAlign: "center",
              }}
            >
              Password updated. You can now sign in with your new password.
            </div>
            <button
              type="button"
              onClick={() => router.push("/admin/login")}
              className="btn-primary"
              style={{
                width: "100%",
                padding: "0.9rem",
                borderRadius: "var(--radius-md)",
                background: "#16a34a",
                border: "none",
                color: "#fff",
                fontSize: "0.95rem",
                cursor: "pointer",
              }}
            >
              Go to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1.25rem" }}>
              <label className="input-label" htmlFor="username" style={{ color: "#e7e5e4" }}>
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                disabled={loading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label className="input-label" htmlFor="recoveryCode" style={{ color: "#e7e5e4" }}>
                Recovery Code
              </label>
              <input
                id="recoveryCode"
                type="text"
                required
                disabled={loading}
                placeholder="From ADMIN_RECOVERY_CODE in .env on the server"
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value)}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label className="input-label" htmlFor="newPassword" style={{ color: "#e7e5e4" }}>
                New Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ ...inputStyle, padding: "0.875rem 3rem 0.875rem 1.25rem" }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
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

            <div style={{ marginBottom: "2rem" }}>
              <label className="input-label" htmlFor="confirmPassword" style={{ color: "#e7e5e4" }}>
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                disabled={loading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
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
                border: "none",
                color: "#fff",
                fontSize: "0.95rem",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link href="/admin/login" style={{ color: "#a8a29e", fontSize: "0.85rem", textDecoration: "none" }}>
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
