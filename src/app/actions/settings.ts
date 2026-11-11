"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { companyInfo as staticCompanyInfo } from "@/data/company";

export interface CompanySettingsInput {
  companyName: string;
  logo?: string;
  mission?: string;
  about?: string;
  email?: string;
  phone?: string;
  address?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  tiktokUrl?: string;
  heroImages?: string[];
}

const MAX_HERO_IMAGES = 3;

/**
 * Fetch the single company settings row.
 * If none exists yet, a default row is created automatically.
 */
export async function getCompanySettings() {
  try {
    // Try to find existing row
    const existing = await db.companySettings.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (existing) return existing;

    // Create default row on first use
    const created = await db.companySettings.create({
      data: {
        companyName: "Realty Flux",
        email: "hello@realtyflux.com",
        phone: "+254 700 123 456",
        address: "Westlands Business Park, 4th Floor, Nairobi, Kenya",
        mission:
          "To transform the real estate experience through transparency, innovation, and an unwavering commitment to helping every client find their perfect space.",
        about:
          "Realty Flux is a modern real estate company dedicated to connecting people with exceptional properties.",
      },
    });

    return created;
  } catch (error) {
    console.error("Failed to load company settings:", error);
    return null;
  }
}

// Hero images must be files this site stored itself (see /api/upload), at most three.
// Social links must be one clean web address: no spaces, http(s) only.
// Returns the tidy URL, "" when empty, or null when it is not a valid link.
function cleanSocialUrl(value?: string): string | null {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  if (/\s/.test(raw)) return null;
  const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes(".") ? url : null;
  } catch {
    return null;
  }
}

function cleanHeroImages(list?: string[]): string[] {
  return (list ?? [])
    .filter((src): src is string => typeof src === "string" && /^\/uploads\/[A-Za-z0-9._-]+$/.test(src))
    .slice(0, MAX_HERO_IMAGES);
}

// wa.me needs the number in international format, digits only. Kenyan numbers
// typed locally ("0796 821 718" or "796821718") are given the 254 country code.
function whatsappLink(phone?: string | null): string | undefined {
  let digits = (phone || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = `254${digits.slice(1)}`;
  else if (digits.length === 9 && /^[17]/.test(digits)) digits = `254${digits}`;
  return digits.length >= 11 ? `https://wa.me/${digits}` : undefined;
}

/**
 * Get merged company settings, falling back to static settings where db settings are missing.
 */
export async function getMergedCompanyInfo() {
  const dbSettings = await getCompanySettings();
  if (!dbSettings) return staticCompanyInfo;

  return {
    ...staticCompanyInfo,
    name: dbSettings.companyName || staticCompanyInfo.name,
    logo: dbSettings.logo || staticCompanyInfo.logo,
    mission: dbSettings.mission || staticCompanyInfo.mission,
    about: dbSettings.about || staticCompanyInfo.about,
    phone: dbSettings.phone || staticCompanyInfo.phone,
    email: dbSettings.email || staticCompanyInfo.email,
    address: dbSettings.address || staticCompanyInfo.address,
    heroImages: dbSettings.heroImages ?? [],
    socialLinks: {
      ...staticCompanyInfo.socialLinks,
      facebook: dbSettings.facebookUrl || staticCompanyInfo.socialLinks.facebook,
      instagram: dbSettings.instagramUrl || staticCompanyInfo.socialLinks.instagram,
      twitter: dbSettings.twitterUrl || staticCompanyInfo.socialLinks.twitter,
      tiktok: dbSettings.tiktokUrl || staticCompanyInfo.socialLinks.tiktok,
      // Chat opens on the same number as the phone set in Settings.
      whatsapp: whatsappLink(dbSettings.phone) || staticCompanyInfo.socialLinks.whatsapp,
    }
  };
}

/**
 * Update the company settings row (upserts if somehow missing).
 */
export async function updateCompanySettings(data: CompanySettingsInput) {
  // Server actions can be called directly, so check the admin session here.
  const session = await getSession();
  if (!session) return { error: "Please sign in as an admin to change settings." };

  const social: Record<string, string> = {};
  for (const [label, key] of [["Facebook", "facebookUrl"], ["Instagram", "instagramUrl"], ["Twitter", "twitterUrl"], ["TikTok", "tiktokUrl"]] as const) {
    const clean = cleanSocialUrl(data[key]);
    if (clean === null) return { error: `The ${label} link is not a valid web address (no spaces, e.g. https://facebook.com/yourpage).` };
    social[key] = clean;
  }

  try {
    const existing = await db.companySettings.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (existing) {
      await db.companySettings.update({
        where: { id: existing.id },
        data: {
          companyName: data.companyName,
          logo: data.logo || null,
          mission: data.mission || null,
          about: data.about || null,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
          facebookUrl: social.facebookUrl || null,
          instagramUrl: social.instagramUrl || null,
          twitterUrl: social.twitterUrl || null,
          tiktokUrl: social.tiktokUrl || null,
          heroImages: cleanHeroImages(data.heroImages),
          updatedAt: new Date(),
        },
      });
    } else {
      await db.companySettings.create({
        data: {
          companyName: data.companyName,
          logo: data.logo || null,
          mission: data.mission || null,
          about: data.about || null,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
          facebookUrl: social.facebookUrl || null,
          instagramUrl: social.instagramUrl || null,
          twitterUrl: social.twitterUrl || null,
          tiktokUrl: social.tiktokUrl || null,
          heroImages: cleanHeroImages(data.heroImages),
        },
      });
    }

    // Revalidate paths to clear Next.js route cache
    revalidatePath("/admin/settings");
    revalidatePath("/admin", "layout");
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    revalidatePath("/properties");
    revalidatePath("/gallery");
    revalidatePath("/book/[propertyId]", "layout");
    revalidatePath("/properties/[slug]", "layout");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update company settings:", error);
    return { error: "Failed to save settings. Please try again." };
  }
}

