import { getAllCategories } from '@/lib/data';
import { CategoriesClient } from './categories-client';

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="p-4 md:p-8">
      <CategoriesClient categories={categories} />
    </div>
  );
}
