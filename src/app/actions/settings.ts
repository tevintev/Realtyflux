"use server";

import { db } from "@/lib/db";
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
  linkedinUrl?: string;
}

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
    socialLinks: {
      ...staticCompanyInfo.socialLinks,
      facebook: dbSettings.facebookUrl || staticCompanyInfo.socialLinks.facebook,
      instagram: dbSettings.instagramUrl || staticCompanyInfo.socialLinks.instagram,
      twitter: dbSettings.twitterUrl || staticCompanyInfo.socialLinks.twitter,
      linkedin: dbSettings.linkedinUrl || staticCompanyInfo.socialLinks.linkedin,
    }
  };
}

/**
 * Update the company settings row (upserts if somehow missing).
 */
export async function updateCompanySettings(data: CompanySettingsInput) {
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
          facebookUrl: data.facebookUrl || null,
          instagramUrl: data.instagramUrl || null,
          twitterUrl: data.twitterUrl || null,
          linkedinUrl: data.linkedinUrl || null,
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
          facebookUrl: data.facebookUrl || null,
          instagramUrl: data.instagramUrl || null,
          twitterUrl: data.twitterUrl || null,
          linkedinUrl: data.linkedinUrl || null,
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

