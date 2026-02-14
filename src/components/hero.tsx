"use client";

import type { Restaurant } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Menu,
  PhoneCall,
  ChevronDown,
} from "lucide-react";

export function Hero({ restaurant }: { restaurant: Restaurant }) {
  const heroImage = PlaceHolderImages.find((img) => img.id === "hero");

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerHeight = 70; // Height of fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="relative h-[90vh] min-h-[600px] w-full overflow-hidden bg-background">
      {/* Background Image with Parallax-like effect */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
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
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent md:bg-gradient-to-r md:from-black/70 md:via-black/30 md:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </motion.div>

      <div className="container relative z-10 mx-auto flex h-full flex-col items-start justify-center px-4 md:px-8">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest uppercase bg-primary/20 text-primary border border-primary/30 rounded-full backdrop-blur-md">
              Welcome to Excellence
            </span>
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.1]">
              {restaurant.name}
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 max-w-xl text-lg md:text-xl text-white/80 leading-relaxed font-light"
          >
            {restaurant.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Button
              size="lg"
              className="h-14 px-8 text-lg rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              onClick={() => scrollToSection("menu")}
            >
              <Menu className="mr-2 h-5 w-5" />
              Explore Menu
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg rounded-full bg-white/5 backdrop-blur-md border-white/20 text-white hover:bg-white/10 hover:text-white transition-all hover:scale-105 active:scale-95"
              onClick={() => {
                window.open(`tel:${restaurant.phone}`);
              }}
            >
              <PhoneCall className="mr-2 h-5 w-5" />
              Order on Call
            </Button>
          </motion.div>
        </div>

        {/* Floating Contact Info card for Desktop */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-6 p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
        >
          <div className="flex items-center gap-4 text-white/90 group cursor-pointer hover:text-primary transition-colors">
            <div className="p-3 rounded-full bg-primary/20 border border-primary/30 group-hover:bg-primary group-hover:text-white transition-all">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider font-bold">
                Location
              </p>
              <p className="text-sm font-medium">{restaurant.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-white/90 group cursor-pointer hover:text-primary transition-colors">
            <div className="p-3 rounded-full bg-primary/20 border border-primary/30 group-hover:bg-primary group-hover:text-white transition-all">
              <Phone size={20} />
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider font-bold">
                Contact
              </p>
              <p className="text-sm font-medium">{restaurant.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-white/90 group cursor-pointer hover:text-primary transition-colors">
            <div className="p-3 rounded-full bg-primary/20 border border-primary/30 group-hover:bg-primary group-hover:text-white transition-all">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider font-bold">
                Email
              </p>
              <p className="text-sm font-medium">{restaurant.email}</p>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-white/10 flex justify-center gap-6">
            {restaurant.socialLinks.facebook && (
              <a
                href={restaurant.socialLinks.facebook}
                className="text-white/40 hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook size={20} />
              </a>
            )}
            {restaurant.socialLinks.instagram && (
              <a
                href={restaurant.socialLinks.instagram}
                className="text-white/40 hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram size={20} />
              </a>
            )}
            {restaurant.socialLinks.twitter && (
              <a
                href={restaurant.socialLinks.twitter}
                className="text-white/40 hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter size={20} />
              </a>
            )}
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2 cursor-pointer"
        onClick={() => scrollToSection("menu")}
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">
          Scroll
        </span>
        <ChevronDown className="text-white/40" size={24} />
      </motion.div>
    </section>
  );
}
