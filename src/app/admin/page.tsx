"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCounts } from "@/lib/data";
import { BookMarked, Cookie, Sparkles, Users } from "lucide-react";
import { Category, Dish, SectionItem } from "@/lib/types";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    dishesCount: 0,
    categoriesCount: 0,
    sectionItemsCount: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const counts = await getCounts();

        setStatsData({
          dishesCount: counts.dishes,
          categoriesCount: counts.categories,
          sectionItemsCount: counts.sectionItems,
        });
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const stats = [
    { title: "Total Dishes", value: statsData.dishesCount, icon: Cookie },
    {
      title: "Menu Categories",
      value: statsData.categoriesCount,
      icon: BookMarked,
    },
    {
      title: "Offer Items",
      value: statsData.sectionItemsCount,
      icon: Sparkles,
    },
    { title: "Admins", value: 1, icon: Users },
  ];

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, Admin!</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              You can manage all aspects of your restaurant's online presence
              from this dashboard. Use the navigation on the left to get
              started.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
