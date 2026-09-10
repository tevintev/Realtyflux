export type PropertyStatus = "on-sale" | "sold" | "rented" | "pending";
export type PropertyType = "house" | "apartment" | "land" | "commercial" | "villa" | "townhouse";
export type ListingType = "sale" | "rent";
export type BookingStatus = "pending" | "confirmed" | "rescheduled" | "completed" | "cancelled";

export interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  currency: string;
  propertyType: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  size: number;
  sizeUnit: string;
  location: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  featuredImage: string;
  gallery: string[];
  amenities: string[];
  yearBuilt?: number;
  isFeatured: boolean;
  agent?: string;
  createdAt: string;
}

export interface CompanyInfo {
  name: string;
  logo?: string | null;
  tagline: string;
  mission: string;
  about: string;
  story: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    whatsapp?: string;
  };
  stats: {
    propertiesSold: number;
    happyClients: number;
    yearsExperience: number;
    activeListings: number;
  };
  values: { title: string; description: string; icon: string }[];
  team: TeamMember[];
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  image: string;
  content: string;
  rating: number;
  propertyType?: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  fullName: string;
  phone: string;
  email: string;
  preferredDate: string;
  preferredTime: string;
  message?: string;
  status: BookingStatus;
  createdAt: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  propertyId?: string;
  createdAt: string;
  isRead: boolean;
}

export interface PropertyCategory {
  name: string;
  slug: PropertyType;
  description: string;
  icon: string;
  count: number;
  image: string;
}
