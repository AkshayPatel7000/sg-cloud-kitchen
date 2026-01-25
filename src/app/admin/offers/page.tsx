import { getAllSectionItems } from '@/lib/data';
import { OffersClient } from './offers-client';

export default async function OffersPage() {
  const offers = await getAllSectionItems();

  return (
    <div className="p-4 md:p-8">
      <OffersClient offers={offers} />
    </div>
  );
}
