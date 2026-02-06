"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Trash2, ArrowLeft, Save, Percent } from "lucide-react";
import Link from "next/link";
import type { Dish, OrderItem, Order, Restaurant } from "@/lib/types";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { sanitizeImageUrl } from "@/lib/image-utils";
import { getRestaurant } from "@/lib/data-client";
import { useNotification } from "@/contexts/notification-context";

const TAX_RATE = 0.05;

export default function EditOrderPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState<
    "dine-in" | "takeaway" | "delivery"
  >("dine-in");
  const [tableNumber, setTableNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage",
  );
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [discountValue, setDiscountValue] = useState<string>("");
  const [selectedDishForVariants, setSelectedDishForVariants] =
    useState<Dish | null>(null);

  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { stopRinging } = useNotification();

  useEffect(() => {
    if (orderId) {
      fetchOrderAndDishes();
      fetchRestaurantDetails();
      // Stop notification ringing when editing an order
      stopRinging();
    }
  }, [orderId, stopRinging]);

  const fetchRestaurantDetails = async () => {
    try {
      const data = await getRestaurant();
      setRestaurant(data);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
    }
  };

  const fetchOrderAndDishes = async () => {
    try {
      // Fetch order
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);

      if (!orderSnap.exists()) {
        toast({
          title: "Error",
          description: "Order not found",
          variant: "destructive",
        });
        router.push("/admin/orders");
        return;
      }

      const data = orderSnap.data();
      const orderData = {
        id: orderSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Order;

      setOrder(orderData);
      setOrderItems(orderData.items);
      setCustomerName(orderData.customerName || "");
      setCustomerPhone(orderData.customerPhone || "");
      setOrderType(orderData.orderType);
      setTableNumber(orderData.tableNumber || "");
      setNotes(orderData.notes || "");

      // Mark as viewed if not already viewed
      if (!data.isViewed) {
        updateDoc(orderRef, {
          isViewed: true,
          updatedAt: new Date(),
        }).catch((err) => console.error("Error marking order as viewed:", err));
      }

      // Set discount values if they exist
      if (orderData.discount && orderData.discount > 0) {
        setDiscountType(orderData.discountType || "percentage");
        setDiscountValue(orderData.discountValue?.toString() || "");
      }

      // Fetch dishes
      const dishesRef = collection(db, "dishes");
      const querySnapshot = await getDocs(dishesRef);
      const fetchedDishes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Dish[];
      setDishes(fetchedDishes.filter((d) => d.isAvailable));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load order data",
        variant: "destructive",
      });
    } finally {
      setIsFetchingData(false);
    }
  };

  const addDishToOrder = (dish: Dish, variant?: any) => {
    // If dish has variants and none is selected, don't add yet
    if (dish.variants && dish.variants.length > 0 && !variant) {
      setSelectedDishForVariants(dish);
      return;
    }

    const existingItem = orderItems.find(
      (item) => item.dishId === dish.id && item.variantId === variant?.id,
    );

    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.dishId === dish.id && item.variantId === variant?.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setOrderItems([
        ...orderItems,
        {
          dishId: dish.id,
          dishName: dish.name,
          quantity: 1,
          price: variant ? variant.price : dish.price,
          isVeg: dish.isVeg,
          variantId: variant?.id,
          variantName: variant?.name,
        },
      ]);
    }

    if (selectedDishForVariants) {
      setSelectedDishForVariants(null);
    }
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }
    setOrderItems(
      orderItems.map((item, i) => (i === index ? { ...item, quantity } : item)),
    );
  };

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Calculate discount
    let discountAmount = 0;
    const discountNum = parseFloat(discountValue) || 0;

    if (discountNum > 0) {
      if (discountType === "percentage") {
        const percentage = Math.min(discountNum, 100);
        discountAmount = (subtotal * percentage) / 100;
      } else {
        discountAmount = Math.min(discountNum, subtotal);
      }
    }

    const afterDiscount = subtotal - discountAmount;

    // Calculate tax only if GST is enabled and GST number is provided
    let tax = 0;
    if (restaurant?.isGstEnabled && restaurant?.gstNumber) {
      tax = afterDiscount * TAX_RATE;
    }

    const total = afterDiscount + tax;

    return { subtotal, discount: discountAmount, afterDiscount, tax, total };
  };

  const handleSubmit = async () => {
    if (orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the order",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update an order",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { subtotal, discount, afterDiscount, tax, total } =
        calculateTotals();

      const orderData = {
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        items: orderItems,
        subtotal,
        discount: discount || 0,
        discountType: discount > 0 ? discountType : null,
        discountValue: discount > 0 ? parseFloat(discountValue) : null,
        tax,
        total,
        orderType,
        tableNumber: orderType === "dine-in" ? tableNumber : null,
        notes: notes || null,
        updatedAt: serverTimestamp(),
      };

      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, orderData);

      toast({
        title: "Success",
        description: `Order ${order?.orderNumber} updated successfully`,
      });

      router.push(`/admin/orders/${orderId}`);
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDishes = dishes.filter((dish) =>
    dish.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const { subtotal, discount, afterDiscount, tax, total } = calculateTotals();

  if (isFetchingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/orders/${orderId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Order {order.orderNumber}</h1>
          <p className="text-muted-foreground">
            Modify order details and items
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Dish Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Dishes</CardTitle>
              <Input
                placeholder="Search dishes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
                {filteredDishes.map((dish) => {
                  const itemCount = orderItems
                    .filter((item) => item.dishId === dish.id)
                    .reduce((sum, item) => sum + item.quantity, 0);
                  const isSelected = itemCount > 0;

                  return (
                    <Card
                      key={dish.id}
                      className={`cursor-pointer hover:shadow-md transition-all ${
                        isSelected
                          ? "border-2 border-green-500 bg-green-50 dark:bg-green-950/20"
                          : "border"
                      }`}
                      onClick={() => addDishToOrder(dish)}
                    >
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          <div className="relative h-16 w-16 flex-shrink-0 rounded overflow-hidden">
                            <Image
                              src={sanitizeImageUrl(dish.imageUrl, "dish")}
                              alt={dish.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                            {isSelected && (
                              <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold rounded-bl px-1.5 py-0.5">
                                {itemCount}
                              </div>
                            )}
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-sm">
                                {dish.name}
                              </h4>
                              {isSelected && (
                                <Badge
                                  variant="default"
                                  className="bg-green-500 hover:bg-green-600 text-xs"
                                >
                                  ✓ Added
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {dish.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant={
                                  dish.isVeg ? "secondary" : "destructive"
                                }
                                className="text-xs"
                              >
                                {dish.isVeg ? "🟢 Veg" : "🔴 Non-Veg"}
                              </Badge>
                              <span className="text-sm font-bold text-primary">
                                {dish.variants && dish.variants.length > 0
                                  ? `Starts Rs.${Math.min(...dish.variants.map((v) => v.price)).toFixed(2)}`
                                  : `Rs.${dish.price.toFixed(2)}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Variant Selection Dialog */}
        <Dialog
          open={!!selectedDishForVariants}
          onOpenChange={(open: boolean) =>
            !open && setSelectedDishForVariants(null)
          }
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Select Variant</DialogTitle>
              <DialogDescription>
                Choose a size or option for {selectedDishForVariants?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {selectedDishForVariants?.variants?.map((variant) => (
                <Button
                  key={variant.id}
                  variant="outline"
                  className="flex justify-between items-center h-14"
                  onClick={() =>
                    addDishToOrder(selectedDishForVariants, variant)
                  }
                >
                  <span className="font-semibold">{variant.name}</span>
                  <span className="text-primary">
                    Rs.{variant.price.toFixed(2)}
                  </span>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Right: Order Summary */}
        <div className="space-y-4">
          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name (Optional)</Label>
                <Input
                  id="customerName"
                  placeholder="Enter name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone Number (Optional)</Label>
                <Input
                  id="customerPhone"
                  placeholder="Enter phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderType">Order Type</Label>
                <Select
                  value={orderType}
                  onValueChange={(value: any) => setOrderType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dine-in">Dine In</SelectItem>
                    <SelectItem value="takeaway">Takeaway</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {orderType === "dine-in" && (
                <div className="space-y-2">
                  <Label htmlFor="tableNumber">Table Number</Label>
                  <Input
                    id="tableNumber"
                    placeholder="e.g., T-01"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Special Instructions</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items ({orderItems.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {orderItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No items added yet
                </p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {orderItems.map((item, index) => (
                    <div
                      key={`${item.dishId}-${item.variantId || "default"}-${index}`}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex-grow">
                        <p className="font-medium text-sm">
                          {item.dishName}
                          {item.variantName && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({item.variantName})
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Rs.{item.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateQuantity(index, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateQuantity(index, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              {/* Bill Summary */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">Rs.{subtotal.toFixed(2)}</span>
                </div>

                {/* Discount Section */}
                <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                  <Label className="text-xs font-semibold flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    Apply Discount (Optional)
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={discountType}
                      onValueChange={(value: any) => setDiscountType(value)}
                    >
                      <SelectTrigger className="w-[110px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">%</SelectItem>
                        <SelectItem value="fixed">Rs.</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder={
                        discountType === "percentage" ? "0-100" : "Amount"
                      }
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="h-9"
                      min="0"
                      max={discountType === "percentage" ? "100" : undefined}
                    />
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-xs text-green-600 dark:text-green-400 font-medium">
                      <span>Discount Applied:</span>
                      <span>- Rs.{discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      After Discount
                    </span>
                    <span className="font-medium">
                      Rs.{afterDiscount.toFixed(2)}
                    </span>
                  </div>
                )}

                {tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (GST 5%)</span>
                    <span className="font-medium">Rs.{tax.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">Rs.{total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={isLoading || orderItems.length === 0}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Update Order
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
