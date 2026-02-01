"use client";

import { useEffect, useState } from "react";
import { getRestaurant } from "@/lib/data";
import { CartPageClient } from "./cart-client";
import { Restaurant } from "@/lib/types";

export default function CartPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getRestaurant();
        setRestaurant(data);
      } catch (error) {
        console.error("Error loading restaurant data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading || !restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <CartPageClient restaurant={restaurant} />;
}
