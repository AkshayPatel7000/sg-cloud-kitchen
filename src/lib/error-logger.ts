import { db } from "./firebase/firestore";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export interface ErrorLog {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: any;
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
    const errorLog: ErrorLog = {
      message: typeof error === "string" ? error : error.message,
      stack: typeof error === "string" ? undefined : error.stack,
      url: typeof window !== "undefined" ? window.location.href : "SSR",
      userAgent: typeof window !== "undefined" ? navigator.userAgent : "SSR",
      timestamp: serverTimestamp(),
      userId: userId || currentGlobalUserId || "anonymous",
      additionalInfo: additionalInfo || {},
    };

    const logsRef = collection(db, "error_logs");
    await addDoc(logsRef, errorLog);
    console.log("✅ Error logged to Firestore");
  } catch (logError) {
    // We don't want the error logger itself to crash the app
    console.error("❌ Failed to log error to Firestore:", logError);
  }
}
