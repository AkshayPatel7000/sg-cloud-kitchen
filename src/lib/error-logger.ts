export interface ErrorLog {
  id?: string;
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp?: any;
  createdAt?: any;
  userId?: string;
  additionalInfo?: any;
}

let currentGlobalUserId: string | undefined;

export function setGlobalUserId(userId: string | undefined) {
  currentGlobalUserId = userId;
}

export async function logErrorToFirestore(
  error: Error | string,
  userId?: string,
  additionalInfo?: any,
) {
  try {
    const errorLog = {
      message: typeof error === "string" ? error : error.message,
      stack: typeof error === "string" ? undefined : error.stack,
      url: typeof window !== "undefined" ? window.location.href : "SSR",
      userAgent: typeof window !== "undefined" ? navigator.userAgent : "SSR",
      userId: userId || currentGlobalUserId || "anonymous",
      additionalInfo: additionalInfo || {},
    };

    // Use API instead of direct Firestore
    await fetch("/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(errorLog),
    });

    console.log("✅ Error logged to MongoDB via API");
  } catch (logError) {
    console.error("❌ Failed to log error:", logError);
  }
}
