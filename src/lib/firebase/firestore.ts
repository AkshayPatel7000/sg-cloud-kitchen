import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  enableMultiTabIndexedDbPersistence,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging, Messaging } from "firebase/messaging";
import { firebaseConfig } from "./config";

// Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

// Enable persistence on the client
if (typeof window !== "undefined") {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      console.warn("Firestore persistence failed: Multiple tabs open");
    } else if (err.code === "unimplemented") {
      console.warn("Firestore persistence failed: Browser not supported");
    }
  });
}

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
