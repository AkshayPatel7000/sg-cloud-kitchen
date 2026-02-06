"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Printer,
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  User,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Calendar,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import type { Order, OrderStatus, Restaurant } from "@/lib/types";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { getRestaurant } from "@/lib/data-client";
import { useNotification } from "@/contexts/notification-context";

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: any;
    color: string;
  }
> = {
  pending: {
    label: "Pending",
    variant: "outline",
    icon: Clock,
    color: "text-yellow-600",
  },
  preparing: {
    label: "Preparing",
    variant: "default",
    icon: ChefHat,
    color: "text-blue-600",
  },
  ready: {
    label: "Ready",
    variant: "secondary",
    icon: CheckCircle2,
    color: "text-green-600",
  },
  completed: {
    label: "Completed",
    variant: "secondary",
    icon: CheckCircle2,
    color: "text-green-700",
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive",
    icon: XCircle,
    color: "text-red-600",
  },
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { stopRinging } = useNotification();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
      fetchRestaurantDetails();
      // Stop notification ringing when an order is viewed
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

  const fetchOrder = async () => {
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        const data = orderSnap.data();
        const orderData = {
          id: orderSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Order;
        setOrder(orderData);

        // Mark as viewed if not already viewed
        if (!data.isViewed) {
          updateDoc(orderRef, {
            isViewed: true,
            updatedAt: new Date(),
          }).catch((err) =>
            console.error("Error marking order as viewed:", err),
          );
        }
      } else {
        toast({
          title: "Error",
          description: "Order not found",
          variant: "destructive",
        });
        router.push("/admin/orders");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast({
        title: "Error",
        description: "Failed to load order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: OrderStatus) => {
    if (!order) return;

    setIsUpdating(true);
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date(),
      });

      setOrder({ ...order, status: newStatus, updatedAt: new Date() });

      toast({
        title: "Success",
        description: `Order status updated to ${statusConfig[newStatus].label}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const togglePaymentStatus = async () => {
    if (!order) return;

    setIsUpdating(true);
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        isPaid: !order.isPaid,
        updatedAt: new Date(),
      });

      setOrder({ ...order, isPaid: !order.isPaid, updatedAt: new Date() });

      toast({
        title: "Success",
        description: order.isPaid ? "Marked as unpaid" : "Marked as paid",
      });
    } catch (error) {
      console.error("Error updating payment:", error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const updatePaymentMethod = async (method: string) => {
    if (!order) return;

    setIsUpdating(true);
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        paymentMethod: method,
        updatedAt: new Date(),
      });

      setOrder({
        ...order,
        paymentMethod: method as any,
        updatedAt: new Date(),
      });

      toast({
        title: "Success",
        description: "Payment method updated",
      });
    } catch (error) {
      console.error("Error updating payment method:", error);
      toast({
        title: "Error",
        description: "Failed to update payment method",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteOrder = async () => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await deleteDoc(orderRef);

      toast({
        title: "Success",
        description: "Order deleted successfully",
      });

      router.push("/admin/orders");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
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

  const StatusIcon = statusConfig[order.status].icon;

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{order.orderNumber}</h1>
            <p className="text-muted-foreground">
              Created {format(order.createdAt, "PPp")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/orders/${orderId}/kot`}>
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print KOT
            </Button>
          </Link>
          <Link href={`/admin/orders/${orderId}/bill`}>
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print Bill
            </Button>
          </Link>
          <Link href={`/admin/orders/${orderId}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Order
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Order?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  order.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={deleteOrder}
                  className="bg-destructive text-destructive-foreground"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatusIcon
                  className={`h-5 w-5 ${statusConfig[order.status].color}`}
                />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge
                  variant={statusConfig[order.status].variant}
                  className="text-base px-4 py-2"
                >
                  {statusConfig[order.status].label}
                </Badge>
                <Select
                  value={order.status}
                  onValueChange={(value: OrderStatus) =>
                    updateOrderStatus(value)
                  }
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Order Type:</span>
                  <p className="font-medium capitalize">
                    {order.orderType.replace("-", " ")}
                  </p>
                </div>
                {order.tableNumber && (
                  <div>
                    <span className="text-muted-foreground">Table:</span>
                    <p className="font-medium">{order.tableNumber}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p className="font-medium">
                    {format(order.createdAt, "PPp")}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Updated:</span>
                  <p className="font-medium">
                    {format(order.updatedAt, "PPp")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Details */}
          {(order.customerName || order.customerPhone) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.customerName && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{order.customerName}</span>
                  </div>
                )}
                {order.customerPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{order.customerPhone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items ({order.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start p-3 border rounded-lg"
                  >
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">
                          {item.dishName}
                          {item.variantName && (
                            <span className="ml-1 text-xs text-muted-foreground font-normal">
                              ({item.variantName})
                            </span>
                          )}
                        </h4>
                        <Badge
                          variant={item.isVeg ? "secondary" : "destructive"}
                          className="text-xs"
                        >
                          {item.isVeg ? "🟢" : "🔴"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Rs.{item.price.toFixed(2)} × {item.quantity}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        Rs.{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {order.notes && (
                <>
                  <Separator className="my-4" />
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">
                        Special Instructions:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.notes}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Bill Summary & Payment */}
        <div className="space-y-6">
          {/* Bill Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Bill Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    Rs.{order.subtotal.toFixed(2)}
                  </span>
                </div>
                {/* Discount Display */}
                {!!order.discount && order.discount > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span className="flex items-center gap-1">
                        Discount
                        {order.discountType && order.discountValue && (
                          <span className="text-xs">
                            (
                            {order.discountType === "percentage"
                              ? `${order.discountValue}%`
                              : `Rs.${order.discountValue.toFixed(2)}`}
                            )
                          </span>
                        )}
                      </span>
                      <span className="font-medium">
                        - Rs.{order.discount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        After Discount
                      </span>
                      <span className="font-medium">
                        Rs.{(order.subtotal - order.discount).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}

                {order.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (GST 5%)</span>
                    <span className="font-medium">
                      Rs.{order.tax.toFixed(2)}
                    </span>
                  </div>
                )}
                {order.tax > 0 && restaurant?.gstNumber && (
                  <div className="flex justify-between text-[10px] text-muted-foreground italic">
                    <span>GSTIN: {restaurant.gstNumber}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    Rs.{order.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Items Breakdown */}
              <div className="space-y-1">
                <p className="text-sm font-medium">Items Breakdown:</p>
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-xs text-muted-foreground"
                  >
                    <span>
                      {item.dishName}
                      {item.variantName ? ` (${item.variantName})` : ""} ×{" "}
                      {item.quantity}
                    </span>
                    <span>Rs.{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Payment Status:</span>
                <Badge variant={order.isPaid ? "secondary" : "destructive"}>
                  {order.isPaid ? "Paid" : "Unpaid"}
                </Badge>
              </div>

              <Button
                variant={order.isPaid ? "outline" : "default"}
                className="w-full"
                onClick={togglePaymentStatus}
                disabled={isUpdating}
              >
                {order.isPaid ? "Mark as Unpaid" : "Mark as Paid"}
              </Button>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method:</label>
                <Select
                  value={order.paymentMethod || "none"}
                  onValueChange={updatePaymentMethod}
                  disabled={isUpdating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
