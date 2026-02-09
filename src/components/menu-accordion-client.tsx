"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { DishListItem } from "./dish-list-item";
import type { Category, Dish } from "@/lib/types";
import { useRef } from "react";
import { trackCategoryView } from "@/lib/analytics";

interface MenuAccordionClientProps {
  categories: Category[];
  allDishes: Dish[];
}

export function MenuAccordionClient({
  categories,
  allDishes,
}: MenuAccordionClientProps) {
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleValueChange = (value: string) => {
    if (value && itemRefs.current[value]) {
      // Find the category that was opened
      const openedCategory = categories.find((cat) => cat.id === value);
      if (openedCategory) {
        // Count dishes in this category
        const dishCount = allDishes.filter(
          (dish) => dish.categoryId === openedCategory.id && dish.isAvailable,
        ).length;

        // Track category view
        trackCategoryView({
          id: openedCategory.id,
          name: openedCategory.name,
          dishCount,
        });
      }

      // Small delay to allow the accordion animation to start/content to expand
      setTimeout(() => {
        const element = itemRefs.current[value];
        if (element) {
          const headerHeight = 80; // Approximate height of sticky header + padding
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 300); // 300ms matches standard accordion animation duration
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full max-w-4xl mx-auto"
      onValueChange={handleValueChange}
    >
      {categories.map((category) => {
        const dishes = allDishes.filter(
          (dish) => dish.categoryId === category.id && dish.isAvailable,
        );
        return (
          <AccordionItem
            key={category.id}
            value={category.id}
            ref={(el) => {
              itemRefs.current[category.id] = el;
            }}
          >
            <AccordionTrigger className="text-xl hover:no-underline">
              <div className="flex flex-col text-left">
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-sm font-normal text-muted-foreground">
                  {category.description}
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {dishes.length > 0 ? (
                <div className="divide-y divide-border">
                  {dishes.map((dish) => (
                    <DishListItem key={dish.id} dish={dish} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No dishes available in this category at the moment.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
