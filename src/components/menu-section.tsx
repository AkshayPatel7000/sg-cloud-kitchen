import { getCategories, getDishes } from "@/lib/data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { DishListItem } from "./dish-list-item";
import { MenuAccordionClient } from "./menu-accordion-client";

export async function MenuSection() {
  const categories = await getCategories();
  const allDishes = await getDishes();

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
