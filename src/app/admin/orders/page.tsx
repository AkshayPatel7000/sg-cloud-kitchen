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
import { useNotification } from "@/contexts/notification-context";

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
  const previousOrderIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);
  const { toast } = useToast();
  const { startRinging } = useNotification();

  useEffect(() => {
    // Set up real-time listener
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (querySnapshot) => {
        const fetchedOrders = querySnapshot.docs.map((doc) => {
          const data = doc.data();

          // Helper to safely convert Firebase Timestamp or Date to Date object
          const toDate = (val: any) => {
            if (val?.toDate) return val.toDate();
            if (val instanceof Date) return val;
            return new Date(); // Fallback for null (serverTimestamp pending)
          };

          return {
            id: doc.id,
            ...data,
            createdAt: toDate(data.createdAt),
            updatedAt: toDate(data.updatedAt),
          };
        }) as Order[];

        console.log(`Snapshot updated: ${fetchedOrders.length} orders found.`);
        if (fetchedOrders.length > 0) {
          console.log(
            "Latest order ID:",
            fetchedOrders[0].id,
            "Created at:",
            fetchedOrders[0].createdAt,
          );
        }

        // Detect new customer orders
        if (!isInitialLoad.current && notificationsEnabled) {
          const currentOrderIds = new Set(fetchedOrders.map((o) => o.id));

          // Find new orders
          const newOrders = fetchedOrders.filter(
            (order) =>
              !previousOrderIdsRef.current.has(order.id) &&
              order.createdBy === "customer",
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

          previousOrderIdsRef.current = currentOrderIds;
        } else if (isInitialLoad.current) {
          // On initial load, just store the order IDs without notification
          previousOrderIdsRef.current = new Set(fetchedOrders.map((o) => o.id));
          isInitialLoad.current = false;
        }

        setOrders(fetchedOrders);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching orders:", error);
        toast({
          title: "Connection Error",
          description:
            "Failed to listen for order updates. Please check your permissions.",
          variant: "destructive",
        });
        setIsLoading(false);
      },
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [notificationsEnabled, toast]);

  const playNotificationSound = () => {
    if (notificationsEnabled) {
      startRinging();
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
    console.log("🚀 ~ filterOrders ~ filtered:", filtered);
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground invisible sm:visible h-0 sm:h-auto">
            Manage restaurant orders, KOT, and bills
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={notificationsEnabled ? "default" : "outline"}
            className="h-10 w-10 p-0 sm:h-11 sm:w-auto sm:px-4"
            onClick={toggleNotifications}
            title={
              notificationsEnabled
                ? "Disable Notifications"
                : "Enable Notifications"
            }
          >
            {notificationsEnabled ? (
              <>
                <Bell className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Notifications On</span>
              </>
            ) : (
              <>
                <BellOff className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Notifications Off</span>
              </>
            )}
          </Button>
          <Link href="/admin/orders/new">
            <Button className="h-10 w-10 p-0 sm:h-11 sm:w-auto sm:px-4">
              <Plus className="h-5 w-5 sm:mr-2" />
              <span className="hidden sm:inline">New Order</span>
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
                <SelectItem value="delivered">Delivered</SelectItem>
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
            <Card
              key={order.id}
              className={`hover:shadow-md transition-shadow relative overflow-hidden ${
                order.isViewed === false
                  ? "border-2 border-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                  : "border"
              }`}
            >
              {order.isViewed === false && (
                <div className="absolute top-0 left-0">
                  <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-br-lg animate-pulse">
                    NEW
                  </div>
                </div>
              )}
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-3 flex-grow w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold whitespace-nowrap">
                        {order.orderNumber}
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {getStatusBadge(order.status)}
                        <Badge
                          variant="outline"
                          className="capitalize text-[10px] h-5 py-0"
                        >
                          {order.orderType.replace("-", " ")}
                        </Badge>
                        {order.tableNumber && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-5 py-0"
                          >
                            T-{order.tableNumber}
                          </Badge>
                        )}
                        {order.isViewed === false && (
                          <Badge className="bg-primary hover:bg-primary/90 text-[10px] h-5 py-0">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3 text-sm">
                      {order.customerName && (
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">
                            Customer
                          </span>
                          <p className="font-medium truncate">
                            {order.customerName}
                          </p>
                        </div>
                      )}
                      {order.customerPhone && (
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">
                            Phone
                          </span>
                          <p className="font-medium">{order.customerPhone}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">
                          Items
                        </span>
                        <p className="font-medium">
                          {order.items.length} items
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">
                          Total
                        </span>
                        <div className="flex flex-col">
                          <p className="font-bold text-primary">
                            Rs.{order.total.toFixed(2)}
                          </p>
                          {!!order.discount && order.discount > 0 && (
                            <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">
                              -Rs.{order.discount.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-muted-foreground pt-1 flex items-center gap-1.5 font-medium">
                      <Clock className="h-3 w-3" />
                      {format(order.createdAt, "PPp")}
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto sm:ml-4 pt-4 sm:pt-0 border-t sm:border-0">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="flex-1 sm:flex-none"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-9"
                      >
                        <Eye className="h-4 w-4 sm:mr-1" />
                        <span className="sm:hidden lg:inline text-xs">
                          View
                        </span>
                      </Button>
                    </Link>
                    <Link
                      href={`/admin/orders/${order.id}/edit`}
                      className="flex-1 sm:flex-none"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-9"
                      >
                        <Edit className="h-4 w-4 sm:mr-1" />
                        <span className="sm:hidden lg:inline text-xs">
                          Edit
                        </span>
                      </Button>
                    </Link>
                    <Link
                      href={`/admin/orders/${order.id}/kot`}
                      className="flex-1 sm:flex-none"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-9"
                      >
                        <Printer className="h-4 w-4 sm:mr-1" />
                        <span className="sm:hidden lg:inline text-xs font-bold">
                          KOT
                        </span>
                      </Button>
                    </Link>
                    <Link
                      href={`/admin/orders/${order.id}/bill`}
                      className="flex-1 sm:flex-none"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-9"
                      >
                        <Printer className="h-4 w-4 sm:mr-1 text-primary" />
                        <span className="sm:hidden lg:inline text-xs font-bold">
                          BILL
                        </span>
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
