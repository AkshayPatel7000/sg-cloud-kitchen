import { messaging, db } from "./firebase/firestore";
import { getToken, onMessage } from "firebase/messaging";
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";

let isRequesting = false;

export async function requestNotificationPermission(userId: string) {
  if (isRequesting) return;
  isRequesting = true;

  if (typeof window === "undefined") {
    isRequesting = false;
    return;
  }

  if (!messaging) {
    console.error("🔔 [FCM] Messaging not initialized.");
    isRequesting = false;
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log("🔔 [FCM] Permission status:", permission);

    if (permission === "granted") {
      // Explicitly register the service worker
      let registration;
      try {
        registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
        );
        // Wait for it to be active
        await navigator.serviceWorker.ready;
        console.log(
          "🔔 [FCM] Service Worker registered and ready:",
          registration,
        );
      } catch (swError) {
        console.error("🔔 [FCM] Service Worker registration failed:", swError);
      }

      console.log("🔔 [FCM] Calling getToken...");

      // Use a promise race to timeout if getToken hangs
      const tokenPromise = getToken(messaging!, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("getToken timeout after 10s")),
          10000,
        ),
      );

      let token;
      try {
        token = (await Promise.race([tokenPromise, timeoutPromise])) as string;
      } catch (err) {
        console.warn("🔔 [FCM] getToken failed or timed out:", err);
        console.log(
          "🔔 [FCM] Attempting fallback without explicit registration...",
        );
        token = await getToken(messaging!, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
      }

      if (token) {
        console.log("🔔 [FCM] Token generated:", token);
        // Save token to firestore
        const adminRef = doc(db, "admins", userId);
        const adminDoc = await getDoc(adminRef);

        if (adminDoc.exists()) {
          console.log("🔔 [FCM] Updating existing admin doc");
          await updateDoc(adminRef, {
            fcmToken: token,
            updatedAt: new Date().toISOString(),
          });
        } else {
          console.log("🔔 [FCM] Creating new admin doc");
          await setDoc(adminRef, {
            uid: userId,
            fcmToken: token,
            updatedAt: new Date().toISOString(),
          });
        }
        console.log("🔔 [FCM] Token saved to Firestore");
        isRequesting = false;
        return token;
      } else {
        console.warn("🔔 [FCM] No token received from getToken");
      }
    } else {
      console.warn("🔔 [FCM] Permission denied for notifications");
    }
  } catch (error) {
    console.error("🔔 [FCM] Error getting notification permission:", error);
  } finally {
    isRequesting = false;
  }
}

export function onMessageListener(callback: (payload: any) => void) {
  if (typeof window === "undefined" || !messaging) return;

  return onMessage(messaging!, (payload) => {
    console.log("Message received. ", payload);
    callback(payload);
  });
}
