"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Filter,
  Printer,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  Edit,
  Bell,
  BellOff,
} from "lucide-react";
import Link from "next/link";
import type { Order, OrderStatus } from "@/lib/types";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { createNotificationSound } from "@/lib/notification-sound";

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: any;
  }
> = {
  pending: { label: "Pending", variant: "outline", icon: Clock },
  preparing: { label: "Preparing", variant: "default", icon: ChefHat },
  ready: { label: "Ready", variant: "secondary", icon: CheckCircle2 },
  completed: { label: "Completed", variant: "secondary", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", variant: "destructive", icon: XCircle },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [previousOrderIds, setPreviousOrderIds] = useState<Set<string>>(
    new Set(),
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitialLoad = useRef(true);
  const { toast } = useToast();

  // Initialize audio on component mount
  useEffect(() => {
    // Create audio element for notification sound using Web Audio API
    audioRef.current = createNotificationSound();
  }, []);

  useEffect(() => {
    // Set up real-time listener
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedOrders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Order[];

        // Detect new customer orders
        if (!isInitialLoad.current && notificationsEnabled) {
          const currentOrderIds = new Set(fetchedOrders.map((o) => o.id));

          // Find new orders
          const newOrders = fetchedOrders.filter(
            (order) =>
              !previousOrderIds.has(order.id) && order.createdBy === "customer", // Only notify for customer orders
          );

          // Play notification for each new customer order
          newOrders.forEach((order) => {
            playNotificationSound();
            toast({
              title: "🔔 New Customer Order!",
              description: `Order ${order.orderNumber} received from ${order.customerName || "Customer"}`,
              duration: 5000,
            });
          });

          setPreviousOrderIds(currentOrderIds);
        } else if (isInitialLoad.current) {
          // On initial load, just store the order IDs without notification
          setPreviousOrderIds(new Set(fetchedOrders.map((o) => o.id)));
          isInitialLoad.current = false;
        }

        setOrders(fetchedOrders);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching orders:", error);
        setIsLoading(false);
      },
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [notificationsEnabled, previousOrderIds, toast]);

  const playNotificationSound = () => {
    if (audioRef.current && notificationsEnabled) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.error("Error playing notification sound:", error);
      });
    }
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast({
      title: notificationsEnabled
        ? "Notifications Disabled"
        : "Notifications Enabled",
      description: notificationsEnabled
        ? "You will not receive sound alerts for new orders"
        : "You will receive sound alerts for new customer orders",
    });
  };

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, orderTypeFilter]);

  const filterOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.customerPhone?.includes(searchTerm),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Order type filter
    if (orderTypeFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.orderType === orderTypeFilter,
      );
    }

    setFilteredOrders(filtered);
  };

  const getStatusBadge = (status: OrderStatus) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage restaurant orders, KOT, and bills
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={notificationsEnabled ? "default" : "outline"}
            size="lg"
            onClick={toggleNotifications}
          >
            {notificationsEnabled ? (
              <>
                <Bell className="mr-2 h-5 w-5" />
                Notifications On
              </>
            ) : (
              <>
                <BellOff className="mr-2 h-5 w-5" />
                Notifications Off
              </>
            )}
          </Button>
          <Link href="/admin/orders/new">
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              New Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Order Type Filter */}
            <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="dine-in">Dine In</SelectItem>
                <SelectItem value="takeaway">Takeaway</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setOrderTypeFilter("all");
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-grow">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">
                        {order.orderNumber}
                      </h3>
                      {getStatusBadge(order.status)}
                      <Badge variant="outline" className="capitalize">
                        {order.orderType.replace("-", " ")}
                      </Badge>
                      {order.tableNumber && (
                        <Badge variant="secondary">
                          Table {order.tableNumber}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {order.customerName && (
                        <div>
                          <span className="text-muted-foreground">
                            Customer:
                          </span>
                          <p className="font-medium">{order.customerName}</p>
                        </div>
                      )}
                      {order.customerPhone && (
                        <div>
                          <span className="text-muted-foreground">Phone:</span>
                          <p className="font-medium">{order.customerPhone}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Items:</span>
                        <p className="font-medium">
                          {order.items.length} items
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <p className="font-medium text-primary">
                          Rs.{order.total.toFixed(2)}
                        </p>
                        {order.discount && order.discount > 0 && (
                          <p className="text-xs text-green-600 dark:text-green-400">
                            (Discount: Rs.{order.discount.toFixed(2)})
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Created: {format(order.createdAt, "PPp")}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/orders/${order.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/orders/${order.id}/kot`}>
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4 mr-1" />
                        KOT
                      </Button>
                    </Link>
                    <Link href={`/admin/orders/${order.id}/bill`}>
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4 mr-1" />
                        Bill
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
