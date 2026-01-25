"use client";

import { useCart } from "@/contexts/cart-context";
import { Button } from "./ui/button";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import Image from "next/image";
import { sanitizeImageUrl } from "@/lib/image-utils";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { useRouter } from "next/navigation";

export function CartButton() {
  const { cart, itemCount, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        >
          <ShoppingCart className="h-6 w-6" />
          {itemCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center"
            >
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
          </SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-4">
          {cart.items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add some delicious items to get started!
              </p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item.dish.id}
                    className="flex gap-4 p-4 border rounded-lg relative"
                  >
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={sanitizeImageUrl(item.dish.imageUrl, "dish")}
                        alt={item.dish.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-sm">
                        {item.dish.name}
                      </h4>
                      <p className="text-sm text-primary font-bold mt-1">
                        Rs.{item.dish.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateQuantity(item.dish.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateQuantity(item.dish.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeFromCart(item.dish.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <p className="text-sm font-bold">
                        Rs.{(item.dish.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Bill Summary */}
              <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    Rs.{cart.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (5%)</span>
                  <span className="font-medium">Rs.{cart.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    Rs.{cart.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  router.push("/cart");
                }}
              >
                View Full Cart & Checkout
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
