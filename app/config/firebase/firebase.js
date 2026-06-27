import { initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import serviceAccount from '../../../firebase-service-account.json' with {type: "json"};

const app = initializeApp({
    credential: cert(serviceAccount)
});

// Instância do Firebase Cloud Messaging para push notifications
const messaging = getMessaging(app);

export { app, messaging };
export default app;