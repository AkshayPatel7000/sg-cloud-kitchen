"use client";

import { useEffect, useState } from "react";
import { getCategories, getDishes } from "@/lib/data";
import { MenuAccordionClient } from "./menu-accordion-client";
import { Category, Dish } from "@/lib/types";

export function MenuSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allDishes, setAllDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

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
    <section id="menu">
      <h2 className="font-headline text-3xl font-bold mb-6 text-center">
        Our Menu
      </h2>
      <MenuAccordionClient categories={categories} allDishes={allDishes} />
    </section>
  );
}
