"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface PropertyInput {
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
  featuredImage?: string;
  amenities: string[];
  yearBuilt?: number | null;
  isFeatured: boolean;
  agent?: string;
  gallery: string[];
}

export async function createProperty(data: PropertyInput) {
  try {
    // Check if slug is unique
    const existing = await db.property.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return { error: "A property with this slug already exists." };
    }

    // Create property and its associated images in a database transaction
    const property = await db.$transaction(async (tx) => {
      const p = await tx.property.create({
        data: {
          title: data.title,
          slug: data.slug,
          description: data.description,
          shortDescription: data.shortDescription,
          price: data.price,
          currency: data.currency,
          propertyType: data.propertyType,
          listingType: data.listingType,
          status: data.status,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          size: data.size,
          sizeUnit: data.sizeUnit,
          location: data.location,
          address: data.address,
          featuredImage: data.featuredImage || null,
          amenities: data.amenities,
          yearBuilt: data.yearBuilt || null,
          isFeatured: data.isFeatured,
          agent: data.agent || null,
        },
      });

      if (data.gallery && data.gallery.length > 0) {
        await tx.propertyImage.createMany({
          data: data.gallery.map((url, index) => ({
            propertyId: p.id,
            imageUrl: url,
            caption: `${p.title} Image ${index + 1}`,
            sortOrder: index,
          })),
        });
      }
      return p;
    });

    revalidatePath("/properties");
    revalidatePath("/admin/properties");
    revalidatePath("/admin");
    return { success: true, propertyId: property.id };
  } catch (error) {
    console.error("Failed to create property:", error);
    return { error: "Failed to create property." };
  }
}

export async function updateProperty(id: string, data: PropertyInput) {
  try {
    // Check if slug is unique excluding this property
    const existing = await db.property.findFirst({
      where: {
        slug: data.slug,
        id: { not: id },
      },
    });
    if (existing) {
      return { error: "A property with this slug already exists." };
    }

    await db.$transaction(async (tx) => {
      // Update properties record
      await tx.property.update({
        where: { id },
        data: {
          title: data.title,
          slug: data.slug,
          description: data.description,
          shortDescription: data.shortDescription,
          price: data.price,
          currency: data.currency,
          propertyType: data.propertyType,
          listingType: data.listingType,
          status: data.status,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          size: data.size,
          sizeUnit: data.sizeUnit,
          location: data.location,
          address: data.address,
          featuredImage: data.featuredImage || null,
          amenities: data.amenities,
          yearBuilt: data.yearBuilt || null,
          isFeatured: data.isFeatured,
          agent: data.agent || null,
          updatedAt: new Date(),
        },
      });

      // Synchronize images: delete current ones first
      await tx.propertyImage.deleteMany({
        where: { propertyId: id },
      });

      // Re-insert new gallery images list
      if (data.gallery && data.gallery.length > 0) {
        await tx.propertyImage.createMany({
          data: data.gallery.map((url, index) => ({
            propertyId: id,
            imageUrl: url,
            caption: `${data.title} Image ${index + 1}`,
            sortOrder: index,
          })),
        });
      }
    });

    revalidatePath("/properties");
    revalidatePath(`/properties/${data.slug}`);
    revalidatePath("/admin/properties");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update property:", error);
    return { error: "Failed to update property." };
  }
}

export async function deleteProperty(id: string) {
  try {
    await db.property.delete({
      where: { id },
    });
    revalidatePath("/properties");
    revalidatePath("/admin/properties");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete property:", error);
    return { error: "Failed to delete property." };
  }
}
