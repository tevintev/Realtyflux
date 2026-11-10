import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRenderableImageList, getRenderableImageSrc, getRenderableMediaList } from "@/lib/image-path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dbProperties = await db.property.findMany({
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        agent: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = dbProperties.map((property) => {
      const gallery = getRenderableMediaList(property.images.map((image) => image.imageUrl));
      const imageList = getRenderableImageList(property.images.map((image) => image.imageUrl));
      const featuredImage =
        getRenderableImageSrc(property.featuredImage) ||
        imageList[0] ||
        "";

      return {
        id: property.id,
        title: property.title,
        slug: property.slug,
        description: property.description,
        shortDescription: property.shortDescription,
        price: Number(property.price),
        currency: property.currency,
        propertyType: property.propertyType,
        listingType: property.listingType,
        status: property.status,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        size: Number(property.size),
        sizeUnit: property.sizeUnit,
        location: property.location,
        address: property.address,
        featuredImage,
        gallery,
        amenities: property.amenities,
        yearBuilt: property.yearBuilt || undefined,
        isFeatured: property.isFeatured,
        agent: property.agent?.name || undefined,
        createdAt: property.createdAt.toISOString().split("T")[0],
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("API Error fetching properties:", error);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}
