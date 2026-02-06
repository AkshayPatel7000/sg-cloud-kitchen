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

export function DishListItem({ dish }: { dish: Dish }) {
  const { addToCart, cart, isHydrated } = useCart();
  const [showConfig, setShowConfig] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isInCart = cart.items.some((item) => item.dish.id === dish.id);

  const handleAddToCart = (
    variantId?: string,
    selectedCustomizations?: any[],
  ) => {
    const hasOptions =
      (dish.variants && dish.variants.length > 0) ||
      (dish.customizations && dish.customizations.length > 0);

    if (hasOptions && !variantId && !selectedCustomizations) {
      setShowConfig(true);
      return;
    }

    addToCart(dish, variantId, 1, selectedCustomizations);
    setJustAdded(true);
    setShowConfig(false);
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
        <DishConfigDialog
          dish={dish}
          open={showConfig}
          onOpenChange={setShowConfig}
          onConfirm={handleAddToCart}
        />
      </div>
    </div>
  );
}
