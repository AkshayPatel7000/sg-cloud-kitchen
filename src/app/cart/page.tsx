import { getRestaurant } from "@/lib/data";
import { CartPageClient } from "./cart-client";

export default async function CartPage() {
  const restaurant = await getRestaurant();

  return <CartPageClient restaurant={restaurant} />;
}
