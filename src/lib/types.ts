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
  couponCode?: string;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
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

export type CustomizationOption = {
  id: string;
  name: string;
  price: number;
};

export type CustomizationGroup = {
  id: string;
  name: string;
  minSelection: number;
  maxSelection: number;
  options: CustomizationOption[];
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
  customizations?: CustomizationGroup[];
  discountType?: "percentage" | "fixed" | "none";
  discountValue?: number;
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
  selectedCustomizations?: {
    groupId: string;
    groupName: string;
    optionId: string;
    optionName: string;
    price: number;
  }[];
  price: number;
  notes?: string;
};

export type Cart = {
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  couponCode?: string;
  tax: number;
  total: number;
};

// Order Types
export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "delivered"
  | "completed"
  | "cancelled";

export type OrderItem = {
  dishId: string;
  dishName: string;
  quantity: number;
  price: number; // This is the final price after dish discount
  originalPrice?: number; // Original price before dish discount
  dishDiscountType?: "percentage" | "fixed" | "none";
  dishDiscountValue?: number;
  isVeg: boolean;
  notes?: string;
  variantId?: string;
  variantName?: string;
  selectedCustomizations?: {
    groupId: string;
    groupName: string;
    optionId: string;
    optionName: string;
    price: number;
  }[];
};

export type Order = {
  id: string;
  orderNumber: string; // e.g., "ORD-001"
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  items: OrderItem[];
  subtotal: number;
  discount?: number; // Discount amount applied
  discountType?: "percentage" | "fixed"; // Type of discount
  discountValue?: number; // Original discount value entered
  couponCode?: string; // Applied coupon code
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
