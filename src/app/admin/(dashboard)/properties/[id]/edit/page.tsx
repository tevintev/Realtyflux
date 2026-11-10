import { db } from "@/lib/db";
import PropertyForm from "@/components/admin/PropertyForm";
import { notFound } from "next/navigation";

interface EditPropertyPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  // Await params for compatibility with Next.js 15/16
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const [property, agents] = await Promise.all([
    db.property.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    }),
    db.agent.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!property) {
    notFound();
  }

  // Convert decimal types from Prisma to standard JS numbers
  const initialData = {
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
    featuredImage: property.featuredImage,
    amenities: property.amenities,
    yearBuilt: property.yearBuilt,
    isFeatured: property.isFeatured,
    agentId: property.agentId,
    images: property.images.map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      caption: img.caption,
      sortOrder: img.sortOrder,
    })),
  };

  return <PropertyForm initialData={initialData} agents={agents} />;
}
