/**
 * Google Analytics Event Tracking Utilities
 *
 * This file contains helper functions to track user interactions
 * with Google Analytics 4 (GA4) using gtag.js
 */

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>,
    ) => void;
  }
}

/**
 * Track when a user views a menu item (clicks to see details)
 */
export const trackMenuItemView = (dish: {
  id: string;
  name: string;
  category?: string;
  price: number;
  isVeg: boolean;
}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "view_item", {
      currency: "INR",
      value: dish.price,
      items: [
        {
          item_id: dish.id,
          item_name: dish.name,
          item_category: dish.category || "Uncategorized",
          price: dish.price,
          item_variant: dish.isVeg ? "Vegetarian" : "Non-Vegetarian",
        },
      ],
    });
  }
};

/**
 * Track when a user adds an item to cart
 */
export const trackAddToCart = (dish: {
  id: string;
  name: string;
  category?: string;
  price: number;
  isVeg: boolean;
  quantity: number;
  variantName?: string;
}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "add_to_cart", {
      currency: "INR",
      value: dish.price * dish.quantity,
      items: [
        {
          item_id: dish.id,
          item_name: dish.name,
          item_category: dish.category || "Uncategorized",
          price: dish.price,
          quantity: dish.quantity,
          item_variant:
            dish.variantName || (dish.isVeg ? "Vegetarian" : "Non-Vegetarian"),
        },
      ],
    });
  }
};

/**
 * Track when a user removes an item from cart
 */
export const trackRemoveFromCart = (dish: {
  id: string;
  name: string;
  category?: string;
  price: number;
  quantity: number;
}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "remove_from_cart", {
      currency: "INR",
      value: dish.price * dish.quantity,
      items: [
        {
          item_id: dish.id,
          item_name: dish.name,
          item_category: dish.category || "Uncategorized",
          price: dish.price,
          quantity: dish.quantity,
        },
      ],
    });
  }
};

/**
 * Track when a user views their cart
 */
export const trackViewCart = (cartData: {
  itemCount: number;
  total: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "view_cart", {
      currency: "INR",
      value: cartData.total,
      items: cartData.items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }
};

/**
 * Track when a user begins checkout process
 */
export const trackBeginCheckout = (cartData: {
  total: number;
  itemCount: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
  }>;
}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "begin_checkout", {
      currency: "INR",
      value: cartData.total,
      items: cartData.items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category || "Uncategorized",
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }
};

/**
 * Track when a user completes a purchase
 */
export const trackPurchase = (orderData: {
  orderId: string;
  total: number;
  tax: number;
  discount: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
  }>;
}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: orderData.orderId,
      currency: "INR",
      value: orderData.total,
      tax: orderData.tax,
      shipping: 0,
      items: orderData.items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category || "Uncategorized",
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }
};

/**
 * Track when a user opens a menu category
 */
export const trackCategoryView = (category: {
  id: string;
  name: string;
  dishCount: number;
}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "view_item_list", {
      item_list_id: category.id,
      item_list_name: category.name,
      items: [], // We don't need to send all items, just the category info
    });

    // Also send a custom event for easier tracking
    window.gtag("event", "menu_category_open", {
      category_id: category.id,
      category_name: category.name,
      dish_count: category.dishCount,
    });
  }
};

/**
 * Track custom events (for any other interactions)
 */
export const trackCustomEvent = (
  eventName: string,
  eventParams?: Record<string, any>,
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
};

/**
 * Track when user applies a coupon
 */
export const trackCouponApplied = (couponData: {
  couponCode: string;
  discountValue: number;
  cartTotal: number;
}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "coupon_applied", {
      coupon_code: couponData.couponCode,
      discount_value: couponData.discountValue,
      cart_total: couponData.cartTotal,
    });
  }
};

/**
 * Track when user searches (if you add search functionality)
 */
export const trackSearch = (searchTerm: string, resultCount: number) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "search", {
      search_term: searchTerm,
      result_count: resultCount,
    });
  }
};
