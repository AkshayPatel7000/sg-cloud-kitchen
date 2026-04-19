"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Utensils,
  ReceiptText,
  Filter,
  RefreshCw,
} from "lucide-react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  limit,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import type { Order } from "@/lib/types";
import { format, subDays, startOfDay } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

type DateRangeType = "7days" | "30days" | "thisMonth" | "lastMonth" | "custom";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  // Date filtering state
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>("30days");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [actualDateRange, setActualDateRange] = useState<{
    from: Date;
    to: Date;
  } | null>(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const forceRefreshRef = useRef(false);

  const handleRefresh = () => {
    forceRefreshRef.current = true;
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    async function loadDashboardData() {
      // Don't fetch if custom is selected but dates aren't fully set
      if (dateRangeType === "custom" && (!customStartDate || !customEndDate)) {
        return;
      }

      setLoading(true);

      try {
        let fromDate: Date | null = null;
        let toDate: Date = new Date();
        const now = new Date();

        switch (dateRangeType) {
          case "7days":
            fromDate = subDays(now, 7);
            break;
          case "30days":
            fromDate = subDays(now, 30);
            break;
          case "thisMonth":
            fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case "lastMonth":
            fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            toDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              0,
              23,
              59,
              59,
              999,
            );
            break;
          case "custom":
            if (customStartDate && customEndDate) {
              fromDate = new Date(customStartDate);
              fromDate.setHours(0, 0, 0, 0);
              toDate = new Date(customEndDate);
              toDate.setHours(23, 59, 59, 999);
            }
            break;
        }

        const cacheKey = `dashboard_orders_${dateRangeType}_${customStartDate}_${customEndDate}`;
        
        if (!forceRefreshRef.current) {
          const cachedData = sessionStorage.getItem(cacheKey);
          if (cachedData) {
            try {
              const parsed = JSON.parse(cachedData);
              if (Date.now() - parsed.timestamp < 1000 * 60 * 15) { // 15 mins cache
                const cachedOrders = parsed.data.map((order: any) => ({
                  ...order,
                  createdAt: new Date(order.createdAt),
                  updatedAt: new Date(order.updatedAt)
                }));
                if (fromDate) setActualDateRange({ from: fromDate, to: toDate });
                else setActualDateRange(null);
                setOrders(cachedOrders);
                setLoading(false);
                return;
              }
            } catch (e) {
              console.error("Cache read error", e);
            }
          }
        }

        // Save actual range used for chart X-axis consistency
        if (fromDate) {
          setActualDateRange({ from: fromDate, to: toDate });
        } else {
          setActualDateRange(null);
        }

        const ordersRef = collection(db, "orders");
        const qConstraints: any[] = [];

        if (fromDate) {
          qConstraints.push(where("createdAt", ">=", fromDate));
        }
        if (toDate) {
          qConstraints.push(where("createdAt", "<=", toDate));
        }

        qConstraints.push(orderBy("createdAt", "desc"));
        // Fetch cap to prevent massive loads
        qConstraints.push(limit(4000));

        const q = query(ordersRef, ...qConstraints);
        const querySnapshot = await getDocs(q);

        const fetchedOrders = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const parsedDate = data.createdAt?.toDate
            ? data.createdAt.toDate()
            : new Date();
          return {
            id: doc.id,
            ...data,
            createdAt: parsedDate,
            updatedAt: data.updatedAt?.toDate
              ? data.updatedAt.toDate()
              : parsedDate,
          };
        }) as Order[];

        sessionStorage.setItem(cacheKey, JSON.stringify({
          timestamp: Date.now(),
          data: fetchedOrders
        }));
        
        forceRefreshRef.current = false;
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [dateRangeType, customStartDate, customEndDate, refreshTrigger]);

  const {
    totalRevenue,
    validOrdersCount,
    avgOrderValue,
    todayRevenue,
    chartData,
    peakHoursData,
    topItems,
  } = useMemo(() => {
    let totalRev = 0;
    let todayRev = 0;
    let validCount = 0;

    const revenueByDay: Record<string, number> = {};
    const hourlyCount = new Array(24).fill(0);

    const itemMap: Record<
      string,
      { name: string; count: number; revenue: number }
    > = {};

    // Fill the chart dates so there are no gaps
    if (actualDateRange) {
      const d = startOfDay(actualDateRange.from);
      const end = startOfDay(actualDateRange.to);
      // Failsafe to prevent infinite loops if dates somehow reverse
      let escape = 0;
      while (d <= end && escape < 366) {
        revenueByDay[format(d, "MMM dd")] = 0;
        d.setDate(d.getDate() + 1);
        escape++;
      }
    }

    const today = startOfDay(new Date());

    orders.forEach((order) => {
      // Exclude cancelled items from revenue calculation
      if (order.status === "cancelled") return;

      validCount++;
      totalRev += order.total;

      if (order.createdAt >= today) {
        todayRev += order.total;
      }

      const dayLabel = format(order.createdAt, "MMM dd");
      if (revenueByDay[dayLabel] !== undefined) {
        revenueByDay[dayLabel] += order.total;
      } else {
        // If outside the explicit pre-filled window (e.g. edge case), still capture it
        revenueByDay[dayLabel] = (revenueByDay[dayLabel] || 0) + order.total;
      }

      hourlyCount[order.createdAt.getHours()]++;

      // Calculate item popularity
      order.items?.forEach((item) => {
        if (!itemMap[item.dishName]) {
          itemMap[item.dishName] = {
            name: item.dishName,
            count: 0,
            revenue: 0,
          };
        }
        itemMap[item.dishName].count += item.quantity;
        itemMap[item.dishName].revenue += item.price * item.quantity;
      });
    });

    const chartDataFormatted = Object.keys(revenueByDay).map((date) => ({
      date,
      revenue: revenueByDay[date],
    }));

    const peakHoursData = hourlyCount
      .map((count, index) => {
         const ampm = index >= 12 ? 'PM' : 'AM';
         const hour12 = index % 12 || 12;
         return {
            time: `${hour12}${ampm}`,
            value: count
         };
      })
      .filter(d => d.value > 0);

    const topItemsSorted = Object.values(itemMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRevenue: totalRev,
      validOrdersCount: validCount,
      avgOrderValue: validCount > 0 ? totalRev / validCount : 0,
      todayRevenue: todayRev,
      chartData: chartDataFormatted,
      peakHoursData,
      topItems: topItemsSorted,
    };
  }, [orders, actualDateRange]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 w-full overflow-hidden">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales Dashboard</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Overview of recent sales and operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="hidden sm:flex gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh Data
          </Button>
          <div className="flex flex-wrap items-center gap-3 bg-muted/30 p-2 rounded-lg border">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="sm:hidden gap-2 bg-background h-9"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
            <Filter className="h-4 w-4 text-muted-foreground ml-2 hidden sm:block" />
            <Select
              value={dateRangeType}
            onValueChange={(v: DateRangeType) => setDateRangeType(v)}
          >
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="custom">Custom Date Range</SelectItem>
            </SelectContent>
          </Select>

          {dateRangeType === "custom" && (
            <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-[140px] bg-background"
              />
              <span className="text-sm text-muted-foreground font-medium">
                to
              </span>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-[140px] bg-background"
              />
            </div>
          )}
        </div>
      </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4 py-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-80 bg-muted rounded"></div>
            <div className="h-80 bg-muted rounded"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <IndianRupee className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Rs.{" "}
                  {totalRevenue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-emerald-600 flex items-center font-medium">
                  Rs. {todayRevenue.toLocaleString()} earned today!
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
                <ShoppingBag className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{validOrdersCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Successfully completed orders
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Order Value
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Rs. {avgOrderValue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Amount per order average
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Item</CardTitle>
                <Utensils className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold truncate">
                  {topItems.length > 0 ? topItems[0].name : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {topItems.length > 0
                    ? `Sold ${topItems[0].count} times`
                    : "No sales data"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>
                  {dateRangeType === "custom" &&
                  customStartDate &&
                  customEndDate
                    ? `From ${format(new Date(customStartDate), "PP")} to ${format(new Date(customEndDate), "PP")}`
                    : "Sales progress over the selected timeframe"}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          backgroundColor: "#ffffff",
                          color: "#0f172a",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        labelStyle={{ color: "#0f172a", fontWeight: "bold" }}
                        formatter={(value: number) => [
                          `Rs. ${value.toFixed(2)}`,
                          "Revenue",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        activeDot={{ r: 6, fill: "#10b981" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Peak Trading Hours</CardTitle>
                <CardDescription>Busiest times of day by order volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full flex items-center justify-center">
                  {peakHoursData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={peakHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                        <Tooltip 
                           cursor={{ fill: 'transparent' }}
                           contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: '#ffffff', color: '#0f172a', boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                           labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                           formatter={(value: number) => [`${value} Orders`, 'Volume']}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground flex items-center gap-2 flex-col justify-center">
                      <TrendingUp className="h-8 w-8 mb-2 opacity-20" />
                      No time data yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Items</CardTitle>
                <CardDescription>
                  Most popular dishes during this period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {topItems.length > 0 ? (
                    topItems.map((item, i) => (
                      <div key={i} className="flex items-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold mr-4">
                          {i + 1}
                        </div>
                        <div className="ml-2 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Sold {item.count} items
                          </p>
                        </div>
                        <div className="ml-auto font-medium">
                          +Rs. {item.revenue.toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground pt-4">
                      Not enough data to determine top items.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity Overview</CardTitle>
                <CardDescription>Latest 5 orders recorded</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.length > 0 ? (
                    orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {order.orderNumber}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            {format(order.createdAt, "PP p")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            Rs. {order.total.toFixed(2)}
                          </p>
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${order.isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                          >
                            {order.isPaid ? "Paid" : "Unpaid"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground pt-4">
                      No recent activity found.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
