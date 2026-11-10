import { PrismaClient } from "@prisma/client";
import { properties } from "../src/data/properties";
import { companyInfo } from "../src/data/company";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data (idempotent seeding)
  console.log("Cleaning old records...");
  await prisma.booking.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.propertyImage.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.companySettings.deleteMany({});
  
  // Seed Company Settings
  console.log("Seeding company settings...");
  await prisma.companySettings.create({
    data: {
      companyName: companyInfo.name,
      logo: "/logo.png",
      mission: companyInfo.mission,
      about: companyInfo.about,
      email: companyInfo.email,
      phone: companyInfo.phone,
      address: companyInfo.address,
      facebookUrl: companyInfo.socialLinks.facebook || "",
      instagramUrl: companyInfo.socialLinks.instagram || "",
      twitterUrl: companyInfo.socialLinks.twitter || "",
      tiktokUrl: companyInfo.socialLinks.tiktok || "",
    }
  });

  // Seed Properties
  console.log("Seeding properties...");
  // The demo data only has agent names (strings); look each one up or
  // create it once so properties can link to a real Agent record.
  const agentIdByName = new Map<string, string>();
  async function resolveAgentId(name: string | undefined) {
    if (!name) return null;
    const cached = agentIdByName.get(name);
    if (cached) return cached;

    // Agent.name has no unique constraint, so find-or-create explicitly
    // rather than upsert (which needs a unique `where`).
    const existing = await prisma.agent.findFirst({ where: { name } });
    const agent = existing || (await prisma.agent.create({ data: { name } }));
    agentIdByName.set(name, agent.id);
    return agent.id;
  }

  for (const item of properties) {
    const agentId = await resolveAgentId(item.agent);
    const createdProperty = await prisma.property.create({
      data: {
        title: item.title,
        slug: item.slug,
        description: item.description,
        shortDescription: item.shortDescription,
        price: item.price,
        currency: item.currency || "KES",
        propertyType: item.propertyType,
        listingType: item.listingType,
        status: item.status || "on-sale",
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        size: item.size,
        sizeUnit: item.sizeUnit || "sq ft",
        location: item.location,
        address: item.address,
        featuredImage: item.featuredImage,
        amenities: item.amenities,
        yearBuilt: item.yearBuilt || null,
        isFeatured: item.isFeatured || false,
        agentId,
      }
    });

    console.log(`Created property: ${createdProperty.title} (${createdProperty.id})`);

    // Seed Property Images (from gallery)
    if (item.gallery && item.gallery.length > 0) {
      const imagesData = item.gallery.map((url, index) => ({
        propertyId: createdProperty.id,
        imageUrl: url,
        caption: `${createdProperty.title} Image ${index + 1}`,
        sortOrder: index,
      }));

      await prisma.propertyImage.createMany({
        data: imagesData,
      });
      console.log(`  Added ${imagesData.length} gallery images`);
    }
  }

  // Seed Admin User (only on first run — re-seeding must not clobber a
  // password that was changed later via `npm run reset-admin-password`)
  console.log("Seeding admin user...");
  const existingAdmin = await prisma.adminUser.findUnique({ where: { username: "admin" } });
  if (existingAdmin) {
    console.log("  Admin user already exists, leaving password untouched.");
  } else {
    const hashedAdminPassword = "$2b$10$ZIF/3w06klPC1R0VP9105.q157P9juyuy9kr7NCLXNG55q9Olf.uS";
    await prisma.adminUser.create({
      data: {
        username: "admin",
        password: hashedAdminPassword,
        name: "Administrator",
      },
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
