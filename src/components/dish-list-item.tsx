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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export function DishListItem({ dish }: { dish: Dish }) {
  const { addToCart, cart, isHydrated } = useCart();
  const [showVariants, setShowVariants] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isInCart = cart.items.some((item) => item.dish.id === dish.id);

  const handleAddToCart = (variantId?: string) => {
    if (dish.variants && dish.variants.length > 0 && !variantId) {
      setShowVariants(true);
      return;
    }
    addToCart(dish, variantId);
    setJustAdded(true);
    setShowVariants(false);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="flex items-start gap-4 py-4">
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
        <Image
          src={sanitizeImageUrl(dish.imageUrl, "dish")}
          alt={dish.name}
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-grow">
            <h4 className="font-semibold text-base">{dish.name}</h4>
            <p className="text-base font-bold text-primary mt-1">
              {dish.variants && dish.variants.length > 0
                ? `Starts Rs.${Math.min(...dish.variants.map((v) => v.price)).toFixed(2)}`
                : `Rs.${dish.price.toFixed(2)}`}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => handleAddToCart()}
            className="flex-shrink-0"
            variant={isInCart || justAdded ? "secondary" : "default"}
            disabled={!isHydrated}
          >
            {isInCart || justAdded ? (
              <>
                <Check className="mr-1 h-4 w-4" />
                {dish.variants && dish.variants.length > 0 ? "Added" : "Added"}
              </>
            ) : (
              <>
                <Plus className="mr-1 h-4 w-4" />
                Add
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{dish.description}</p>
        <div className="mt-2 flex items-center gap-4">
          <VegNonVegIcon isVeg={dish.isVeg} />
          {dish.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dish.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={tag === "bestseller" ? "default" : "secondary"}
                  className="bg-accent text-accent-foreground text-xs"
                >
                  {tag === "spicy" && <Flame className="mr-1 h-3 w-3" />}
                  {tag === "bestseller" && <Star className="mr-1 h-3 w-3" />}
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <Dialog open={showVariants} onOpenChange={setShowVariants}>
          <DialogContent className="max-w-[90vw] sm:max-w-md rounded-t-2xl sm:rounded-lg">
            <DialogHeader>
              <DialogTitle>Select Variant</DialogTitle>
              <DialogDescription>
                Choose an option for {dish.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              {dish.variants?.map((variant) => (
                <Button
                  key={variant.id}
                  variant="outline"
                  className="flex justify-between items-center h-16 px-4"
                  onClick={() => handleAddToCart(variant.id)}
                >
                  <span className="font-semibold text-base">
                    {variant.name}
                  </span>
                  <span className="text-primary font-bold">
                    Rs.{variant.price.toFixed(2)}
                  </span>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
