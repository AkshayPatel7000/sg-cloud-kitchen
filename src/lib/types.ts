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
  isGstEnabled?: boolean;
  gstNumber?: string;
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

export type DishVariant = {
  id: string;
  name: string;
  price: number;
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
  variants?: DishVariant[];
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
  variantId?: string;
  variantName?: string;
  price: number;
};

export type Cart = {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
};

// Order Types
export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type OrderItem = {
  dishId: string;
  dishName: string;
  quantity: number;
  price: number;
  isVeg: boolean;
  notes?: string;
  variantId?: string;
  variantName?: string;
};

export type Order = {
  id: string;
  orderNumber: string; // e.g., "ORD-001"
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  discount?: number; // Discount amount applied
  discountType?: "percentage" | "fixed"; // Type of discount
  discountValue?: number; // Original discount value entered
  tax: number;
  total: number;
  status: OrderStatus;
  orderType: "dine-in" | "takeaway" | "delivery";
  tableNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Admin user ID
  isPaid: boolean;
  isViewed: boolean;
  paymentMethod?: "cash" | "card" | "upi" | "online";
};
