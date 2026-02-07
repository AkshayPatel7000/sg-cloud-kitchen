"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import type {
  Dish,
  DishVariant,
  CustomizationGroup,
  CustomizationOption,
} from "@/lib/types";
import { Badge } from "./ui/badge";

interface DishConfigDialogProps {
  dish: Dish | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (
    variantId?: string,
    selectedCustomizations?: any[],
    notes?: string,
  ) => void;
  initialVariantId?: string;
  initialSelections?: Record<string, string[]>;
  initialNotes?: string;
}

export function DishConfigDialog({
  dish,
  open,
  onOpenChange,
  onConfirm,
  initialVariantId,
  initialSelections: providedInitialSelections,
  initialNotes,
}: DishConfigDialogProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<
    string | undefined
  >();
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && dish) {
      setSelectedVariantId(initialVariantId || dish.variants?.[0]?.id);

      if (providedInitialSelections) {
        setSelections(providedInitialSelections);
      } else {
        const initialSelections: Record<string, string[]> = {};
        dish.customizations?.forEach((group) => {
          initialSelections[group.id] = [];
        });
        setSelections(initialSelections);
      }
      setNotes(initialNotes || "");
      setError(null);
    }
  }, [open, dish, initialVariantId, providedInitialSelections, initialNotes]);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-xl p-0 gap-0">
        <div className="p-6 pb-4">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-bold">{dish.name}</DialogTitle>
            <DialogDescription className="text-sm line-clamp-2">
              {dish.description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-2 space-y-6">
          {/* Variants */}
          {dish.variants && dish.variants.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold">
                  Select Size / Option
                </Label>
                <Badge variant="secondary" className="text-[10px] uppercase">
                  Required
                </Badge>
              </div>
              <RadioGroup
                value={selectedVariantId}
                onValueChange={setSelectedVariantId}
                className="grid gap-2"
              >
                {dish.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedVariantId(variant.id)}
                  >
                    <RadioGroupItem value={variant.id} id={variant.id} />
                    <Label
                      htmlFor={variant.id}
                      className="flex-grow font-medium cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {variant.name}
                    </Label>
                    <span className="text-sm font-bold text-primary">
                      Rs.{variant.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Customizations */}
          {dish.customizations?.map((group) => (
            <div key={group.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">{group.name}</Label>
                  <p className="text-[10px] text-muted-foreground">
                    {group.minSelection > 0
                      ? `Select minimum ${group.minSelection}`
                      : `Select up to ${group.maxSelection}`}
                  </p>
                </div>
                {group.minSelection > 0 && (
                  <Badge variant="secondary" className="text-[10px] uppercase">
                    Required
                  </Badge>
                )}
              </div>

              <div className="grid gap-2">
                {group.options.map((option) => {
                  const isChecked = selections[group.id]?.includes(option.id);
                  return (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() =>
                        handleToggleOption(
                          group.id,
                          option.id,
                          group.maxSelection,
                        )
                      }
                    >
                      <Checkbox checked={isChecked} id={option.id} />
                      <Label
                        htmlFor={option.id}
                        className="flex-grow font-medium cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {option.name}
                      </Label>
                      {option.price > 0 && (
                        <span className="text-xs text-muted-foreground">
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

          {/* Notes */}
          <div className="space-y-3">
            <Label className="text-sm font-bold">Special Instructions</Label>
            <Textarea
              placeholder="E.g. Make it extra spicy / No onions"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="px-6 py-2">
            <p className="text-xs text-destructive bg-destructive/10 p-2 rounded-md font-medium">
              {error}
            </p>
          </div>
        )}

        <div className="p-6 sticky bottom-0 bg-background border-t mt-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <Button
            className="w-full h-12 text-base font-bold"
            onClick={handleConfirm}
          >
            Update Cart • Rs.{currentPrice().toFixed(2)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
