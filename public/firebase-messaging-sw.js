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

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo.png", // Make sure you have an icon at this path
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
