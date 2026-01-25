import { getRestaurant } from '@/lib/data';
import { RestaurantClientPage } from './restaurant-client';

export default async function RestaurantPage() {
  const restaurantData = await getRestaurant();

  return (
    <div className="p-4 md:p-8">
      <RestaurantClientPage restaurantData={restaurantData} />
    </div>
  );
}
