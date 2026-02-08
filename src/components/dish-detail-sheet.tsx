"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import type { Dish } from "@/lib/types";
import { Badge } from "./ui/badge";
import Image from "next/image";
import { sanitizeImageUrl } from "@/lib/image-utils";
import { VegNonVegIcon } from "./veg-non-veg-icon";
import { X } from "lucide-react";

interface DishDetailSheetProps {
  dish: Dish | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (
    variantId?: string,
    selectedCustomizations?: any[],
    notes?: string,
  ) => void;
}

export function DishDetailSheet({
  dish,
  open,
  onOpenChange,
  onConfirm,
}: DishDetailSheetProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<
    string | undefined
  >();
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && dish) {
      setSelectedVariantId(dish.variants?.[0]?.id);
      const initialSelections: Record<string, string[]> = {};
      dish.customizations?.forEach((group) => {
        initialSelections[group.id] = [];
      });
      setSelections(initialSelections);
      setNotes("");
      setError(null);
    }
  }, [open, dish]);

  if (!dish) return null;

  const handleToggleOption = (
    groupId: string,
    optionId: string,
    maxSelection: number,
  ) => {
    setSelections((prev) => {
      const current = prev[groupId] || [];
      if (current.includes(optionId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
      }
      if (maxSelection === 1) {
        return { ...prev, [groupId]: [optionId] };
      }
      if (current.length < maxSelection) {
        return { ...prev, [groupId]: [...current, optionId] };
      }
      return prev;
    });
  };

  const handleConfirm = () => {
    // Validate min selections
    for (const group of dish.customizations || []) {
      const groupSelections = selections[group.id] || [];
      if (groupSelections.length < group.minSelection) {
        setError(
          `Please select at least ${group.minSelection} option(s) for ${group.name}`,
        );
        return;
      }
    }

    const formattedCustomizations = [];
    for (const group of dish.customizations || []) {
      const groupSelections = selections[group.id] || [];
      for (const optionId of groupSelections) {
        const option = group.options.find((o) => o.id === optionId);
        if (option) {
          formattedCustomizations.push({
            groupId: group.id,
            groupName: group.name,
            optionId: option.id,
            optionName: option.name,
            price: option.price,
          });
        }
      }
    }

    onConfirm(selectedVariantId, formattedCustomizations, notes);
    onOpenChange(false);
  };

  const currentPrice = () => {
    let total = 0;
    if (dish.variants && dish.variants.length > 0) {
      const variant = dish.variants.find((v) => v.id === selectedVariantId);
      total += variant?.price || 0;
    } else {
      total += dish.price;
    }

    // Apply dish-level discount
    if (
      dish.discountType &&
      dish.discountValue &&
      dish.discountType !== "none"
    ) {
      if (dish.discountType === "percentage") {
        total = total - (total * dish.discountValue) / 100;
      } else if (dish.discountType === "fixed") {
        total = Math.max(0, total - dish.discountValue);
      }
      // Round to whole number
      total = Math.round(total);
    }

    Object.entries(selections).forEach(([groupId, optionIds]) => {
      const group = dish.customizations?.find((g) => g.id === groupId);
      optionIds.forEach((id) => {
        const option = group?.options.find((o) => o.id === id);
        total += option?.price || 0;
      });
    });

    return total;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        onPointerDownOutside={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
        className="h-[90vh] sm:h-[85vh] p-0 overflow-hidden flex flex-col rounded-t-[2rem] border-none sm:max-w-[1000px] sm:mx-auto sm:left-1/2 sm:-translate-x-1/2"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{dish.name}</SheetTitle>
          <SheetDescription>{dish.description}</SheetDescription>
        </SheetHeader>
        <div className="flex-grow overflow-y-auto sm:grid sm:grid-cols-2 sm:gap-0">
          {/* Left Column: Image (Desktop only / Top on Mobile) */}
          <div className="relative aspect-[4/3] w-full sm:h-full sm:aspect-auto">
            <Image
              src={sanitizeImageUrl(dish.imageUrl, "dish")}
              alt={dish.name}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <div className="flex items-center gap-2 mb-3">
                <VegNonVegIcon isVeg={dish.isVeg} />
                <Badge
                  variant="outline"
                  className="text-white border-white/40 bg-white/10 backdrop-blur-md px-3 py-1"
                >
                  {dish.isVeg ? "Veg" : "Non-Veg"}
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                {dish.name}
              </h1>
            </div>
          </div>

          {/* Right Column: Configuration */}
          <div className="p-6 sm:p-10 space-y-8 h-full overflow-y-auto">
            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                About this dish
              </h3>
              <p className="text-base text-balance leading-relaxed">
                {dish.description}
              </p>

              {/* Discount Badge */}
              {dish.discountType &&
                dish.discountValue &&
                dish.discountType !== "none" && (
                  <div className="flex items-center gap-2 pt-2">
                    <Badge variant="destructive" className="text-sm px-3 py-1">
                      {dish.discountType === "percentage"
                        ? `${dish.discountValue}% OFF`
                        : `₹${dish.discountValue} OFF`}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Special discount applied!
                    </span>
                  </div>
                )}
            </div>

            {/* Variants */}
            {dish.variants && dish.variants.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-bold">
                    Select Size / Option
                  </Label>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    Required
                  </Badge>
                </div>
                <RadioGroup
                  value={selectedVariantId}
                  onValueChange={setSelectedVariantId}
                  className="grid gap-3"
                >
                  {dish.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className={`flex items-center space-x-3 border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                        selectedVariantId === variant.id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/40"
                      }`}
                      onClick={() => setSelectedVariantId(variant.id)}
                    >
                      <RadioGroupItem
                        value={variant.id}
                        id={variant.id}
                        className="text-primary"
                      />
                      <Label
                        htmlFor={variant.id}
                        className="flex-grow font-semibold cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {variant.name}
                      </Label>
                      {(() => {
                        const hasDiscount =
                          dish.discountType &&
                          dish.discountValue &&
                          dish.discountType !== "none";
                        let discountedPrice = variant.price;

                        if (hasDiscount) {
                          if (dish.discountType === "percentage") {
                            discountedPrice =
                              variant.price -
                              (variant.price * (dish.discountValue || 0)) / 100;
                          } else if (dish.discountType === "fixed") {
                            discountedPrice = Math.max(
                              0,
                              variant.price - (dish.discountValue || 0),
                            );
                          }
                          // Round to whole number
                          discountedPrice = Math.round(discountedPrice);
                        }

                        return hasDiscount ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">
                              Rs.{discountedPrice.toLocaleString()}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              Rs.{variant.price.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-primary">
                            Rs.{variant.price.toLocaleString()}
                          </span>
                        );
                      })()}
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Customizations */}
            {dish.customizations?.map((group) => (
              <div key={group.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-lg font-bold">{group.name}</Label>
                    <p className="text-xs text-muted-foreground">
                      {group.minSelection > 0
                        ? `Select minimum ${group.minSelection}`
                        : `Select up to ${group.maxSelection}`}
                    </p>
                  </div>
                  {group.minSelection > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary"
                    >
                      Required
                    </Badge>
                  )}
                </div>

                <div className="grid gap-3">
                  {group.options.map((option) => {
                    const isChecked = selections[group.id]?.includes(option.id);
                    return (
                      <div
                        key={option.id}
                        className={`flex items-center space-x-3 border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                          isChecked
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/40"
                        }`}
                        onClick={() =>
                          handleToggleOption(
                            group.id,
                            option.id,
                            group.maxSelection,
                          )
                        }
                      >
                        <Checkbox
                          checked={isChecked}
                          id={option.id}
                          className="data-[state=checked]:bg-primary"
                        />
                        <Label
                          htmlFor={option.id}
                          className="flex-grow font-semibold cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {option.name}
                        </Label>
                        {option.price > 0 && (
                          <span className="text-sm font-medium text-muted-foreground">
                            + Rs.{option.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <Separator />

            {/* Special Instructions */}
            <div className="space-y-3">
              <Label htmlFor="notes" className="text-lg font-bold">
                Special Instructions
              </Label>
              <Textarea
                id="notes"
                placeholder="E.g. Make it extra spicy / No onions"
                className="min-h-[100px] rounded-xl focus:ring-primary border-border resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <p className="text-xs text-muted-foreground italic">
                Note: We'll do our best to follow your instructions.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="absolute bottom-[100px] left-6 right-6 z-50 animate-in slide-in-from-bottom-4">
            <p className="text-sm text-destructive bg-destructive/10 backdrop-blur-md p-3 rounded-xl font-medium border border-destructive/20 text-center">
              {error}
            </p>
          </div>
        )}

        {/* Premium Footer with Sticky Button */}
        <div className="sticky bottom-0 left-0 right-0 p-6 sm:px-10 sm:pb-8 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-md z-50">
          <div className="sm:max-w-2xl sm:mx-auto">
            <Button
              className="w-full h-14 sm:h-16 text-lg sm:text-xl font-bold rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(220,104,50,0.3)] transition-all duration-500 bg-primary group relative overflow-hidden active:scale-[0.98]"
              onClick={(e) => {
                e.stopPropagation();
                handleConfirm();
              }}
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="flex items-center justify-between w-full px-4 sm:px-8 relative z-10">
                <span className="tracking-tight">Add to Checkout</span>
                <div className="flex items-center gap-3">
                  <Separator
                    orientation="vertical"
                    className="h-6 bg-white/30"
                  />
                  <span className="text-2xl font-extrabold tracking-tighter">
                    Rs.{currentPrice().toFixed(0)}
                  </span>
                </div>
              </div>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
