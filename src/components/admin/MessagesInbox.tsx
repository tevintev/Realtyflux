"use client";

import { useState } from "react";
import { toggleMessageReadStatus, deleteMessage } from "@/app/actions/messages";
import { Mail, MailOpen, Phone, Trash2, Search, Calendar, ChevronRight, Reply } from "lucide-react";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  propertyId: string | null;
  isRead: boolean;
  createdAt: Date;
}

interface MessagesInboxProps {
  initialMessages: Message[];
}

export default function MessagesInbox({ initialMessages }: MessagesInboxProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialMessages.length > 0 ? initialMessages[0].id : null
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, read, unread
  const [actionLoading, setActionLoading] = useState(false);

  const selectedMessage = messages.find((m) => m.id === selectedId);

  const handleSelectMessage = async (msg: Message) => {
    setSelectedId(msg.id);
    if (!msg.isRead) {
      // Optimistic update
      setMessages(
        messages.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
      );
      // Backend update
      await toggleMessageReadStatus(msg.id, true);
    }
  };

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    setActionLoading(true);
    const res = await toggleMessageReadStatus(id, !currentRead);
    if (res.success) {
      setMessages(
        messages.map((m) => (m.id === id ? { ...m, isRead: !currentRead } : m))
      );
    } else {
      alert(res.error || "Failed to update status");
    }
    setActionLoading(false);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this message?");
    if (!confirmed) return;

    setActionLoading(true);
    const res = await deleteMessage(id);
    if (res.success) {
      const remaining = messages.filter((m) => m.id !== id);
      setMessages(remaining);
      setSelectedId(remaining.length > 0 ? remaining[0].id : null);
    } else {
      alert(res.error || "Failed to delete message");
    }
    setActionLoading(false);
  };

  // Filter & Search
  const filteredMessages = messages.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase()) ||
      m.message.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "unread" && !m.isRead) ||
      (filter === "read" && m.isRead);

    return matchesSearch && matchesFilter;
  });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "1.5rem",
        height: "calc(100vh - 180px)",
        minHeight: "500px",
      }}
      className="inbox-layout"
    >
      {/* Messages List Sidebar */}
      <div
        className="card"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* Search & Filters */}
        <div
          style={{
            padding: "1rem",
            borderBottom: "1px solid var(--color-stone-200)",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              placeholder="Search inbox..."
              className="input-field"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "32px", paddingTop: "0.5rem", paddingBottom: "0.5rem" }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            {["all", "unread", "read"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  flex: 1,
                  padding: "0.4rem",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  textTransform: "capitalize",
                  borderRadius: "6px",
                  border: `1px solid ${filter === f ? "#16a34a" : "var(--color-stone-200)"}`,
                  background: filter === f ? "rgba(22,163,74,0.06)" : "transparent",
                  color: filter === f ? "#16a34a" : "var(--text-secondary)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable list */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {filteredMessages.length === 0 ? (
            <div
              style={{
                padding: "3rem 1.5rem",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: "0.9rem",
              }}
            >
              No messages found.
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isSelected = msg.id === selectedId;
              return (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  style={{
                    padding: "1rem 1.25rem",
                    borderBottom: "1px solid var(--color-stone-100)",
                    cursor: "pointer",
                    background: isSelected
                      ? "rgba(22,163,74,0.04)"
                      : msg.isRead
                      ? "transparent"
                      : "rgba(22,163,74,0.02)",
                    borderLeft: `3px solid ${
                      isSelected ? "#16a34a" : msg.isRead ? "transparent" : "#16a34a"
                    }`,
                    transition: "all 0.15s ease",
                  }}
                  className="msg-item"
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: msg.isRead ? 600 : 700,
                        fontSize: "0.9rem",
                        color: msg.isRead ? "var(--text-primary)" : "#1c1917",
                      }}
                    >
                      {msg.name}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {new Date(msg.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: msg.isRead ? 500 : 700,
                      fontSize: "0.82rem",
                      color: msg.isRead ? "var(--text-secondary)" : "#16a34a",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {msg.subject}
                  </p>
                  <p
                    style={{
                      margin: "0.2rem 0 0",
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {msg.message}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Message Reader Pane */}
      <div
        className="card reader-pane"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          background: "var(--bg-secondary)",
        }}
      >
        {selectedMessage ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            {/* Reader Toolbar */}
            <div
              style={{
                padding: "1rem 1.5rem",
                borderBottom: "1px solid var(--color-stone-200)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => handleToggleRead(selectedMessage.id, selectedMessage.isRead)}
                  disabled={actionLoading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.45rem 0.75rem",
                    borderRadius: "6px",
                    border: "1px solid var(--color-stone-200)",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {selectedMessage.isRead ? (
                    <>
                      <Mail size={14} /> Mark Unread
                    </>
                  ) : (
                    <>
                      <MailOpen size={14} /> Mark Read
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  disabled={actionLoading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.45rem 0.75rem",
                    borderRadius: "6px",
                    border: "1px solid rgba(239, 68, 68, 0.15)",
                    background: "rgba(239, 68, 68, 0.05)",
                    color: "#ef4444",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>

              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                className="btn-primary"
                style={{
                  padding: "0.45rem 0.95rem",
                  borderRadius: "6px",
                  fontSize: "0.8rem",
                }}
              >
                <Reply size={14} /> Reply Sender
              </a>
            </div>

            {/* Reader Header */}
            <div
              style={{
                padding: "1.5rem 1.75rem",
                borderBottom: "1px solid var(--color-stone-100)",
              }}
            >
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  margin: "0 0 1rem",
                }}
              >
                {selectedMessage.subject}
              </h2>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem" }}>
                    {selectedMessage.name}
                  </p>
                  <p style={{ margin: "0.15rem 0 0", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                    From: <span style={{ color: "#16a34a" }}>{selectedMessage.email}</span>
                  </p>
                  {selectedMessage.phone && (
                    <p style={{ margin: "0.15rem 0 0", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                      Phone: <span>{selectedMessage.phone}</span>
                    </p>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <Calendar size={13} />
                  {new Date(selectedMessage.createdAt).toLocaleString([], {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </div>
            </div>

            {/* Reader Content Body */}
            <div
              style={{
                flex: 1,
                padding: "1.75rem",
                overflowY: "auto",
                whiteSpace: "pre-wrap",
                fontSize: "0.95rem",
                lineHeight: 1.6,
                color: "var(--text-primary)",
              }}
            >
              {selectedMessage.message}
            </div>
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
              padding: "2rem",
            }}
          >
            <Mail size={36} style={{ marginBottom: "1rem", opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: "0.95rem" }}>Select an inquiry to read details</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .inbox-layout {
          grid-template-columns: 1fr !important;
        }
        .reader-pane {
          display: none !important;
        }
        @media (min-width: 768px) {
          .inbox-layout {
            grid-template-columns: 280px 1fr !important;
          }
          .reader-pane {
            display: flex !important;
          }
        }
        @media (min-width: 1024px) {
          .inbox-layout {
            grid-template-columns: 340px 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
