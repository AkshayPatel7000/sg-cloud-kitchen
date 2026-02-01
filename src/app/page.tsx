import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { MenuSection } from "@/components/menu-section";
import { OffersCarousel } from "@/components/offers-carousel";
import { CartButton } from "@/components/cart-button";
import { getRestaurant, getSectionItems } from "@/lib/data";
import Link from "next/link";

export default async function Home() {
  const restaurant = await getRestaurant();
  const offers = await getSectionItems("offers");
  const todaysSpecial = await getSectionItems("todaysSpecial");
  const whatsNew = await getSectionItems("whatsNew");

  return (
    <div className="flex flex-col min-h-screen">
      <Header restaurant={restaurant} />
      <main className="flex-grow">
        <Hero restaurant={restaurant} />
        <div className="container mx-auto px-4 py-8 md:py-12 space-y-12 md:space-y-16">
          <OffersCarousel items={offers} title="Special Offers" />
          <OffersCarousel items={todaysSpecial} title="Today's Specials" />
          <OffersCarousel items={whatsNew} title="What's New" />
          <MenuSection />
        </div>
      </main>
      <footer className="py-8 bg-muted/50 border-t">
        <div className="container px-4 mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {restaurant.name}. All Rights
            Reserved.
          </p>
          <div className="mt-2 text-[10px] opacity-20 hover:opacity-100 transition-opacity">
            <Link href="/admin" className="hover:underline">
              Admin Login
            </Link>
          </div>
        </div>
      </footer>
      <CartButton />
    </div>
  );
}
