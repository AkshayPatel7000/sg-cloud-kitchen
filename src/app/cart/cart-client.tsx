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
  MapPin,
  Loader2,
  Phone,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { VegNonVegIcon } from "@/components/veg-non-veg-icon";
import { sendCartViaWhatsApp } from "@/lib/whatsapp";
import type { Restaurant } from "@/lib/types";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  trackViewCart,
  trackBeginCheckout,
  trackPurchase,
  trackRemoveFromCart,
} from "@/lib/analytics";
import { logErrorToFirestore } from "@/lib/error-logger";
import packageInfo from "../../../package.json";

const version = packageInfo.version;

export function CartPageClient({ restaurant }: { restaurant: Restaurant }) {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    itemCount,
    applyCoupon,
    removeCoupon,
    appliedCoupon,
  } = useCart();
  const { toast } = useToast();

  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"whatsapp" | "online">(
    "whatsapp",
  );

  // Load saved details from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("customer_name");
    const savedPhone = localStorage.getItem("customer_phone");
    const savedAddress = localStorage.getItem("customer_address");
    if (savedName) setUserName(savedName);
    if (savedPhone) setUserPhone(savedPhone);
    if (savedAddress) setUserAddress(savedAddress);

    // Only request location if address is empty
    if (!savedAddress) {
      handleAutoLocation();
    }

    // Track cart view when page loads (only if cart has items)
    if (cart.items.length > 0) {
      trackViewCart({
        itemCount: cart.items.length,
        total: cart.total,
        items: cart.items.map((item) => ({
          id: item.dish.id,
          name: item.dish.name,
          price: item.price,
          quantity: item.quantity,
        })),
      });
    }
  }, []); // Only run once on mount

  const handleAutoLocation = () => {
    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Use free Nominatim API for reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          );
          const data = await response.json();
          if (data.display_name) {
            setUserAddress(data.display_name);
            toast({
              title: "Location Detected",
              description: "Your delivery address has been auto-filled.",
            });
          }
        } catch (error) {
          console.error("Error fetching address:", error);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
      { enableHighAccuracy: true },
    );
  };

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
      // Track begin checkout when user clicks "Proceed to Checkout"
      trackBeginCheckout({
        total: cart.total,
        itemCount: cart.items.length,
        items: cart.items.map((item) => ({
          id: item.dish.id,
          name: item.dish.name,
          price: item.price,
          quantity: item.quantity,
          category: item.dish.categoryId,
        })),
      });

      setShowNameInput(true);
      // Scroll to bottom after state update to show inputs
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
      return;
    }

    if (!userName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to proceed.",
        variant: "destructive",
      });
      return;
    }

    if (!userPhone.trim()) {
      toast({
        title: "Mobile Number Required",
        description: "Please enter your mobile number to proceed.",
        variant: "destructive",
      });
      return;
    }

    // Indian Mobile number validation (10 digits starting with 6-9)
    const phoneRegex = /^[6-9][0-9]{9}$/;
    if (!phoneRegex.test(userPhone.trim())) {
      toast({
        title: "Invalid Mobile Number",
        description:
          "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9.",
        variant: "destructive",
      });
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
        customerPhone: userPhone || null,
        customerAddress: userAddress || null,
        items: cart.items.map((item) => {
          // Calculate original price before dish discount
          const variant = item.variantId
            ? item.dish.variants?.find((v) => v.id === item.variantId)
            : undefined;
          const baseOriginalPrice = variant ? variant.price : item.dish.price;
          const customizationsPrice =
            item.selectedCustomizations?.reduce((sum, c) => sum + c.price, 0) ||
            0;
          const originalPrice = baseOriginalPrice + customizationsPrice;

          return {
            dishId: item.dish.id,
            dishName: item.dish.name,
            quantity: item.quantity,
            price: item.price,
            originalPrice: originalPrice !== item.price ? originalPrice : null,
            dishDiscountType: item.dish.discountType || null,
            dishDiscountValue: item.dish.discountValue || null,
            isVeg: item.dish.isVeg,
            variantId: item.variantId || null,
            variantName: item.variantName || null,
            selectedCustomizations: item.selectedCustomizations || null,
            notes: item.notes || null,
          };
        }),
        subtotal: cart.subtotal,
        discount: cart.discount || 0,
        discountType: cart.discountType || null,
        discountValue: cart.discountValue || null,
        couponCode: cart.couponCode || null,
        tax: cart.tax,
        total: cart.total,
        status: paymentMode === "online" ? "payment_pending" : "pending",
        orderType: "delivery",
        notes: "Order placed via Customer Web",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: "customer", // Mark as customer order
        isPaid: false,
        isViewed: false,
        paymentMethod: paymentMode === "online" ? "online" : "cash",
      };

      // Utility to recursively remove undefined values (Firestore doesn't allow them)
      const cleanObject = (obj: any): any => {
        if (obj === null || typeof obj !== "object") return obj;
        if (obj instanceof Date) return obj;
        if (Array.isArray(obj)) return obj.map(cleanObject);

        // Special handling for Firestore FieldValue (like serverTimestamp)
        if (obj._methodName || obj.constructor?.name === "FieldValue")
          return obj;

        const result: any = {};
        Object.keys(obj).forEach((key) => {
          const value = obj[key];
          if (value === undefined) {
            result[key] = null;
          } else if (typeof value === "object" && value !== null) {
            result[key] = cleanObject(value);
          } else {
            result[key] = value;
          }
        });
        return result;
      };

      const cleanedOrderData = cleanObject(orderData);
      console.log("Preparing to create order in Firestore:", cleanedOrderData);

      const docRef = await addDoc(collection(db, "orders"), cleanedOrderData);
      console.log("Order created successfully with ID:", docRef.id);

      // Handle Online Payment via PhonePe
      if (paymentMode === "online") {
        try {
          const payResp = await fetch("/api/payment/initiate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: cart.total,
              phone: userPhone,
              orderId: docRef.id,
              userId: auth.currentUser?.uid || "guest_" + Date.now(),
            }),
          });
          const payData = await payResp.json();
          if (payData.url) {
            window.location.href = payData.url;
            return; // Stop here, user is being redirected
          } else {
            throw new Error(payData.error || "Payment initiation failed");
          }
        } catch (payError) {
          console.error("Payment Error:", payError);
          toast({
            title: "Payment Error",
            description:
              "Failed to start online payment. Please try WhatsApp checkout instead.",
            variant: "destructive",
          });
          setIsCreatingOrder(false);
          return;
        }
      }

      // Save to localStorage for future orders
      localStorage.setItem("customer_name", userName);
      localStorage.setItem("customer_phone", userPhone);
      localStorage.setItem("customer_address", userAddress);

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
        logErrorToFirestore(notiError as Error, undefined, {
          context: "Checkout Notification",
          orderNumber,
        });
      }

      toast({
        title: "Order Created",
        description: `Order ${orderNumber} has been created successfully!`,
      });

      // Track purchase event
      trackPurchase({
        orderId: orderNumber,
        total: cart.total,
        tax: cart.tax,
        discount: cart.discount || 0,
        items: cart.items.map((item) => ({
          id: item.dish.id,
          name: item.dish.name,
          price: item.price,
          quantity: item.quantity,
          category: item.dish.categoryId,
        })),
      });

      // Send via WhatsApp
      sendCartViaWhatsApp(
        cart,
        whatsappNumber,
        userName || undefined,
        userPhone || undefined,
        userAddress || undefined,
        orderNumber,
      );

      // Clear cart after successful order creation
      setTimeout(() => {
        clearCart();
      }, 1000);
    } catch (error) {
      console.error("Error creating order:", error);
      logErrorToFirestore(error as Error, undefined, {
        context: "Create Order Firestore",
        userName,
        userPhone,
      });
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h1 className="text-2xl md:text-3xl font-bold">
                Your Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
              </h1>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCart}
                className="text-destructive w-full sm:w-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Cart
              </Button>
            </div>

            <div className="space-y-4">
              {cart.items.map((item, index) => {
                const hasDishDiscount =
                  item.dish.discountType &&
                  item.dish.discountValue &&
                  item.dish.discountType !== "none";

                return (
                  <Card
                    key={`${item.dish.id}-${item.variantId || "default"}-${index}`}
                  >
                    <CardContent className="p-4">
                      <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[128px_1fr] gap-x-4">
                        <div className="relative h-20 w-20 sm:h-32 sm:w-32 flex-shrink-0 overflow-hidden rounded-md">
                          <Image
                            src={sanitizeImageUrl(item.dish.imageUrl, "dish")}
                            alt={item.dish.name}
                            fill
                            sizes="(max-width: 640px) 80px, 128px"
                            className="object-cover"
                          />
                          {hasDishDiscount && (
                            <div className="absolute top-0 left-0 z-5">
                              <div className="bg-destructive text-destructive-foreground text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-br-lg shadow-sm">
                                {item.dish.discountType === "percentage"
                                  ? `${item.dish.discountValue}% OFF`
                                  : `₹${item.dish.discountValue} OFF`}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-base sm:text-lg flex flex-wrap items-center gap-1.5 break-words">
                                {item.dish.name}
                                {item.variantName && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] h-5 px-1.5 whitespace-nowrap"
                                  >
                                    {item.variantName}
                                  </Badge>
                                )}
                              </h3>
                              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
                                {item.dish.description}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                // Track remove from cart
                                trackRemoveFromCart({
                                  id: item.dish.id,
                                  name: item.dish.name,
                                  category: item.dish.categoryId,
                                  price: item.price,
                                  quantity: item.quantity,
                                });

                                const key =
                                  item.selectedCustomizations
                                    ?.map((c) => c.optionId)
                                    .sort()
                                    .join(",") || "";
                                removeFromCart(
                                  item.dish.id,
                                  item.variantId,
                                  key,
                                );
                              }}
                              className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="hidden sm:block">
                            {item.selectedCustomizations &&
                              item.selectedCustomizations.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.selectedCustomizations.map((c, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground border shrink-0"
                                    >
                                      {c.optionName}
                                    </span>
                                  ))}
                                </div>
                              )}
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              <VegNonVegIcon isVeg={item.dish.isVeg} />
                              {item.dish.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0 h-4"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="col-span-2 sm:col-start-2 flex justify-between items-center mt-3 sm:mt-4 pt-3 sm:pt-0 border-t sm:border-0">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8"
                              onClick={() => {
                                const key =
                                  item.selectedCustomizations
                                    ?.map((c) => c.optionId)
                                    .sort()
                                    .join(",") || "";
                                updateQuantity(
                                  item.dish.id,
                                  item.quantity - 1,
                                  item.variantId,
                                  key,
                                );
                              }}
                            >
                              <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                            <span className="font-medium text-sm sm:text-base w-8 text-center text-primary">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8"
                              disabled={item.quantity >= 10}
                              onClick={() => {
                                const key =
                                  item.selectedCustomizations
                                    ?.map((c) => c.optionId)
                                    .sort()
                                    .join(",") || "";
                                updateQuantity(
                                  item.dish.id,
                                  item.quantity + 1,
                                  item.variantId,
                                  key,
                                );
                              }}
                            >
                              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                          <div className="text-right">
                            {(() => {
                              // Calculate original price
                              const variant = item.variantId
                                ? item.dish.variants?.find(
                                    (v) => v.id === item.variantId,
                                  )
                                : undefined;
                              const baseOriginalPrice = variant
                                ? variant.price
                                : item.dish.price;
                              const customizationsPrice =
                                item.selectedCustomizations?.reduce(
                                  (sum, c) => sum + c.price,
                                  0,
                                ) || 0;
                              const originalPrice =
                                baseOriginalPrice + customizationsPrice;
                              const hasDiscount = originalPrice > item.price;

                              return (
                                <>
                                  {hasDiscount && (
                                    <p className="text-[10px] sm:text-xs text-muted-foreground line-through">
                                      Rs.{originalPrice.toLocaleString()}
                                    </p>
                                  )}
                                  <p className="text-sm sm:text-lg font-bold text-primary">
                                    Rs.
                                    {(
                                      item.price * item.quantity
                                    ).toLocaleString()}
                                  </p>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
                      Rs.{cart.subtotal.toLocaleString()}
                    </span>
                  </div>
                  {cart.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="flex items-center gap-1">
                        Discount
                        {cart.couponCode && (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-4 px-1 text-green-600 border-green-600"
                          >
                            {cart.couponCode}
                          </Badge>
                        )}
                      </span>
                      <span className="font-medium">
                        -Rs.{cart.discount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {cart.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Tax (GST 5%)
                      </span>
                      <span className="font-medium">
                        Rs.{cart.tax.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-primary">
                      Rs.{cart.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* {!appliedCoupon ? (
                  <div className="space-y-2">
                    <Label htmlFor="coupon" className="text-xs">
                      Have a coupon?
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="coupon"
                        placeholder="e.g. SAVE20"
                        value={couponInput}
                        onChange={(e) =>
                          setCouponInput(e.target.value.toUpperCase())
                        }
                        className="h-8 text-sm"
                      />
                      <Button
                        size="sm"
                        className="h-8"
                        onClick={async () => {
                          if (!couponInput.trim()) return;
                          setIsApplyingCoupon(true);
                          const result = await applyCoupon(couponInput);
                          setIsApplyingCoupon(false);
                          if (result.success) {
                            setCouponInput("");
                            toast({ title: result.message });
                          } else {
                            toast({
                              title: result.message,
                              variant: "destructive",
                            });
                          }
                        }}
                        disabled={isApplyingCoupon || !couponInput.trim()}
                      >
                        {isApplyingCoupon ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-green-600 font-medium">
                        Coupon Applied
                      </span>
                      <span className="text-sm font-bold text-green-700">
                        {appliedCoupon.couponCode}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeCoupon}
                      className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                )} */}

                <Separator />

                {/* Breakdown Details */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Items Breakdown</h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {cart.items.map((item, index) => {
                      return (
                        <div
                          key={`${item.dish.id}-${item.variantId || "default"}-${index}`}
                          className="flex justify-between gap-4 py-0.5"
                        >
                          <span className="flex-1 break-words">
                            {item.dish.name}
                            {item.variantName ? ` (${item.variantName})` : ""}
                            {item.selectedCustomizations &&
                            item.selectedCustomizations.length > 0
                              ? ` [${item.selectedCustomizations.map((c) => c.optionName).join(", ")}]`
                              : ""}{" "}
                            {item.notes ? ` (Note: ${item.notes})` : ""} ×{" "}
                            {item.quantity}
                          </span>
                          <span className="shrink-0 font-medium">
                            Rs.{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Name & Phone & Address Input (conditional) */}
                {showNameInput && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="userName">
                        Your Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="userName"
                        placeholder="Enter your name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userPhone">
                        Mobile Number{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="userPhone"
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={userPhone}
                        onChange={(e) => {
                          const val = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                          setUserPhone(val);
                        }}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="userAddress">
                          Delivery Address{" "}
                          <span className="text-muted-foreground text-[10px] font-normal">
                            (Optional)
                          </span>
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[10px] gap-1 hover:text-primary"
                          onClick={handleAutoLocation}
                          type="button"
                        >
                          <MapPin className="h-3 w-3" />
                          Detect Location
                        </Button>
                      </div>
                      <div className="relative">
                        <Input
                          id="userAddress"
                          placeholder="Enter your delivery address"
                          value={userAddress}
                          onChange={(e) => setUserAddress(e.target.value)}
                          className="pr-10"
                        />
                        {userAddress && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <MapPin className="h-4 w-4 text-primary opacity-50" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t border-dashed">
                  <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Select Payment Method
                  </Label>
                  <RadioGroup
                    value={paymentMode}
                    onValueChange={(v: any) => setPaymentMode(v)}
                    className="grid grid-cols-1 gap-3"
                  >
                    <div
                      className={`relative flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${paymentMode === "online" ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"}`}
                      onClick={() => setPaymentMode("online")}
                    >
                      <RadioGroupItem
                        value="online"
                        id="online"
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3 w-full">
                        <div
                          className={`p-2 rounded-full ${paymentMode === "online" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                        >
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <Label
                            htmlFor="online"
                            className="font-bold cursor-pointer"
                          >
                            Pay with PhonePe
                          </Label>
                          <p className="text-[10px] text-muted-foreground">
                            UPI, Credit/Debit Card, Wallets
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`relative flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${paymentMode === "whatsapp" ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"}`}
                      onClick={() => setPaymentMode("whatsapp")}
                    >
                      <RadioGroupItem
                        value="whatsapp"
                        id="whatsapp"
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3 w-full">
                        <div
                          className={`p-2 rounded-full ${paymentMode === "whatsapp" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                        >
                          <MessageCircle className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <Label
                            htmlFor="whatsapp"
                            className="font-bold cursor-pointer"
                          >
                            Order via WhatsApp
                          </Label>
                          <p className="text-[10px] text-muted-foreground">
                            Pay with Cash/UPI on Delivery
                          </p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={isCreatingOrder}
                  >
                    {isCreatingOrder ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Order...
                      </>
                    ) : (
                      <>
                        {paymentMode === "online" ? (
                          <CreditCard className="mr-2 h-5 w-5" />
                        ) : (
                          <MessageCircle className="mr-2 h-5 w-5" />
                        )}
                        {showNameInput
                          ? paymentMode === "online"
                            ? "Pay with PhonePe"
                            : "Order via WhatsApp"
                          : "Proceed to Checkout"}
                      </>
                    )}
                  </Button>
                  <div className="flex items-center justify-center">
                    <div className="w-1/2 border-t border-muted-foreground"></div>
                    <span className="mx-2 text-muted-foreground">OR</span>
                    <div className="w-1/2 border-t border-muted-foreground"></div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary/5"
                    size="lg"
                    onClick={() => {
                      if (restaurant.phone) {
                        window.location.href = `tel:${restaurant.phone}`;
                      }
                    }}
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    Order on Call
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Your order will be sent to {restaurant.name} via WhatsApp
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <footer className="py-2 absolute w-full">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[10px] text-muted-foreground/30 mt-2 uppercase tracking-widest">
            Version {version}
          </p>
        </div>
      </footer>
    </div>
  );
}
