importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js",
);

const firebaseConfig = {
  apiKey: "AIzaSyA9qb0Q53EyWFofKGBkCKaC1yKyZIox59E",
  authDomain: "studio-5544385676-8ae9e.firebaseapp.com",
  projectId: "studio-5544385676-8ae9e",
  storageBucket: "studio-5544385676-8ae9e.appspot.com",
  messagingSenderId: "346298535256",
  appId: "1:346298535256:web:fea3ab68cb1ba0e4bfe92d",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

const notificationChannel = new BroadcastChannel("fcm_notifications");

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );

  // Send to foreground pages via BroadcastChannel
  notificationChannel.postMessage(payload);

  const notificationTitle = payload.notification?.title || "New Order!";
  const notificationOptions = {
    body: payload.notification?.body || "A new order has been received.",
    icon: "/logo.png",
    data: payload.data, // Include data for click handling
    silent: false, // Ensure it's not silent
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification clicked:", event);
  event.notification.close();

  const clickAction = event.notification.data?.click_action || "/admin/orders";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // If a tab is already open, focus it
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.includes(clickAction) && "focus" in client) {
            return client.focus();
          }
        }
        // If not, open a new tab
        if (clients.openWindow) {
          return clients.openWindow(clickAction);
        }
      }),
  );
});
