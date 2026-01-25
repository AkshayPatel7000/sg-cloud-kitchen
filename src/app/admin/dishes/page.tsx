import { getDishes, getAllCategories } from '@/lib/data';
import { DishesClient } from './dishes-client';

export default async function DishesPage() {
  const dishes = await getDishes();
  const categories = await getAllCategories();

  return (
    <div className="p-4 md:p-8">
      <DishesClient dishes={dishes} categories={categories} />
    </div>
  );
}
