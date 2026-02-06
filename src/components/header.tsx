"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Phone,
  ShoppingBag,
  MapPin,
  Mail,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { Logo } from "./logo";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Restaurant } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "#menu", label: "Menu" },
  // { href: "#offers", label: "Offers" },
  { href: "#contact", label: "Contact" },
  // { href: '/admin', label: 'Admin' },
];

export function Header({ restaurant }: { restaurant: Restaurant | null }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      const headerHeight = isScrolled ? 70 : 90; // Approximate height based on padding
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
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        isScrolled
          ? "bg-background/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-primary/5 py-3"
          : "bg-transparent py-5",
      )}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo
              logoUrl={restaurant?.logoUrl}
              restaurantName={restaurant?.name}
            />
            <nav className="hidden items-center gap-8 md:flex">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index + 0.5 }}
                >
                  <Link
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="group relative text-sm font-medium transition-colors hover:text-primary"
                  >
                    <span
                      className={cn(
                        "transition-colors",
                        isScrolled
                          ? "text-foreground/70"
                          : "text-white/80 group-hover:text-white",
                      )}
                    >
                      {link.label}
                    </span>
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
                  </Link>
                </motion.div>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="hidden sm:block"
            >
              <Button
                variant={isScrolled ? "default" : "outline"}
                className={cn(
                  "rounded-full px-6 transition-all duration-300",
                  !isScrolled &&
                    "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-md",
                )}
                onClick={() => window.open(`tel:${restaurant?.phone || ""}`)}
              >
                <Phone className="mr-2 h-4 w-4" />
                Call Now
              </Button>
            </motion.div>

            <div className="md:hidden flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "rounded-full",
                      !isScrolled && "text-white hover:bg-white/10",
                    )}
                  >
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col gap-10 p-6 pt-12">
                    <Logo
                      logoUrl={restaurant?.logoUrl}
                      restaurantName={restaurant?.name}
                    />
                    <nav className="flex flex-col gap-6">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={(e) => scrollToSection(e, link.href)}
                          className="text-2xl font-semibold text-foreground/80 transition-colors hover:text-primary"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </nav>
                    <div className="pt-8 border-t space-y-8">
                      <div className="space-y-6">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          Contact Info
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-start gap-4 text-foreground/80">
                            <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <p className="text-sm">{restaurant?.address}</p>
                          </div>
                          <div className="flex items-center gap-4 text-foreground/80">
                            <Phone className="h-5 w-5 text-primary shrink-0" />
                            <p className="text-sm">{restaurant?.phone}</p>
                          </div>
                          <div className="flex items-center gap-4 text-foreground/80">
                            <Mail className="h-5 w-5 text-primary shrink-0" />
                            <p className="text-sm">{restaurant?.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          Follow Us
                        </h4>
                        <div className="flex gap-4">
                          {restaurant?.socialLinks.facebook && (
                            <a
                              href={restaurant.socialLinks.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                            >
                              <Facebook size={20} />
                            </a>
                          )}
                          {restaurant?.socialLinks.instagram && (
                            <a
                              href={restaurant.socialLinks.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                            >
                              <Instagram size={20} />
                            </a>
                          )}
                          {restaurant?.socialLinks.twitter && (
                            <a
                              href={restaurant.socialLinks.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                            >
                              <Twitter size={20} />
                            </a>
                          )}
                        </div>
                      </div>

                      <Button
                        size="lg"
                        className="w-full rounded-full text-lg h-14"
                        onClick={() =>
                          window.open(`tel:${restaurant?.phone || ""}`)
                        }
                      >
                        <Phone className="mr-2 h-5 w-5" />
                        Call Now
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
