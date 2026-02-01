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

  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  useEffect(() => {
    let unsubscribe: any;
    const notificationChannel = new BroadcastChannel("fcm_notifications");

    // Hidden audio element for consistent playback
    const audio =
      typeof window !== "undefined" ? new Audio("/notfy.wav") : null;
    if (audio) {
      audio.load();
    }

    const playSound = () => {
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch((e) => {
          console.log(
            "📢 [FCM] Audio play failed (likely background/no interaction):",
            e,
          );
        });
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

          // Fallback: Browser notification even in foreground
          if (Notification.permission === "granted") {
            new Notification(payload.notification.title, {
              body: payload.notification.body,
              icon: "/logo.png",
            });
          }
        }
      });
    }

    // Attempt to enable audio on first click
    const handleFirstClick = () => {
      if (!isAudioEnabled) {
        setIsAudioEnabled(true);
        // Play and immediately pause to "unlock" audio on mobile/strict browsers
        if (audio) {
          audio
            .play()
            .then(() => {
              audio.pause();
              audio.currentTime = 0;
              console.log("🔊 [FCM] Audio unlocked");
            })
            .catch((e) => console.log("Audio unlock failed:", e));
        }
        window.removeEventListener("click", handleFirstClick);
      }
    };
    window.addEventListener("click", handleFirstClick);

    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
      notificationChannel.close();
      window.removeEventListener("click", handleFirstClick);
    };
  }, [user, toast, isAudioEnabled]);

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

  // Don't show sidebar if we are definitely not logged in (redirecting)
  if (!loading && !user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="md:flex w-full relative">
        {!isAudioEnabled && (
          <div className="fixed bottom-4 right-4 z-[100] bg-yellow-500/90 text-black px-4 py-2 rounded-full text-xs font-bold animate-pulse shadow-lg pointer-events-none">
            📣 Click anywhere to enable order sounds
          </div>
        )}
        <AdminNav restaurant={restaurant} />
        <SidebarInset className="flex-1">
          {loading ? (
            <div className="flex h-full min-h-[400px] w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            children
          )}
        </SidebarInset>
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
