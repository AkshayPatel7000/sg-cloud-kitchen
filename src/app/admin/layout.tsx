"use client";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminNav } from "@/components/admin/admin-nav";
import { getRestaurant } from "@/lib/data-client";
import type { Restaurant } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log("🔑 [AdminLayout] User state:", !!user, user?.uid);
    if (typeof window !== "undefined") {
      console.log(
        "🔔 [Notification] Current Permission:",
        Notification.permission,
      );
    }

    if (!loading && !user && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [user, loading, router, pathname]);

  useEffect(() => {
    let unsubscribe: any;
    const notificationChannel = new BroadcastChannel("fcm_notifications");

    const playSound = () => {
      try {
        const audio = new Audio("/notfy.wav");
        audio.play().catch((e) => console.log("Audio play failed:", e));
      } catch (audioErr) {
        console.error("Error playing notification sound:", audioErr);
      }
    };

    // Listen for messages from Service Worker (when tab is backgrounded)
    notificationChannel.onmessage = (event) => {
      console.log("📢 [FCM] Message from BroadcastChannel:", event.data);
      playSound();
    };

    if (user) {
      const { onMessageListener } = require("@/lib/notifications");
      unsubscribe = onMessageListener((payload: any) => {
        console.log("⚡ [FCM] Foreground message received:", payload);
        if (payload?.notification) {
          toast({
            title: payload.notification.title,
            description: payload.notification.body,
          });

          // Play custom notification sound
          playSound();

          // Fallback: Browser notification even in foreground if user is in another tab
          if (Notification.permission === "granted") {
            new Notification(payload.notification.title, {
              body: payload.notification.body,
              icon: "/logo.png",
            });
          }
        }
      });
    }

    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
      notificationChannel.close();
    };
  }, [user, toast]);

  useEffect(() => {
    async function fetchRestaurant() {
      const data = await getRestaurant();
      setRestaurant(data);
    }
    if (user) {
      fetchRestaurant();
    }
  }, [user]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="md:flex w-full">
        <AdminNav restaurant={restaurant} />
        <SidebarInset className="flex-1">{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}
