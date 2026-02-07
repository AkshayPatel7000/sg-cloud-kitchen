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

export function DishListItem({ dish }: { dish: Dish }) {
  const { addToCart, cart, isHydrated } = useCart();
  const [showDetail, setShowDetail] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isInCart = cart.items.some((item) => item.dish.id === dish.id);

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

    addToCart(dish, variantId, 1, selectedCustomizations, notes);
    setJustAdded(true);
    setShowDetail(false);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div
      className="flex items-start gap-4 py-6 group cursor-pointer"
      onClick={() => setShowDetail(true)}
    >
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5 group-hover:shadow-md transition-shadow duration-300">
        <Image
          src={sanitizeImageUrl(dish.imageUrl, "dish")}
          alt={dish.name}
          fill
          sizes="96px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <VegNonVegIcon isVeg={dish.isVeg} />
              <h4 className="font-bold text-lg leading-none">{dish.name}</h4>
            </div>
            <p className="text-base font-extrabold text-primary mt-1.5">
              {dish.variants && dish.variants.length > 0
                ? `Starts Rs.${Math.min(...dish.variants.map((v) => v.price)).toFixed(2)}`
                : `Rs.${dish.price.toFixed(2)}`}
            </p>
          </div>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className="flex-shrink-0 rounded-lg h-9 px-4 font-bold shadow-sm"
            variant={isInCart || justAdded ? "secondary" : "default"}
            disabled={!isHydrated}
          >
            {isInCart || justAdded ? (
              <>
                <Check className="mr-1.5 h-4 w-4 stroke-[3px]" />
                Added
              </>
            ) : (
              <>
                <Plus className="mr-1.5 h-4 w-4 stroke-[3px]" />
                Add
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
          {dish.description}
        </p>
        {dish.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
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
        <DishDetailSheet
          dish={dish}
          open={showDetail}
          onOpenChange={setShowDetail}
          onConfirm={handleAddToCart}
        />
      </div>
    </div>
  );
}
