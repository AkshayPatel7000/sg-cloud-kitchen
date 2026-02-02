import { NextResponse } from "next/server";

export async function GET() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const script = `
    importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
    importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

    firebase.initializeApp(${JSON.stringify(firebaseConfig)});
    const messaging = firebase.messaging();

    const notificationChannel = new BroadcastChannel("fcm_notifications");

    messaging.onBackgroundMessage((payload) => {
      console.log("[firebase-messaging-sw.js] Received background message ", payload);
      notificationChannel.postMessage(payload);

      const notificationTitle = payload.notification?.title || "New Order!";
      const notificationOptions = {
        body: payload.notification?.body || "A new order has been received.",
        icon: "/logo.png",
        data: payload.data,
        silent: false,
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });

    self.addEventListener("notificationclick", (event) => {
      event.notification.close();
      const clickAction = event.notification.data?.click_action || "/admin/orders";

      event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
          for (let i = 0; i < windowClients.length; i++) {
            const client = windowClients[i];
            if (client.url.includes(clickAction) && "focus" in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow(clickAction);
          }
        })
      );
    });
  `;

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}
