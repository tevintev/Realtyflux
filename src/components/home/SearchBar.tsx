"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { gsap, getLenis, motionEnabled } from "@/lib/motion";

type ListingType = "" | "sale" | "rent";
type Panel = "location" | "type" | "budget" | null;

interface Listing {
  location: string;
  propertyType: string;
  listingType: string;
  price: number;
}

const LISTING_TABS: { value: ListingType; label: string }[] = [
  { value: "", label: "Any" },
  { value: "sale", label: "Buy" },
  { value: "rent", label: "Rent" },
];

const TYPES = [
  { value: "house", label: "Houses", image: "/images/showcase/houses.webp" },
  { value: "apartment", label: "Apartments", image: "/images/showcase/apartments.webp" },
  { value: "villa", label: "Villas", image: "/images/showcase/villas.webp" },
  { value: "townhouse", label: "Townhouses", image: "/images/showcase/townhouses.webp" },
  { value: "commercial", label: "Commercial", image: "/images/showcase/commercial.webp" },
  { value: "land", label: "Land", image: "/images/showcase/land.webp" },
];

// Sale and rental prices live on different scales (millions vs. monthly
// thousands), so the budget options switch with the listing type.
const SALE_BUDGETS = [
  { value: "15000000", label: "15M" },
  { value: "35000000", label: "35M" },
  { value: "65000000", label: "65M" },
  { value: "100000000", label: "100M" },
];
const RENT_BUDGETS = [
  { value: "75000", label: "75K / mo" },
  { value: "100000", label: "100K / mo" },
  { value: "150000", label: "150K / mo" },
  { value: "250000", label: "250K / mo" },
];

/** "Lavington, Nairobi" → "Nairobi": the broad area people search by. */
function cityOf(location: string) {
  const parts = location.split(",").map((p) => p.trim()).filter(Boolean);
  return parts[parts.length - 1] ?? location;
}

// Same rules as the properties page, so the count matches what you land on.
function matches(p: Listing, f: { listingType: string; location: string; type: string; price: string }) {
  if (f.type && p.propertyType?.toLowerCase() !== f.type) return false;
  if (f.location && !p.location?.toLowerCase().includes(f.location.toLowerCase())) return false;
  if (f.listingType && p.listingType?.toLowerCase() !== f.listingType) return false;
  if (f.price && p.price > parseFloat(f.price)) return false;
  return true;
}

const Icon = {
  pin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
    </svg>
  ),
  wallet: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M16 13h2M2 10h20" />
    </svg>
  ),
  search: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  chevron: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
};

