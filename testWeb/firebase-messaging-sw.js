

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDrWwBbSF5rTNq0b3LNAZNe3tunwOglns4",
  authDomain: "app-casacheia.firebaseapp.com",
  projectId: "app-casacheia",
  storageBucket: "app-casacheia.firebasestorage.app",
  messagingSenderId: "963306116249",
  appId: "1:963306116249:web:2f48382b5a995ee8d19408",
  measurementId: "G-2ZR9NKHWPK"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Mostra notificação quando o app está em background/fechado
messaging.onBackgroundMessage((payload) => {
  console.log('Mensagem recebida em background:', payload);

  const notificationTitle = payload.notification?.title || 'Notificação';
  const notificationOptions = {
    body: payload.notification?.body || '',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});