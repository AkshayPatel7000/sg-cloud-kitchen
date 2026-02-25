"use client";

import { useEffect, useState } from "react";
import { getCategories, getDishes } from "@/lib/data";
import { MenuAccordionClient } from "./menu-accordion-client";
import { Category, Dish, Restaurant } from "@/lib/types";
import { isKitchenOpen } from "@/lib/opening-hours";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function MenuSection({
  restaurant,
}: {
  restaurant?: Restaurant | null;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allDishes, setAllDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  const isOpen = restaurant ? isKitchenOpen(restaurant.openingHours) : true;

  useEffect(() => {
    async function loadMenu() {
      try {
        const [categoriesData, dishesData] = await Promise.all([
          getCategories(),
          getDishes(),
        ]);
        setCategories(categoriesData);
        setAllDishes(dishesData);
      } catch (error) {
        console.error("Error loading menu data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadMenu();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-sm text-muted-foreground">Loading menu...</p>
      </div>
    );
  }

  if (!categories.length) {
    return (
      <section id="menu" className="text-center">
        <h2 className="font-headline text-3xl font-bold">Our Menu</h2>
        <p className="mt-4 text-muted-foreground">
          The menu is currently being updated. Please check back soon!
        </p>
      </section>
    );
  }

  return (
    <section id="menu" className="relative">
      <h2 className="font-headline text-3xl font-bold mb-6 text-center">
        Our Menu
      </h2>

      {!isOpen && (
        <div className="max-w-4xl mx-auto mb-8">
          <Alert
            variant="destructive"
            className="bg-destructive/10 border-destructive/20 text-destructive"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Kitchen is Currently Offline</AlertTitle>
            <AlertDescription>
              We are currently closed. Opening hours: {restaurant?.openingHours}
              . You can still browse our menu, but orders are temporarily
              disabled.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div
        className={cn(
          "transition-all duration-500",
          !isOpen && "grayscale opacity-60",
        )}
      >
        <MenuAccordionClient
          categories={categories}
          allDishes={allDishes}
          isOpen={isOpen}
        />
      </div>
    </section>
  );
}
