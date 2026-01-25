import { getCategories, getDishes } from "@/lib/data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { DishListItem } from "./dish-list-item";

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
      <Accordion
        type="single"
        collapsible
        className="w-full max-w-4xl mx-auto"
        defaultValue={categories[0].id}
      >
        {categories.map((category, index) => {
          const dishes = allDishes.filter(
            (dish) => dish.categoryId === category.id && dish.isAvailable,
          );
          return (
            <AccordionItem key={category.id} value={category.id}>
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
    </section>
  );
}
