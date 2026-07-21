import 'dotenv/config';

import { initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import serviceAccount from '../../../firebase-service-account.json' with {type: "json"};

console.log('id do projecto: ', serviceAccount.project_id);

let app;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {

    serviceAccountProduction = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    app = initializeApp({
        credential: cert(serviceAccountProduction)
    });

} else {

    app = initializeApp({
        credential: cert(serviceAccount)
    });

}

// Instância do Firebase Cloud Messaging para push notifications
const messaging = getMessaging(app);

export default messaging;

//BM0UGU2yMAeYy3u5wBRf4Cy1blWFaAe1IiupjAaIOJADeyxScjJTYIoTuGiwjxbJrUBMvt3nJHQo0qBtC0NfmNU