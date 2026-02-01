"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { MenuSection } from "@/components/menu-section";
import { OffersCarousel } from "@/components/offers-carousel";
import { CartButton } from "@/components/cart-button";
import { getRestaurant, getSectionItems } from "@/lib/data";
import Link from "next/link";
import { Restaurant, SectionItem } from "@/lib/types";

export default function Home() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [offers, setOffers] = useState<SectionItem[]>([]);
  const [todaysSpecial, setTodaysSpecial] = useState<SectionItem[]>([]);
  const [whatsNew, setWhatsNew] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [resData, offersData, specialData, newData] = await Promise.all([
          getRestaurant(),
          getSectionItems("offers"),
          getSectionItems("todaysSpecial"),
          getSectionItems("whatsNew"),
        ]);

        setRestaurant(resData);
        setOffers(offersData);
        setTodaysSpecial(specialData);
        setWhatsNew(newData);
      } catch (error) {
        console.error("Error loading home data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading || !restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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
