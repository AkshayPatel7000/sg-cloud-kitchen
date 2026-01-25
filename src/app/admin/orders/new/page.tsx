"use client";

import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Trash2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Dish, OrderItem } from "@/lib/types";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { sanitizeImageUrl } from "@/lib/image-utils";

const TAX_RATE = 0.05;

export default function NewOrderPage() {
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
  const [isFetchingDishes, setIsFetchingDishes] = useState(true);

  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      const dishesRef = collection(db, "dishes");
      const querySnapshot = await getDocs(dishesRef);
      const fetchedDishes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Dish[];
      setDishes(fetchedDishes.filter((d) => d.isAvailable));
    } catch (error) {
      console.error("Error fetching dishes:", error);
      toast({
        title: "Error",
        description: "Failed to load dishes",
        variant: "destructive",
      });
    } finally {
      setIsFetchingDishes(false);
    }
  };

  const addDishToOrder = (dish: Dish) => {
    const existingItem = orderItems.find((item) => item.dishId === dish.id);

    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.dishId === dish.id
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
          price: dish.price,
          isVeg: dish.isVeg,
        },
      ]);
    }
  };

  const updateQuantity = (dishId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(dishId);
      return;
    }
    setOrderItems(
      orderItems.map((item) =>
        item.dishId === dishId ? { ...item, quantity } : item,
      ),
    );
  };

  const removeItem = (dishId: string) => {
    setOrderItems(orderItems.filter((item) => item.dishId !== dishId));
  };

  const calculateTotals = () => {
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const generateOrderNumber = async () => {
    const ordersRef = collection(db, "orders");
    const snapshot = await getDocs(ordersRef);
    const orderCount = snapshot.size + 1;
    return `ORD-${String(orderCount).padStart(4, "0")}`;
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
        description: "You must be logged in to create an order",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { subtotal, tax, total } = calculateTotals();
      const orderNumber = await generateOrderNumber();

      const orderData = {
        orderNumber,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        items: orderItems,
        subtotal,
        tax,
        total,
        status: "pending",
        orderType,
        tableNumber: orderType === "dine-in" ? tableNumber : null,
        notes: notes || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user.uid,
        isPaid: false,
        paymentMethod: null,
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);

      toast({
        title: "Success",
        description: `Order ${orderNumber} created successfully`,
      });

      router.push(`/admin/orders/${docRef.id}`);
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDishes = dishes.filter((dish) =>
    dish.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New Order</h1>
          <p className="text-muted-foreground">
            Add items and customer details
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
              {isFetchingDishes ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
                  {filteredDishes.map((dish) => (
                    <Card
                      key={dish.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
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
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-semibold text-sm">
                              {dish.name}
                            </h4>
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
                                ₹{dish.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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
                  {orderItems.map((item) => (
                    <div
                      key={item.dishId}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex-grow">
                        <p className="font-medium text-sm">{item.dishName}</p>
                        <p className="text-xs text-muted-foreground">
                          ₹{item.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateQuantity(item.dishId, item.quantity - 1)
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
                            updateQuantity(item.dishId, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeItem(item.dishId)}
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
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (GST 5%)</span>
                  <span className="font-medium">₹{tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toFixed(2)}</span>
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
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Create Order
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
