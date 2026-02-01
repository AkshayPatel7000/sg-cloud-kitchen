"use client";

import { useEffect, useState } from "react";
import { getDishes, getAllCategories } from "@/lib/data";
import { DishesClient } from "./dishes-client";
import { Dish, Category } from "@/lib/types";

export default function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dishesData, categoriesData] = await Promise.all([
          getDishes(),
          getAllCategories(),
        ]);
        setDishes(dishesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading dishes data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <DishesClient dishes={dishes} categories={categories} />
    </div>
  );
}
