"use client";

import Image from "next/image";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { VegNonVegIcon } from "./veg-non-veg-icon";
import { Flame, Star, Plus, Check } from "lucide-react";
import type { Dish } from "@/lib/types";
import { sanitizeImageUrl } from "@/lib/image-utils";
import { useCart } from "@/contexts/cart-context";
import { useState } from "react";
import { DishConfigDialog } from "./dish-config-dialog";
import { DishDetailSheet } from "./dish-detail-sheet";
import { trackMenuItemView, trackAddToCart } from "@/lib/analytics";

export function DishListItem({ dish }: { dish: Dish }) {
  const { addToCart, cart, isHydrated } = useCart();
  const [showDetail, setShowDetail] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isInCart = cart.items.some((item) => item.dish.id === dish.id);
  const hasDiscount =
    dish.discountType && dish.discountValue && dish.discountType !== "none";

  const handleAddToCart = (
    variantId?: string,
    selectedCustomizations?: any[],
    notes?: string,
  ) => {
    const hasOptions =
      (dish.variants && dish.variants.length > 0) ||
      (dish.customizations && dish.customizations.length > 0);

    if (hasOptions && !variantId && !selectedCustomizations) {
      setShowDetail(true);
      return;
    }

    // Calculate the actual price for tracking
    let actualPrice = dish.price;
    let variantName = undefined;

    if (variantId && dish.variants) {
      const variant = dish.variants.find((v) => v.id === variantId);
      if (variant) {
        actualPrice = variant.price;
        variantName = variant.name;
      }
    }

    // Apply discount if exists
    if (hasDiscount) {
      if (dish.discountType === "percentage") {
        actualPrice = actualPrice - (actualPrice * dish.discountValue!) / 100;
      } else if (dish.discountType === "fixed") {
        actualPrice = Math.max(0, actualPrice - dish.discountValue!);
      }
      actualPrice = Math.round(actualPrice);
    }

    // Track add to cart event
    trackAddToCart({
      id: dish.id,
      name: dish.name,
      category: dish.categoryId,
      price: actualPrice,
      isVeg: dish.isVeg,
      quantity: 1,
      variantName,
    });

    addToCart(dish, variantId, 1, selectedCustomizations, notes);
    setJustAdded(true);
    setShowDetail(false);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div
      className="grid grid-cols-[1fr_110px] sm:grid-cols-[1fr_140px] gap-4 sm:gap-8 py-8 first:pt-4 group cursor-pointer border-b last:border-0"
      onClick={() => {
        // Track menu item view
        trackMenuItemView({
          id: dish.id,
          name: dish.name,
          category: dish.categoryId,
          price: dish.price,
          isVeg: dish.isVeg,
        });
        setShowDetail(true);
      }}
    >
      <div className="flex flex-col">
        <div className="flex items-start gap-2 mb-1">
          <div className="pt-1">
            <VegNonVegIcon isVeg={dish.isVeg} />
          </div>
          <h4 className="font-bold text-base sm:text-xl group-hover:text-primary transition-colors">
            {dish.name}
          </h4>
        </div>

        {(() => {
          const basePrice =
            dish.variants && dish.variants.length > 0
              ? Math.min(...dish.variants.map((v) => v.price))
              : dish.price;

          let discountedPrice = basePrice;

          if (hasDiscount) {
            if (dish.discountType === "percentage") {
              discountedPrice =
                basePrice - (basePrice * (dish.discountValue || 0)) / 100;
            } else if (dish.discountType === "fixed") {
              discountedPrice = Math.max(
                0,
                basePrice - (dish.discountValue || 0),
              );
            }
            discountedPrice = Math.round(discountedPrice);
          }

          return (
            <div className="flex items-center gap-2 mb-2">
              <p className="text-base sm:text-lg font-bold text-foreground/90">
                {dish.variants && dish.variants.length > 0
                  ? "Starts Rs."
                  : "Rs."}
                {discountedPrice.toLocaleString()}
              </p>
              {hasDiscount && (
                <p className="text-xs sm:text-sm text-muted-foreground line-through">
                  Rs.{basePrice.toLocaleString()}
                </p>
              )}
            </div>
          );
        })()}

        <div className="relative group/desc">
          <p
            className={`text-sm text-muted-foreground leading-relaxed pr-2 sm:pr-0 transition-all duration-300 ${
              !isExpanded ? "line-clamp-2" : ""
            }`}
          >
            {dish.description}
          </p>
          {dish.description && dish.description.length > 80 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-primary text-[10px] font-extrabold uppercase tracking-wider mt-1 hover:underline focus:outline-none"
            >
              {isExpanded ? "Read Less" : "Read More"}
            </button>
          )}
        </div>

        {dish.tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2">
            {dish.tags.map((tag) => (
              <Badge
                key={tag}
                variant={tag === "bestseller" ? "default" : "secondary"}
                className={`${tag === "bestseller" ? "bg-primary/10 text-primary border-primary/20" : "bg-accent/50 text-accent-foreground"} text-[10px] font-bold uppercase tracking-wider px-2 py-0.5`}
              >
                {tag === "spicy" && <Flame className="mr-1 h-3 w-3" />}
                {tag === "bestseller" && (
                  <Star className="mr-1 h-3 w-3 fill-current" />
                )}
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="relative flex flex-col items-center self-start">
        <div className="relative h-28 w-28 sm:h-36 sm:w-36 overflow-hidden rounded-2xl shadow-md ring-1 ring-black/5 group-hover:shadow-lg transition-all duration-300">
          <Image
            src={sanitizeImageUrl(dish.imageUrl, "dish")}
            alt={dish.name}
            fill
            sizes="(max-width: 640px) 112px, 144px"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
          {hasDiscount && (
            <div className="absolute top-0 left-0 z-10">
              <div className="bg-destructive text-destructive-foreground text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-br-lg shadow-sm">
                {dish.discountType === "percentage"
                  ? `${dish.discountValue}% OFF`
                  : `₹${dish.discountValue} OFF`}
              </div>
            </div>
          )}
        </div>

        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-full flex justify-center px-4">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className=" sm:w-[90%] max-w-[120px] h-9 sm:h-10 rounded-lg font-bold shadow-lg border-2 border-background animate-in fade-in zoom-in duration-300"
            variant={isInCart || justAdded ? "secondary" : "default"}
            disabled={!isHydrated}
          >
            {isInCart || justAdded ? (
              <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Check className="h-4 w-4 stroke-[3px]" />
                <span>ADDED</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs sm:text-sm ">
                <Plus className="h-4 w-4 stroke-[3px]" />
                <span>ADD</span>
              </div>
            )}
          </Button>
        </div>
      </div>

      <DishDetailSheet
        dish={dish}
        open={showDetail}
        onOpenChange={setShowDetail}
        onConfirm={handleAddToCart}
      />
    </div>
  );
}
