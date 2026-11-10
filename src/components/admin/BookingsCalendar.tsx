"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Phone } from "lucide-react";

export interface CalendarBooking {
  id: string;
  date: string; // YYYY-MM-DD
  slot: string; // "09:00 AM - 11:00 AM"
  slotOrder: number;
  fullName: string;
  phone: string;
  propertyTitle: string;
  propertySlug: string;
  status: string;
}

interface BookingsCalendarProps {
  bookings: CalendarBooking[];
  /** Today's date as YYYY-MM-DD, from the server so both renders agree. */
  today: string;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#16a34a",
  pending: "#f59e0b",
  rescheduled: "#3b82f6",
  completed: "#78716c",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export default function BookingsCalendar({ bookings, today }: BookingsCalendarProps) {
  const [todayYear, todayMonth] = today.split("-").map(Number);
  const [view, setView] = useState({ year: todayYear, month: todayMonth - 1 });
  const [selected, setSelected] = useState(today);

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>();
    for (const b of bookings) {
      map.set(b.date, [...(map.get(b.date) ?? []), b]);
    }
    for (const list of map.values()) list.sort((a, b) => a.slotOrder - b.slotOrder);
    return map;
  }, [bookings]);

  // Monday-first grid for the visible month, padded with blanks.
  const cells = useMemo(() => {
    const first = new Date(Date.UTC(view.year, view.month, 1));
    const daysInMonth = new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate();
    const lead = (first.getUTCDay() + 6) % 7;
    const out: (string | null)[] = Array(lead).fill(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(toKey(view.year, view.month, d));
    while (out.length % 7) out.push(null);
    return out;
  }, [view]);

  const monthLabel = new Date(Date.UTC(view.year, view.month, 1)).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const monthKeyPrefix = `${view.year}-${pad(view.month + 1)}`;
  const monthCounts = bookings
    .filter((b) => b.date.startsWith(monthKeyPrefix))
    .reduce<Record<string, number>>((acc, b) => ({ ...acc, [b.status]: (acc[b.status] ?? 0) + 1 }), {});

  const shiftMonth = (delta: number) =>
    setView(({ year, month }) => {
      const d = new Date(Date.UTC(year, month + delta, 1));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    });

  const goToday = () => {
    setView({ year: todayYear, month: todayMonth - 1 });
    setSelected(today);
  };

  const selectedBookings = byDay.get(selected) ?? [];
  const selectedLabel = new Date(`${selected}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });

  return (
    <div className="card bcal">
      <div className="bcal__head">
        <div className="bcal__title">
          <CalendarDays size={18} style={{ color: "#16a34a" }} />
          <h2>Viewing Calendar</h2>
        </div>
        <div className="bcal__nav">
          <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month">
            <ChevronLeft size={16} />
          </button>
          <span className="bcal__month">{monthLabel}</span>
          <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month">
            <ChevronRight size={16} />
          </button>
          <button type="button" className="bcal__today" onClick={goToday}>
            Today
          </button>
        </div>
      </div>

      <div className="bcal__legend">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <span key={status}>
            <i style={{ background: color }} />
            {status} {monthCounts[status] ? `(${monthCounts[status]})` : ""}
          </span>
        ))}
      </div>

      <div className="bcal__body">
        <div className="bcal__grid" role="grid" aria-label={monthLabel}>
          {WEEKDAYS.map((d) => (
            <div key={d} className="bcal__weekday" role="columnheader">
              {d}
            </div>
          ))}
          {cells.map((key, i) => {
            if (!key) return <div key={`blank-${i}`} className="bcal__cell is-blank" />;
            const dayBookings = byDay.get(key) ?? [];
            const isToday = key === today;
            const isPast = key < today;
            const isSelected = key === selected;
            return (
              <button
                key={key}
                type="button"
                role="gridcell"
                aria-selected={isSelected}
                aria-label={`${key}: ${dayBookings.length} viewing${dayBookings.length === 1 ? "" : "s"}`}
                onClick={() => setSelected(key)}
                className={[
                  "bcal__cell",
                  dayBookings.length ? "has-bookings" : "",
                  isToday ? "is-today" : "",
                  isPast ? "is-past" : "",
                  isSelected ? "is-selected" : "",
                ].join(" ")}
              >
                <span className="bcal__day">{Number(key.slice(8))}</span>
                {dayBookings.length > 0 && (
                  <>
                    <span className="bcal__chips">
                      {dayBookings.slice(0, 3).map((b) => (
                        <span
                          key={b.id}
                          className="bcal__chip"
                          style={{ borderLeftColor: STATUS_COLORS[b.status] ?? "#a8a29e" }}
                        >
                          {b.slot.slice(0, 5)} {b.fullName.split(" ")[0]}
                        </span>
                      ))}
                      {dayBookings.length > 3 && (
                        <span className="bcal__more">+{dayBookings.length - 3} more</span>
                      )}
                    </span>
                    <span className="bcal__dots" aria-hidden="true">
                      {dayBookings.slice(0, 4).map((b) => (
                        <i key={b.id} style={{ background: STATUS_COLORS[b.status] ?? "#a8a29e" }} />
                      ))}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        <aside className="bcal__agenda" aria-live="polite">
          <h3>{selectedLabel}</h3>
          {selectedBookings.length === 0 ? (
            <p className="bcal__empty">No viewings booked for this day.</p>
          ) : (
            <ul>
              {selectedBookings.map((b) => (
                <li key={b.id} style={{ borderLeftColor: STATUS_COLORS[b.status] ?? "#a8a29e" }}>
                  <div className="bcal__row">
                    <span className="bcal__slot">
                      <Clock size={13} /> {b.slot}
                    </span>
                    <span className={`badge badge-${b.status}`}>{b.status}</span>
                  </div>
                  <strong>{b.fullName}</strong>
                  <Link href={`/properties/${b.propertySlug}`} target="_blank" className="bcal__property">
                    {b.propertyTitle}
                  </Link>
                  <a href={`tel:${b.phone.replace(/\s+/g, "")}`} className="bcal__phone">
                    <Phone size={12} /> {b.phone}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/bookings" className="bcal__manage">
            Manage bookings →
          </Link>
        </aside>
      </div>

      {/* Global (prefixed) so the styles also reach <Link> elements. */}
      <style jsx global>{`
        .bcal {
          padding: 1.5rem;
        }
        .bcal__head {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--color-stone-200);
        }
        .bcal__title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .bcal__title h2 {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0;
        }
        .bcal__nav {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .bcal__nav button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          height: 32px;
          padding: 0 0.6rem;
          border: 1px solid var(--color-stone-200);
          border-radius: 8px;
          background: #fff;
          color: var(--text-secondary);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
        }
        .bcal__nav button:hover {
          border-color: #16a34a;
          color: #16a34a;
        }
        .bcal__month {
          min-width: 9.5rem;
          text-align: center;
          font-family: "Outfit", sans-serif;
          font-weight: 700;
        }
        .bcal__legend {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin: 0.9rem 0 1rem;
          font-size: 0.78rem;
          color: var(--text-secondary);
          text-transform: capitalize;
        }
        .bcal__legend span {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
        .bcal__legend i {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }
        .bcal__body {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        .bcal__grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 4px;
        }
        .bcal__weekday {
          padding: 0.25rem 0;
          text-align: center;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .bcal__cell {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
          min-height: 64px;
          padding: 0.4rem;
          border: 1px solid var(--color-stone-200);
          border-radius: 8px;
          background: #fff;
          text-align: left;
          cursor: pointer;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .bcal__cell.is-blank {
          border-color: transparent;
          background: transparent;
          cursor: default;
        }
        .bcal__cell:not(.is-blank):hover {
          border-color: #86efac;
        }
        .bcal__cell.is-past {
          background: var(--color-stone-50);
        }
        .bcal__cell.is-past .bcal__day {
          color: var(--text-muted);
        }
        .bcal__cell.has-bookings {
          background: rgba(22, 163, 74, 0.04);
        }
        .bcal__cell.is-selected {
          border-color: #16a34a;
          box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.18);
        }
        .bcal__day {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .bcal__cell.is-today .bcal__day {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #16a34a;
          color: #fff;
        }
        .bcal__chips {
          display: none;
          flex-direction: column;
          gap: 2px;
          width: 100%;
        }
        .bcal__chip {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          padding: 1px 4px;
          border-left: 3px solid;
          border-radius: 3px;
          background: var(--color-stone-100);
          font-size: 0.68rem;
          color: var(--text-primary);
        }
        .bcal__more {
          font-size: 0.66rem;
          color: var(--text-muted);
        }
        .bcal__dots {
          display: flex;
          gap: 3px;
        }
        .bcal__dots i {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }
        .bcal__agenda h3 {
          font-size: 1rem;
          font-weight: 700;
          margin: 0 0 0.75rem;
        }
        .bcal__agenda ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .bcal__agenda li {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          padding: 0.7rem 0.8rem;
          border-left: 4px solid;
          border-radius: 8px;
          background: var(--bg-primary);
          font-size: 0.85rem;
        }
        .bcal__row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .bcal__slot,
        .bcal__phone {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.78rem;
          color: var(--text-secondary);
          text-decoration: none;
        }
        .bcal__property {
          color: #16a34a;
          font-size: 0.82rem;
          text-decoration: none;
        }
        .bcal__empty {
          margin: 0;
          padding: 1.5rem 1rem;
          border-radius: 8px;
          background: var(--bg-primary);
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .bcal__manage {
          display: inline-block;
          margin-top: 1rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: #16a34a;
          text-decoration: none;
        }
        @media (min-width: 768px) {
          .bcal__cell {
            min-height: 92px;
          }
          .bcal__chips {
            display: flex;
          }
          .bcal__dots {
            display: none;
          }
        }
        @media (min-width: 1200px) {
          .bcal__body {
            grid-template-columns: minmax(0, 1fr) 300px;
          }
        }
      `}</style>
    </div>
  );
}
