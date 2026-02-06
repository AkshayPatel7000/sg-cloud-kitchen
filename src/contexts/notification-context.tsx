"use client";

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";

interface NotificationContextType {
  startRinging: () => void;
  stopRinging: () => void;
  unlockAudio: () => void;
  isRinging: boolean;
  isAudioEnabled: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isRinging, setIsRinging] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Use the existing notification sound file
      audioRef.current = new Audio("/ringtone.mp3");
      audioRef.current.loop = true;
      audioRef.current.preload = "auto";
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const unlockAudio = () => {
    if (audioRef.current && !isAudioEnabled) {
      audioRef.current
        .play()
        .then(() => {
          audioRef.current?.pause();
          if (audioRef.current) audioRef.current.currentTime = 0;
          setIsAudioEnabled(true);
          console.log("🔊 [NotificationContext] Audio unlocked");
        })
        .catch((e) =>
          console.log("📢 [NotificationContext] Audio unlock failed:", e),
        );
    }
  };

  const startRinging = () => {
    console.log("🔔 [NotificationContext] startRinging called");
    if (audioRef.current) {
      // Ensure we stop any existing ringing before starting fresh
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => {
          console.log("🔊 [NotificationContext] Audio playing");
          setIsRinging(true);

          // Stop after 1 minute (60,000 ms)
          timeoutRef.current = setTimeout(() => {
            console.log(
              "🕒 [NotificationContext] 1 minute limit reached, stopping ring",
            );
            stopRinging();
          }, 60000);
        })
        .catch((e) => {
          console.error("📢 [NotificationContext] Audio play failed:", e);
          // If play fails (e.g. no user interaction), we still set isRinging to true
          // so the UI can show a "Stop Ringing" button or similar if needed.
          setIsRinging(true);
        });
    }
  };

  const stopRinging = () => {
    console.log("🔕 [NotificationContext] stopRinging called");
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsRinging(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        startRinging,
        stopRinging,
        unlockAudio,
        isRinging,
        isAudioEnabled,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
}
