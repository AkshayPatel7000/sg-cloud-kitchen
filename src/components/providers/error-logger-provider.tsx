"use client";

import React, { useEffect } from "react";
import { logErrorToFirestore } from "@/lib/error-logger";

export function ErrorLoggerProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId?: string;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleError = (event: ErrorEvent) => {
      logErrorToFirestore(event.error || event.message, userId, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      logErrorToFirestore(
        event.reason || "Unhandled Promise Rejection",
        userId,
        {
          type: "unhandledrejection",
        },
      );
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    console.log("🛡️ Error logging initialized");

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, [userId]);

  return <>{children}</>;
}
