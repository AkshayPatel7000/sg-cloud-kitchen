"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Phone } from "lucide-react";
import { Logo } from "./logo";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Restaurant } from "@/lib/types";

const navLinks = [
  { href: "#menu", label: "Menu" },
  { href: "#offers", label: "Offers" },
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

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled ? "bg-card/80 backdrop-blur-sm shadow-md" : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Logo
            logoUrl={restaurant?.logoUrl}
            restaurantName={restaurant?.name}
          />
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Button
              onClick={() => window.open(`tel:${restaurant?.phone || ""}`)}
            >
              <Phone className="mr-2 h-4 w-4" />
              Call Now
            </Button>
          </nav>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-6 p-6">
                  <Logo
                    logoUrl={restaurant?.logoUrl}
                    restaurantName={restaurant?.name}
                  />
                  <nav className="flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-lg font-medium text-foreground/80 transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                  <Button size="lg" className="w-full">
                    <Phone className="mr-2 h-4 w-4" />
                    Call Now
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
