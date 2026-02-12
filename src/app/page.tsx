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
import { motion } from "framer-motion";
import {
  Utensils,
  Clock,
  ShieldCheck,
  Heart,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import packageInfo from "../../package.json";

const version = packageInfo.version;

const features = [
  {
    icon: <Utensils className="h-6 w-6" />,
    title: "Fresh Ingredients",
    description:
      "Sourced daily from local organic farms to ensure the best taste.",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Fast Delivery",
    description: "Hot and fresh food delivered to your doorstep in 30 minutes.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Hygienic Kitchen",
    description: "Highest standards of cleanliness and food safety protocols.",
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Made with Love",
    description: "Our chefs put passion and care into every single dish.",
  },
];

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

        // Request location permission on load if not already saved
        if (!localStorage.getItem("customer_address")) {
          requestLocation();
        }
      } catch (error) {
        console.error("Error loading home data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const requestLocation = () => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            );
            const data = await response.json();
            if (data.display_name) {
              localStorage.setItem("customer_address", data.display_name);
            }
          } catch (error) {
            console.error("Error fetching address on home:", error);
          }
        },
        (error) => {
          console.error("Geolocation error on home:", error);
        },
        { enableHighAccuracy: true },
      );
    }
  };

  if (loading || !restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/20">
      <Header restaurant={restaurant} />

      <main className="flex-grow">
        <Hero restaurant={restaurant} />

        <div className="container mx-auto px-4 md:px-8 py-20 space-y-32">
          {/* Features Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 rounded-3xl bg-card border border-primary/5 hover:border-primary/20 hover:bg-primary/[0.02] transition-all duration-500 text-center"
              >
                <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/10 text-primary mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </section>

          <OffersCarousel items={offers} title="Special Offers" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <OffersCarousel items={todaysSpecial} title="Today's Specials" />
            <OffersCarousel items={whatsNew} title="What's New" />
          </div>

          <MenuSection />
        </div>
      </main>

      <footer
        id="contact"
        className="relative mt-20 pt-20 pb-10 bg-card border-t border-primary/5 overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        <div className="container px-4 md:px-8 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            <div className="space-y-6">
              <h2 className="text-3xl font-headline font-bold text-primary">
                {restaurant.name}
              </h2>
              <p className="text-muted-foreground max-w-xs mb-6">
                {restaurant.tagline}
              </p>
              <div className="space-y-3 pt-4 border-t border-primary/5">
                <p className="flex items-center gap-3 text-sm text-foreground/70">
                  <MapPin size={18} className="text-primary" />
                  {restaurant.address}
                </p>
                <p className="flex items-center gap-3 text-sm text-foreground/70">
                  <Phone size={18} className="text-primary" />
                  {restaurant.phone}
                </p>
                <p className="flex items-center gap-3 text-sm text-foreground/70">
                  <Mail size={18} className="text-primary" />
                  {restaurant.email}
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-widest text-foreground/50">
                Quick Links
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="#menu"
                    className="hover:text-primary transition-colors"
                  >
                    Our Menu
                  </Link>
                </li>

                <li>
                  <Link
                    href="#contact"
                    className="hover:text-primary transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-widest text-foreground/50">
                Admin
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/admin"
                    className="text-xs opacity-50 hover:opacity-100 transition-opacity"
                  >
                    Cloud Kitchen Admin
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-primary/5 text-center">
            <p className="text-sm text-muted-foreground italic">
              &copy; {new Date().getFullYear()} {restaurant.name}. Crafted with
              passion for premium takeaway and express delivery.
            </p>
            <p className="text-[10px] text-muted-foreground/30 mt-2 uppercase tracking-widest">
              Version {version}
            </p>
          </div>
        </div>
      </footer>

      <CartButton />
    </div>
  );
}
