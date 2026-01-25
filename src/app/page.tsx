import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { MenuSection } from "@/components/menu-section";
import { OffersCarousel } from "@/components/offers-carousel";
import { CartButton } from "@/components/cart-button";
import { getRestaurant, getSectionItems } from "@/lib/data";

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
      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4 text-center">
          <p>
            &copy; {new Date().getFullYear()} {restaurant.name}. All Rights
            Reserved.
          </p>
        </div>
      </footer>
      <CartButton />
    </div>
  );
}