export default function SearchBar() {
  const router = useRouter();
  const [listingType, setListingType] = useState<ListingType>("");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [openPanel, setOpenPanel] = useState<Panel>(null);
  const [listings, setListings] = useState<Listing[] | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabPillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => setListings(Array.isArray(data) ? data : []))
      .catch(() => setListings([]));
  }, []);

  const budgets = listingType === "rent" ? RENT_BUDGETS : SALE_BUDGETS;
  const filters = { listingType, location, type: propertyType, price: priceRange };

  // Counts for each option given the *other* filters, so every choice shows
  // how many listings it would leave.
  const countWith = useCallback(
    (override: Partial<typeof filters>) =>
      listings ? listings.filter((p) => matches(p, { ...filters, ...override })).length : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listings, listingType, location, propertyType, priceRange]
  );
  const resultCount = countWith({});

  const cities = useMemo(() => {
    const set = new Map<string, number>();
    for (const p of listings ?? []) {
      const city = cityOf(p.location ?? "");
      if (city) set.set(city, (set.get(city) ?? 0) + 1);
    }
    return [...set.keys()].sort();
  }, [listings]);

  // Popular shortcuts from real listings: the most common type + city pairs.
  const popular = useMemo(() => {
    const combos = new Map<string, { type: string; city: string; count: number }>();
    for (const p of listings ?? []) {
      const city = cityOf(p.location ?? "");
      const key = `${p.propertyType}|${city}`;
      const entry = combos.get(key) ?? { type: p.propertyType, city, count: 0 };
      entry.count++;
      combos.set(key, entry);
    }
    return [...combos.values()].sort((a, b) => b.count - a.count).slice(0, 4);
  }, [listings]);

  const goToResults = (f = filters) => {
    const params = new URLSearchParams();
    if (f.listingType) params.append("listingType", f.listingType);
    if (f.location) params.append("location", f.location);
    if (f.type) params.append("type", f.type);
    if (f.price) params.append("price", f.price);
    setOpenPanel(null);
    router.push(`/properties${params.size ? `?${params}` : ""}`);
  };

  const handleListingType = (value: ListingType) => {
    setListingType(value);
    setPriceRange(""); // the old budget may not exist on the new price scale
  };

  const choose = (setter: (v: string) => void, value: string) => {
    setter(value);
    setOpenPanel(null);
  };

  // Close panels on outside click or Escape.
  useEffect(() => {
    if (!openPanel) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpenPanel(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenPanel(null);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openPanel]);

  // Animate the panel that just opened and focus its first option.
  useEffect(() => {
    if (!openPanel) return;
    const panel = rootRef.current?.querySelector<HTMLElement>(`[data-panel="${openPanel}"]`);
    if (!panel) return;
    if (motionEnabled()) {
      gsap.fromTo(
        panel,
        { autoAlpha: 0, y: -10, scale: 0.97 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.35, ease: "power3.out" }
      );
      gsap.fromTo(
        panel.querySelectorAll(".sb-option"),
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.025, ease: "power2.out", delay: 0.05 }
      );
    }
    panel.querySelector<HTMLElement>(".sb-option")?.focus({ preventScroll: true });

    // The bar sits low on the first screen, so bring an opened panel fully
    // into view rather than letting it hang off the bottom edge.
    const overflow = panel.getBoundingClientRect().bottom + 24 - window.innerHeight;
    if (overflow > 0) {
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(window.scrollY + overflow, { duration: 0.6 });
      else window.scrollBy({ top: overflow, behavior: "smooth" });
    }
  }, [openPanel]);

  // Sliding highlight behind the active Buy/Rent tab.
  useEffect(() => {
    const active = tabsRef.current?.querySelector<HTMLElement>("[aria-checked='true']");
    const pill = tabPillRef.current;
    if (!active || !pill) return;
    gsap.to(pill, {
      x: active.offsetLeft,
      width: active.offsetWidth,
      duration: motionEnabled() ? 0.45 : 0,
      ease: "expo.out",
    });
  }, [listingType]);

  const locationLabel = location || "Anywhere";
  const typeLabel = TYPES.find((t) => t.value === propertyType)?.label ?? "Any type";
  const budgetLabel = budgets.find((b) => b.value === priceRange)?.label;
  const hasFilters = Boolean(listingType || location || propertyType || priceRange);

  const segment = (panel: Exclude<Panel, null>, icon: React.ReactNode, label: string, value: string, active: boolean) => (
    <button
      type="button"
      className={`sb-segment${openPanel === panel ? " is-open" : ""}${active ? " is-set" : ""}`}
      aria-expanded={openPanel === panel}
      aria-controls={`sb-panel-${panel}`}
      onClick={() => setOpenPanel(openPanel === panel ? null : panel)}
    >
      <span className="sb-segment__icon">{icon}</span>
      <span className="sb-segment__text">
        <span className="sb-segment__label">{label}</span>
        <span className="sb-segment__value">{value}</span>
      </span>
      <span className="sb-segment__chevron">{Icon.chevron}</span>
    </button>
  );

  return (
    <div ref={rootRef} className="sb" data-reveal>
      <div className="sb-top">
        <div ref={tabsRef} className="sb-tabs" role="radiogroup" aria-label="Looking to">
          <span ref={tabPillRef} className="sb-tabs__pill" aria-hidden="true" />
          {LISTING_TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              role="radio"
              aria-checked={listingType === tab.value}
              className="sb-tab"
              onClick={() => handleListingType(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {hasFilters && (
          <button
            type="button"
            className="sb-clear"
            onClick={() => {
              setListingType("");
              setLocation("");
              setPropertyType("");
              setPriceRange("");
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      <form
        className="sb-bar"
        onSubmit={(e) => {
          e.preventDefault();
          goToResults();
        }}
      >
        <div className="sb-field">
          {segment("location", Icon.pin, "Location", locationLabel, Boolean(location))}
          <div id="sb-panel-location" data-panel="location" className="sb-panel" hidden={openPanel !== "location"}>
            <p className="sb-panel__title">Where are you looking?</p>
            <div className="sb-list">
              {["", ...cities].map((city) => {
                const count = countWith({ location: city });
                return (
                  <button
                    key={city || "any"}
                    type="button"
                    className={`sb-option sb-option--row${location === city ? " is-active" : ""}`}
                    onClick={() => choose(setLocation, city)}
                  >
                    <span>{city || "Anywhere"}</span>
                    {count !== null && <span className="sb-count">{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="sb-field">
          {segment("type", Icon.home, "Property type", typeLabel, Boolean(propertyType))}
          <div id="sb-panel-type" data-panel="type" className="sb-panel sb-panel--wide" hidden={openPanel !== "type"}>
            <div className="sb-panel__head">
              <p className="sb-panel__title">What kind of property?</p>
              {propertyType && (
                <button type="button" className="sb-link" onClick={() => choose(setPropertyType, "")}>
                  Any type
                </button>
              )}
            </div>
            <div className="sb-tiles">
              {TYPES.map((t) => {
                const count = countWith({ type: t.value });
                return (
                  <button
                    key={t.value}
                    type="button"
                    className={`sb-option sb-tile${propertyType === t.value ? " is-active" : ""}`}
                    onClick={() => choose(setPropertyType, propertyType === t.value ? "" : t.value)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.image} alt="" loading="lazy" decoding="async" />
                    <span className="sb-tile__label">{t.label}</span>
                    {count !== null && <span className="sb-count">{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="sb-field">
          {segment(
            "budget",
            Icon.wallet,
            listingType === "rent" ? "Monthly budget" : "Max budget",
            budgetLabel ? `Up to KES ${budgetLabel}` : "No limit",
            Boolean(priceRange)
          )}
          <div id="sb-panel-budget" data-panel="budget" className="sb-panel" hidden={openPanel !== "budget"}>
            <p className="sb-panel__title">
              {listingType === "rent" ? "Monthly rent up to" : "Price up to"} (KES)
            </p>
            <div className="sb-chips">
              {[{ value: "", label: "No limit" }, ...budgets].map((b) => (
                <button
                  key={b.value || "none"}
                  type="button"
                  className={`sb-option sb-chip${priceRange === b.value ? " is-active" : ""}`}
                  onClick={() => choose(setPriceRange, b.value)}
                >
                  {b.label}
                </button>
              ))}
            </div>
            {!listingType && (
              <p className="sb-panel__note">Tip: choose Buy or Rent above for prices on the right scale.</p>
            )}
          </div>
        </div>

        <button type="submit" className="sb-submit" data-magnetic="0.2">
          {Icon.search}
          <span>
            {resultCount === null
              ? "Search"
              : resultCount === 0
                ? "No matches yet"
                : `Show ${resultCount} ${resultCount === 1 ? "property" : "properties"}`}
          </span>
        </button>
      </form>

      {popular.length > 0 && (
        <div className="sb-popular">
          <span>Popular:</span>
          {popular.map((p) => {
            const typeName = TYPES.find((t) => t.value === p.type)?.label ?? p.type;
            return (
              <button
                key={`${p.type}-${p.city}`}
                type="button"
                className="sb-popular__chip"
                onClick={() => goToResults({ listingType: "", location: p.city, type: p.type, price: "" })}
              >
                {typeName} in {p.city}
              </button>
            );
          })}
        </div>
      )}

      <style jsx global>{`
        .sb {
          position: relative;
          z-index: 20;
          width: 100%;
          max-width: 980px;
          margin: -3.5rem auto 3rem;
          padding: 0 1.5rem;
        }
        .sb-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }
        .sb-tabs {
          position: relative;
          display: inline-flex;
          padding: 4px;
          border-radius: 999px;
          background: rgba(11, 15, 25, 0.55);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .sb-tabs__pill {
          position: absolute;
          top: 4px;
          bottom: 4px;
          left: 0;
          width: 0;
          border-radius: 999px;
          background: #fff;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
        }
        .sb-tab {
          position: relative;
          padding: 0.45rem 1.25rem;
          border: none;
          border-radius: 999px;
          background: transparent;
          font-family: "Outfit", sans-serif;
          font-size: 0.88rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          transition: color 0.3s ease;
        }
        .sb-tab[aria-checked="true"] {
          color: #14532d;
        }
        .sb-clear {
          border: none;
          background: rgba(11, 15, 25, 0.45);
          color: #fff;
          font-size: 0.8rem;
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
          cursor: pointer;
        }
        .sb-bar {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.25rem;
          padding: 0.5rem;
          border-radius: 24px;
          background: #fff;
          border: 1px solid var(--color-stone-200);
          box-shadow: 0 24px 60px -12px rgba(11, 15, 25, 0.28), 0 0 0 6px rgba(255, 255, 255, 0.35);
        }
        .sb-field {
          position: relative;
        }
        .sb-segment {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.7rem 0.9rem;
          border: none;
          border-radius: 18px;
          background: transparent;
          text-align: left;
          cursor: pointer;
          transition: background 0.25s ease;
        }
        .sb-segment:hover,
        .sb-segment.is-open {
          background: var(--color-stone-100);
        }
        .sb-segment__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: rgba(22, 163, 74, 0.08);
          color: #16a34a;
          transition: background 0.25s ease, color 0.25s ease;
        }
        .sb-segment.is-set .sb-segment__icon {
          background: #16a34a;
          color: #fff;
        }
        .sb-segment__text {
          display: flex;
          flex-direction: column;
          min-width: 0;
          flex: 1;
        }
        .sb-segment__label {
          font-family: "Outfit", sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .sb-segment__value {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .sb-segment__chevron {
          color: var(--text-muted);
          transition: transform 0.3s ease;
        }
        .sb-segment.is-open .sb-segment__chevron {
          transform: rotate(180deg);
        }
        .sb-panel {
          position: absolute;
          top: calc(100% + 0.6rem);
          left: 0;
          z-index: 30;
          width: max(100%, 260px);
          padding: 1rem;
          border-radius: 18px;
          background: #fff;
          border: 1px solid var(--color-stone-200);
          box-shadow: 0 24px 50px -12px rgba(11, 15, 25, 0.25);
          transform-origin: top left;
        }
        .sb-panel[hidden] {
          display: none;
        }
        .sb-panel--wide {
          width: min(440px, calc(100vw - 3rem));
        }
        .sb-panel__head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .sb-panel__title {
          margin: 0 0 0.75rem;
          font-family: "Outfit", sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .sb-panel__note {
          margin: 0.75rem 0 0;
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .sb-link {
          margin-bottom: 0.75rem;
          border: none;
          background: none;
          color: #16a34a;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
        }
        .sb-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .sb-option {
          border: 1px solid transparent;
          cursor: pointer;
          font: inherit;
          color: var(--text-primary);
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .sb-option:focus-visible {
          outline: 2px solid #16a34a;
          outline-offset: 2px;
        }
        .sb-option--row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.6rem 0.75rem;
          border-radius: 10px;
          background: transparent;
          font-size: 0.92rem;
          text-align: left;
        }
        .sb-option--row:hover {
          background: var(--color-stone-100);
        }
        .sb-option.is-active {
          background: rgba(22, 163, 74, 0.08);
          border-color: rgba(22, 163, 74, 0.35);
          color: #15803d;
          font-weight: 600;
        }
        .sb-count {
          min-width: 1.6rem;
          padding: 0.1rem 0.45rem;
          border-radius: 999px;
          background: var(--color-stone-100);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-align: center;
        }
        .sb-tiles {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }
        .sb-tile {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          padding: 0.6rem 0.4rem 0.7rem;
          border-radius: 14px;
          background: var(--bg-primary);
        }
        .sb-tile:hover {
          border-color: var(--color-stone-300);
        }
        .sb-tile img {
          width: 64px;
          height: 64px;
          object-fit: cover;
          border-radius: 10px;
        }
        .sb-tile__label {
          font-size: 0.82rem;
          font-weight: 600;
        }
        .sb-tile .sb-count {
          position: absolute;
          top: 6px;
          right: 6px;
          background: #fff;
        }
        .sb-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .sb-chip {
          padding: 0.5rem 0.9rem;
          border-radius: 999px;
          border-color: var(--color-stone-200);
          background: #fff;
          font-size: 0.85rem;
          font-weight: 500;
        }
        .sb-chip:hover {
          border-color: #16a34a;
        }
        .sb-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 56px;
          padding: 0 1.5rem;
          border: none;
          border-radius: 18px;
          background: linear-gradient(135deg, #16a34a, #15803d);
          color: #fff;
          font-family: "Outfit", sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
          box-shadow: 0 10px 24px -6px rgba(22, 163, 74, 0.55);
          transition: box-shadow 0.25s ease, filter 0.25s ease;
        }
        .sb-submit:hover {
          filter: brightness(1.05);
          box-shadow: 0 14px 30px -6px rgba(22, 163, 74, 0.65);
        }
        .sb-popular {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .sb-popular__chip {
          padding: 0.35rem 0.85rem;
          border: 1px solid var(--color-stone-200);
          border-radius: 999px;
          background: #fff;
          font-size: 0.82rem;
          color: var(--text-primary);
          cursor: pointer;
          transition: border-color 0.2s ease, color 0.2s ease;
        }
        .sb-popular__chip:hover {
          border-color: #16a34a;
          color: #15803d;
        }
        @media (min-width: 900px) {
          .sb-bar {
            grid-template-columns: 1fr 1fr 1fr auto;
            align-items: center;
            border-radius: 999px;
            padding: 0.45rem;
          }
          .sb-segment {
            border-radius: 999px;
          }
          .sb-field + .sb-field::before {
            content: "";
            position: absolute;
            left: 0;
            top: 22%;
            bottom: 22%;
            width: 1px;
            background: var(--color-stone-200);
          }
          .sb-submit {
            border-radius: 999px;
            min-height: 60px;
          }
          .sb-field:nth-child(3) .sb-panel {
            left: auto;
            right: 0;
            transform-origin: top right;
          }
        }
      `}</style>
    </div>
  );
}
