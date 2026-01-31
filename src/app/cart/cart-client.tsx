"use client";

import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { sanitizeImageUrl } from "@/lib/image-utils";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { VegNonVegIcon } from "@/components/veg-non-veg-icon";
import { sendCartViaWhatsApp } from "@/lib/whatsapp";
import type { Restaurant } from "@/lib/types";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export function CartPageClient({ restaurant }: { restaurant: Restaurant }) {
  const { cart, updateQuantity, removeFromCart, clearCart, itemCount } =
    useCart();
  const [userName, setUserName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const { toast } = useToast();

  const generateOrderNumber = () => {
    // Generate order number using timestamp + random suffix
    // Format: ORD-YYYYMMDD-HHMMSS-XXX
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
    const timePart = now.toTimeString().slice(0, 8).replace(/:/g, "");
    const randomSuffix = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `ORD-${datePart}-${timePart}-${randomSuffix}`;
  };

  const handleCheckout = async () => {
    if (!showNameInput) {
      setShowNameInput(true);
      return;
    }

    // Use restaurant's WhatsApp number or fallback to phone
    const whatsappNumber =
      restaurant.whatsappNumber || restaurant.phone.replace(/[^0-9]/g, "");

    if (!whatsappNumber) {
      toast({
        title: "Error",
        description:
          "Restaurant WhatsApp number not configured. Please contact the restaurant directly.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingOrder(true);

    try {
      // Create order in Firestore
      const orderNumber = generateOrderNumber();

      const orderData = {
        orderNumber,
        customerName: userName || "Customer",
        customerPhone: null,
        items: cart.items.map((item) => ({
          dishId: item.dish.id,
          dishName: item.dish.name,
          quantity: item.quantity,
          price: item.dish.price,
          isVeg: item.dish.isVeg,
        })),
        subtotal: cart.subtotal,
        discount: 0,
        tax: cart.tax,
        total: cart.total,
        status: "pending",
        orderType: "delivery",
        notes: "Order placed via WhatsApp",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: "customer", // Mark as customer order
        isPaid: false,
        paymentMethod: null,
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      console.log("Order created successfully with ID:", docRef.id);

      // Send notification to admin
      try {
        // Fetch admin token on client side to avoid server-side quota issues
        const { getAdmins } = await import("@/lib/data-client");
        const admins = await getAdmins();
        const adminToken = admins.find((a) => a.fcmToken)?.fcmToken;

        await fetch("/api/notifications/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderDetails: {
              id: docRef.id,
              orderNumber: orderNumber,
              total: cart.total,
            },
            fcmToken: adminToken, // Pass the token directly
          }),
        });
      } catch (notiError) {
        console.error("Failed to send notification:", notiError);
      }

      toast({
        title: "Order Created",
        description: `Order ${orderNumber} has been created successfully!`,
      });

      // Send via WhatsApp
      sendCartViaWhatsApp(
        cart,
        whatsappNumber,
        userName || undefined,
        orderNumber,
      );

      // Clear cart after successful order creation
      setTimeout(() => {
        clearCart();
      }, 1000);
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Menu
              </Button>
            </Link>
          </div>
        </header>
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Add some delicious items from our menu!
            </p>
            <Link href="/">
              <Button size="lg">Browse Menu</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Menu
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">
                Your Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
              </h1>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCart}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Cart
              </Button>
            </div>

            <div className="space-y-4">
              {cart.items.map((item) => (
                <Card key={item.dish.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={sanitizeImageUrl(item.dish.imageUrl, "dish")}
                          alt={item.dish.name}
                          fill
                          sizes="(max-width: 640px) 96px, 128px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {item.dish.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.dish.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <VegNonVegIcon isVeg={item.dish.isVeg} />
                              {item.dish.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.dish.id)}
                            className="flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateQuantity(item.dish.id, item.quantity - 1)
                              }
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-medium w-12 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateQuantity(item.dish.id, item.quantity + 1)
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              Rs.{item.dish.price.toFixed(2)} × {item.quantity}
                            </p>
                            <p className="text-lg font-bold text-primary">
                              Rs.{(item.dish.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Bill Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Bill Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"}
                      )
                    </span>
                    <span className="font-medium">
                      Rs.{cart.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (GST 5%)</span>
                    <span className="font-medium">
                      Rs.{cart.tax.toFixed(2)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-primary">
                      Rs.{cart.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Breakdown Details */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Items Breakdown</h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {cart.items.map((item) => (
                      <div key={item.dish.id} className="flex justify-between">
                        <span>
                          {item.dish.name} × {item.quantity}
                        </span>
                        <span>
                          Rs.{(item.dish.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Name Input (conditional) */}
                {showNameInput && (
                  <div className="space-y-2">
                    <Label htmlFor="userName">Your Name (Optional)</Label>
                    <Input
                      id="userName"
                      placeholder="Enter your name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      autoFocus
                    />
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isCreatingOrder}
                >
                  {isCreatingOrder ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="mr-2 h-5 w-5" />
                      {showNameInput
                        ? "Send Order via WhatsApp"
                        : "Proceed to Checkout"}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Your order will be sent to {restaurant.name} via WhatsApp
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
