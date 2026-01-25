
import type { Dish } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { VegNonVegIcon } from './veg-non-veg-icon';
import { Badge } from './ui/badge';
import { Flame, Star } from 'lucide-react';

export function DishCard({ dish }: { dish: Dish }) {
  return (
    <Card className="h-full overflow-hidden transition-shadow duration-300 hover:shadow-xl">
      <div className="relative aspect-video w-full">
        <Image src={dish.imageUrl} alt={dish.name} fill className="object-cover" />
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg">{dish.name}</CardTitle>
          <div className="flex items-center gap-2">
            <VegNonVegIcon isVeg={dish.isVeg} />
            <p className="text-lg font-bold text-primary whitespace-nowrap">
              ₹{dish.price.toFixed(2)}
            </p>
          </div>
        </div>
        <CardDescription>{dish.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {dish.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {dish.tags.map((tag) => (
              <Badge key={tag} variant={tag === 'bestseller' ? 'default' : 'secondary'} className='bg-accent text-accent-foreground'>
                {tag === 'spicy' && <Flame className="mr-1 h-3 w-3" />}
                {tag === 'bestseller' && <Star className="mr-1 h-3 w-3" />}
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
