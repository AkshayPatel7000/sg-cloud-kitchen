import type { LucideIcon } from "lucide-react";

export type Restaurant = {
  name: string;
  logoUrl: string;
  tagline: string;
  address: string;
  phone: string;
  whatsappNumber?: string; // WhatsApp number with country code (e.g., "919876543210")
  email: string;
  openingHours: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
};

export type SectionType = "offers" | "todaysSpecial" | "whatsNew";

export type SectionItem = {
  id: string;
  sectionType: SectionType;
  title: string;
  description: string;
  imageUrl: string;
  price?: number;
  isActive: boolean;
  priority: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  isActive: boolean;
};

export type Dish = {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  price: number;
  imageUrl: string;
  isVeg: boolean;
  isAvailable: boolean;
  tags: ("spicy" | "bestseller")[];
};

export type AdminUser = {
  uid: string;
  role: "admin";
  name: string;
  email: string;
};

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

// Cart Types
export type CartItem = {
  dish: Dish;
  quantity: number;
};

export type Cart = {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
};
