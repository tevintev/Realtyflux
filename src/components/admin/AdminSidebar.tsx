"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import {
  LayoutDashboard,
  Building,
  Calendar,
  Mail,
  LogOut,
  User,
  ChevronLeft,
  Menu,
  Settings,
} from "lucide-react";
import { useState } from "react";

interface AdminSidebarProps {
  adminName: string;
  logo?: string | null;
  companyName?: string;
}

export default function AdminSidebar({
  adminName,
  logo = "/logo.png",
  companyName = "Realty Flux",
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Properties", href: "/admin/properties", icon: Building },
    { label: "Bookings", href: "/admin/bookings", icon: Calendar },
    { label: "Messages", href: "/admin/messages", icon: Mail },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Header Bar */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "60px",
          background: "#1c1917",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.25rem",
          zIndex: 100,
        }}
        className="mobile-header"
      >
        <Link
          href="/admin"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}
        >
          <img
            src={logo || "/logo.png"}
            alt={`${companyName} Logo`}
            style={{ width: "28px", height: "28px", objectFit: "contain" }}
          />
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "#fff",
            }}
          >
            {(() => {
              const parts = (companyName || "Realty Flux").split(" ");
              return parts[0] || "Realty";
            })()}
            <span style={{ color: "#16a34a" }}>
              {" "}
              {(() => {
                const parts = (companyName || "Realty Flux").split(" ");
                return parts.slice(1).join(" ") || "Flux";
              })()}
            </span>
          </span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            padding: "8px",
          }}
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Sidebar Container */}
      <aside
        style={{
          width: "260px",
          background: "#1c1917",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 1050,
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        className={`sidebar ${isOpen ? "open" : ""}`}
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: "1.5rem 1.75rem",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              textDecoration: "none",
            }}
          >
            <img
              src={logo || "/logo.png"}
              alt={`${companyName} Logo`}
              style={{ width: "32px", height: "32px", objectFit: "contain" }}
            />
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.03em",
              }}
            >
              {(() => {
                const parts = (companyName || "Realty Flux").split(" ");
                return parts[0] || "Realty";
              })()}
              <span style={{ color: "#16a34a" }}>
                {" "}
                {(() => {
                  const parts = (companyName || "Realty Flux").split(" ");
                  return parts.slice(1).join(" ") || "Flux";
                })()}
              </span>
            </span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="mobile-close-btn"
            style={{
              background: "none",
              border: "none",
              color: "#a8a29e",
              cursor: "pointer",
              padding: "4px",
              display: "none",
            }}
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Sidebar Menu Items */}
        <nav style={{ flex: 1, padding: "1.5rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.85rem",
                  padding: "0.8rem 1rem",
                  borderRadius: "10px",
                  color: isActive ? "#ffffff" : "#a8a29e",
                  background: isActive ? "#16a34a" : "transparent",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
                className={`menu-item ${isActive ? "active" : ""}`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User & Logout */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(0,0,0,0.15)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#16a34a",
              }}
            >
              <User size={18} />
            </div>
            <div style={{ overflow: "hidden" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: "#ffffff",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {adminName}
              </p>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#a8a29e" }}>Administrator</p>
            </div>
          </div>

          <form action={logout}>
            <button
              type="submit"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.65rem",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "8px",
                color: "#ef4444",
                fontFamily: "'Outfit', sans-serif",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#ef4444";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                e.currentTarget.style.color = "#ef4444";
              }}
            >
              <LogOut size={14} />
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 1040,
          }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar Responsive styles */}
      <style jsx global>{`
        .mobile-header {
          display: none !important;
        }
        @media (max-width: 991px) {
          .mobile-header {
            display: flex !important;
          }
          .sidebar {
            transform: translateX(-100%);
            top: 60px !important;
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .mobile-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
