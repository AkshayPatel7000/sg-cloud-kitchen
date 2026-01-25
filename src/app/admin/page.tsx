import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllCategories, getDishes, getAllSectionItems } from '@/lib/data';
import { BookMarked, Cookie, Sparkles, Users } from 'lucide-react';

export default async function AdminDashboard() {
  const dishes = await getDishes();
  const categories = await getAllCategories();
  const sectionItems = await getAllSectionItems();

  const stats = [
    { title: 'Total Dishes', value: dishes.length, icon: Cookie },
    { title: 'Menu Categories', value: categories.length, icon: BookMarked },
    { title: 'Offer Items', value: sectionItems.length, icon: Sparkles },
    { title: 'Admins', value: 1, icon: Users },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
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
                <p>You can manage all aspects of your restaurant's online presence from this dashboard. Use the navigation on the left to get started.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
