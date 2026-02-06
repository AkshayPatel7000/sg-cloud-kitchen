"use client";
import {
  BookMarked,
  Cookie,
  Home,
  LogOut,
  Settings,
  ShoppingBasket,
  Sparkles,
  Utensils,
  ChevronDown,
  Receipt,
  Bell,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "../ui/sidebar";
import { Logo } from "../logo";
import type { AdminNavItem, Restaurant } from "@/lib/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";

const navItems: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/restaurant", label: "Restaurant Info", icon: Utensils },
  // { href: "/admin/offers", label: "Offers & Specials", icon: Sparkles },
  { href: "/admin/categories", label: "Categories", icon: BookMarked },
  { href: "/admin/dishes", label: "Dishes", icon: Cookie },
  { href: "/admin/import", label: "Import Data", icon: ShoppingBasket },
];

export function AdminNav({ restaurant }: { restaurant: Restaurant | null }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      <div className="md:hidden flex items-center justify-between p-2 border-b">
        <Logo href="/admin" logoUrl={restaurant?.logoUrl} />
        <SidebarTrigger />
      </div>
      <Sidebar>
        <SidebarHeader className="hidden md:flex">
          <div className="flex items-center justify-between">
            <Logo
              href="/admin"
              logoUrl={restaurant?.logoUrl}
              restaurantName={restaurant?.name}
            />
            <SidebarTrigger className="hidden" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  className="justify-start"
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start p-2 h-auto"
              >
                <div className="flex justify-between items-center w-full">
                  <div className="flex gap-2 items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${user?.email}.png`}
                        alt={user?.name}
                      />
                      <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <ChevronDown size={18} />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  const { requestNotificationPermission } =
                    await import("@/lib/notifications");
                  if (user) await requestNotificationPermission(user.uid);
                }}
              >
                <Bell className="mr-2 h-4 w-4" />
                <span>Enable Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
