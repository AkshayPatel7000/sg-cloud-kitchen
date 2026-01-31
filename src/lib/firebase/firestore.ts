import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging, Messaging } from "firebase/messaging";
import { firebaseConfig } from "./config";

// Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);
let messaging: Messaging | undefined;

if (typeof window !== "undefined") {
  try {
    messaging = getMessaging(app);
    console.log("Firebase Messaging initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase Messaging:", error);
  }
}

export { db, auth, messaging };
