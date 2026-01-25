import type { Restaurant } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Button } from './ui/button';
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react';

export function Hero({ restaurant }: { restaurant: Restaurant }) {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

  return (
    <section className="relative h-[60vh] min-h-[400px] w-full text-white">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          data-ai-hint={heroImage.imageHint}
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center p-4">
        <div className="bg-black/30 backdrop-blur-sm p-8 rounded-lg">
          <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight text-white">
            {restaurant.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-white/90">
            {restaurant.tagline}
          </p>
          <div className="mt-8 flex justify-center">
            <Button size="lg" variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90">
              View Menu
            </Button>
          </div>
        </div>
        
        <div id="contact" className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
             <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/80">
                <div className="flex items-center gap-2"><MapPin size={14} /> {restaurant.address}</div>
                <div className="flex items-center gap-2"><Phone size={14} /> {restaurant.phone}</div>
                <div className="flex items-center gap-2"><Mail size={14} /> {restaurant.email}</div>
                <div className="flex items-center gap-4">
                    {restaurant.socialLinks.facebook && <a href={restaurant.socialLinks.facebook} aria-label="Facebook"><Facebook size={16}/></a>}
                    {restaurant.socialLinks.instagram && <a href={restaurant.socialLinks.instagram} aria-label="Instagram"><Instagram size={16}/></a>}
                    {restaurant.socialLinks.twitter && <a href={restaurant.socialLinks.twitter} aria-label="Twitter"><Twitter size={16}/></a>}
                </div>
             </div>
        </div>
      </div>
    </section>
  );
}
