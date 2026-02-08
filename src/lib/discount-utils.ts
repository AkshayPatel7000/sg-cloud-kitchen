import type { Dish } from "./types";

/**
 * Calculate the discounted price for a dish
 * @param dish - The dish object
 * @param basePrice - The base price (defaults to dish.price)
 * @returns Object with originalPrice, discountedPrice, and hasDiscount
 */
export function calculateDishDiscount(dish: Dish, basePrice?: number) {
  const price = basePrice ?? dish.price;

  if (
    !dish.discountType ||
    !dish.discountValue ||
    dish.discountType === "none"
  ) {
    return {
      originalPrice: price,
      discountedPrice: price,
      hasDiscount: false,
      discountAmount: 0,
    };
  }

  let discountAmount = 0;

  if (dish.discountType === "percentage") {
    discountAmount = (price * dish.discountValue) / 100;
  } else if (dish.discountType === "fixed") {
    discountAmount = Math.min(dish.discountValue, price);
  }

  return {
    originalPrice: price,
    discountedPrice: Math.max(0, price - discountAmount),
    hasDiscount: true,
    discountAmount,
  };
}
