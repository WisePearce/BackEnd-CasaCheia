# Sistema de Notificações — Casa Cheia

## 📋 O que precisas de implementar no Frontend (visão rápida)

O sistema de notificações tem **2 blocos independentes**. Lê esta secção primeiro para saber o que fazer antes de ires aos detalhes.

### Bloco 1 — Push Notification (FCM) para o App do Cliente

| Passo | O que fazer | Onde |
|-------|-------------|------|
| **1** | Instalar Firebase no projeto + configurar com as chaves do projeto `app-casacheia` | [Passo 1](#22-passo-1--configuração-do-firebase-no-projeto-frontend) |
| **2** | Após login do user, obter o token FCM do dispositivo e enviar para `PATCH /api/profile/fcm-token` | [Passo 2](#23-passo-2--registar-o-token-fcm-no-backend) |
| **3** | Tratar notificações recebidas com o app aberto (exibir toast/modal) | [Passo 3](#24-passo-3--receber-notificações-em-primeiro-plano-foreground) |
| **4** | Configurar recebimento com app fechado (Service Worker na web, automático no mobile) | [Passo 4](#25-passo-4--receber-notificações-em-segundo-plano-backgroundfechado) |
| **5** | Quando user toca na notificação, navegar para a tela correta usando `data.orderId` | [Exemplo React Native](#28-exemplo-completo-de-integração-fcm-react-native) |

### Bloco 2 — Socket.io + Notificações In-App para o Admin Dashboard

| Passo | O que fazer | Onde |
|-------|-------------|------|
| **1** | Após login do admin, conectar ao Socket.io passando o JWT no `auth.token` | [Passo 1](#32-passo-1--conectar-ao-socketio-com-jwt-do-admin) |
| **2** | Ouvir os eventos `new_order` e `status_update` para atualizar a UI em tempo real | [Passo 2](#33-passo-2--ouvir-os-eventos) |
| **3** | Ao entrar no dashboard, fazer `GET /api/profile/notifications` para buscar notificações perdidas | [Passo 3](#34-passo-3--buscar-notificações-perdidas-via-rest-api) |
| **4** | Quando o admin visualiza, marcar como lida com `PATCH /api/profile/notifications/:id/read` | [API](#4-api-de-notificações-in-app-rest) |

---

## Índice completo

1. [O que precisas de implementar no Frontend (visão rápida)](#-o-que-precisas-de-implementar-no-frontend-visão-rápida)
2. [Visão geral](#2-visão-geral)
3. [Serviço de Push Notification (FCM)](#3-serviço-de-push-notification-fcm)
   - [3.1 O que é FCM](#31-o-que-é-fcm)
   - [3.2 Passo 1 — Configuração do Firebase](#32-passo-1--configuração-do-firebase-no-projeto-frontend)
   - [3.3 Passo 2 — Registar o token FCM](#33-passo-2--registar-o-token-fcm-no-backend)
   - [3.4 Passo 3 — Receber em primeiro plano](#34-passo-3--receber-notificações-em-primeiro-plano-foreground)
   - [3.5 Passo 4 — Receber em segundo plano](#35-passo-4--receber-notificações-em-segundo-plano-backgroundfechado)
   - [3.6 Passo 5 — Novo produto (broadcast)](#36-passo-5--notificações-de-novo-produto-broadcast)
   - [3.7 Passo 6 — Status do pedido](#37-passo-6--notificações-de-atualização-de-status-do-pedido)
   - [3.8 Exemplo React Native](#38-exemplo-completo-react-native)
   - [3.9 Exemplo Web](#39-exemplo-completo-web)
4. [Serviço Socket.io — Admin Dashboard](#4-serviço-socketio--admin-dashboard)
   - [4.1 Como funciona](#41-como-funciona)
   - [4.2 Passo 1 — Conectar](#42-passo-1--conectar-ao-socketio)
   - [4.3 Passo 2 — Ouvir eventos](#43-passo-2--ouvir-os-eventos)
   - [4.4 Passo 3 — Buscar perdidas via REST](#44-passo-3--buscar-notificações-perdidas-via-rest)
   - [4.5 Exemplo React](#45-exemplo-completo-react)
5. [API REST de Notificações](#5-api-rest-de-notificações)
   - [5.1 GET /api/profile/notifications](#51-get-apiprofilenotifications)
   - [5.2 PATCH /api/profile/notifications/:id/read](#52-patch-apiprofilenotificationsidread)
   - [5.3 PATCH /api/profile/fcm-token](#53-patch-apiprofilefcm-token)
6. [Documentação Swagger](#6-documentação-swagger)
7. [Mapeamento completo de eventos](#7-mapeamento-completo-de-eventos)
8. [Estrutura de arquivos do backend](#8-estrutura-de-arquivos-do-backend)
9. [Ambiente de teste](#9-ambiente-de-teste)

---

## 2. Visão geral

| Bloco | Tecnologia | Público-alvo | O que entrega |
|-------|-----------|-------------|--------------|
| **Push Notification** | Firebase Cloud Messaging (FCM) | Clientes | Notificação push mesmo com app fechado |
| **Notificação In-App** | MongoDB | Clientes + Admins | Histórico de notificações consultável via `GET /api/profile/notifications` |
| **Tempo real** | Socket.io | Administradores | Notificação instantânea no dashboard |

---

## 3. Serviço de Push Notification (FCM)

### 3.1 O que é FCM

O Firebase Cloud Messaging permite enviar notificações push para dispositivos Android, iOS e Web **mesmo quando o app está fechado**.

### 3.2 Passo 1 — Configuração do Firebase no projeto frontend

#### Chaves do projeto

```js
const firebaseConfig = {
  apiKey: "AIzaSyDrWwBbSF5rTNq0b3LNAZNe3tunwOglns4",
  authDomain: "app-casacheia.firebaseapp.com",
  projectId: "app-casacheia",
  storageBucket: "app-casacheia.firebasestorage.app",
  messagingSenderId: "963306116249",
  appId: "1:963306116249:web:2f48382b5a995ee8d19408",
  measurementId: "G-2ZR9NKHWPK"
};
```

#### Chave VAPID (obrigatória para Web Push)

```
BM0UGU2yMAeYy3u5wBRf4Cy1blWFaAe1IiupjAaIOJADeyxScjJTYIoTuGiwjxbJrUBMvt3nJHQo0qBtC0NfmNU
```

### 3.3 Passo 2 — Registar o token FCM no backend

Após o login do utilizador, obtém o token FCM do dispositivo e envia para o backend:

```
PATCH /api/profile/fcm-token
Authorization: Bearer <JWT_DO_USUARIO>
Content-Type: application/json

{
  "fcmToken": "token_gerado_pelo_firebase"
}
```

Resposta:
```json
{ "status": true, "message": "FCM token registado com sucesso." }
```

**Regras:**
- Envia o token **sempre que o app abre** (o backend ignora duplicados)
- Cada dispositivo gera **um token diferente**
- Tokens inválidos são removidos automaticamente pelo backend

### 3.4 Passo 3 — Receber notificações em primeiro plano (foreground)

Quando o app está aberto, as notificações **não aparecem na barra do sistema** — precisas de tratar manualmente.

**React Native:**
```js
import messaging from '@react-native-firebase/messaging';

useEffect(() => {
  const unsubscribe = messaging().onMessage(async (remoteMessage) => {
    Alert.alert(
      remoteMessage.notification.title,
      remoteMessage.notification.body
    );
  });
  return unsubscribe;
}, []);
```

**Web:**
```js
import { getMessaging, onMessage } from "firebase/messaging";
onMessage(getMessaging(), (payload) => {
  showToast(payload.notification.title, payload.notification.body);
});
```

### 3.5 Passo 4 — Receber notificações em segundo plano (background/fechado)

**React Native** — automático. Para capturar quando o user toca na notificação:

```js
// App fechado → notificação abre o app
messaging().getInitialNotification().then(remoteMessage => {
  if (remoteMessage) {
    navigate('OrderDetails', { orderId: remoteMessage.data.orderId });
  }
});

// App em background → user toca na notificação
messaging().onNotificationOpenedApp(remoteMessage => {
  navigate('OrderDetails', { orderId: remoteMessage.data.orderId });
});
```

**Web** — precisas de um Service Worker na raiz do domínio (`public/firebase-messaging-sw.js`):

```js
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDrWwBbSF5rTNq0b3LNAZNe3tunwOglns4",
  authDomain: "app-casacheia.firebaseapp.com",
  projectId: "app-casacheia",
  storageBucket: "app-casacheia.firebasestorage.app",
  messagingSenderId: "963306116249",
  appId: "1:963306116249:web:2f48382b5a995ee8d19408",
  measurementId: "G-2ZR9NKHWPK"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(
    payload.notification?.title || 'Casa Cheia',
    { body: payload.notification?.body || '', data: payload.data }
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data;
  clients.openWindow(data?.orderId ? `/orders/${data.orderId}` : '/');
});
```

### 3.6 Passo 5 — Notificações de novo produto (broadcast)

Quando um admin cria um produto (`POST /api/products`), o backend envia push para **todos os clientes** automaticamente. Não precisas de fazer nada extra — só implementar os Passos 1-4.

### 3.7 Passo 6 — Notificações de atualização de status do pedido

Quando um admin muda o status do pedido (`PATCH /api/orders/:id/status`), o backend envia push para o cliente dono daquele pedido.

**Dados que vêm na notificação:**

| Campo | Exemplo | Uso |
|-------|---------|-----|
| `title` | "Status do Pedido" | Título |
| `body` | "O teu pedido ORD-123 foi Confirmado." | Mensagem |
| `data.orderId` | "60f..." | Navegar para a tela do pedido |
| `data.orderNumber` | "ORD-123" | Número |
| `data.status` | "confirmed" | Código do status |

### 3.8 Exemplo completo (React Native)

```js
// services/notifications.js
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = 'http://localhost:3000/api';

export async function setupFcm(jwt) {
  const authStatus = await messaging().requestPermission();
  if (authStatus !== messaging.AuthorizationStatus.AUTHORIZED &&
      authStatus !== messaging.AuthorizationStatus.PROVISIONAL) return;

  const token = await messaging().getToken();
  await AsyncStorage.setItem('@fcm_token', token);

  // Registar no backend
  await fetch(`${API}/profile/fcm-token`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fcmToken: token }),
  });

  // Foreground
  messaging().onMessage(msg => {
    Alert.alert(msg.notification.title, msg.notification.body);
  });

  // Background → user toca na notificação
  messaging().onNotificationOpenedApp(msg => {
    navigate('OrderDetails', { orderId: msg.data.orderId });
  });

  // App aberto a partir do zero pela notificação
  const initial = await messaging().getInitialNotification();
  if (initial) {
    navigate('OrderDetails', { orderId: initial.data.orderId });
  }
}
```

### 3.9 Exemplo completo (Web)

```html
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js"></script>
<script>
  firebase.initializeApp({
    apiKey: "AIzaSyDrWwBbSF5rTNq0b3LNAZNe3tunwOglns4",
    authDomain: "app-casacheia.firebaseapp.com",
    projectId: "app-casacheia",
    storageBucket: "app-casacheia.firebasestorage.app",
    messagingSenderId: "963306116249",
    appId: "1:963306116249:web:2f48382b5a995ee8d19408",
    measurementId: "G-2ZR9NKHWPK"
  });

  const messaging = firebase.messaging();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js');
  }

  async function setupFcm(jwt) {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return;

    const token = await messaging.getToken({
      vapidKey: "BM0UGU2yMAeYy3u5wBRf4Cy1blWFaAe1IiupjAaIOJADeyxScjJTYIoTuGiwjxbJrUBMvt3nJHQo0qBtC0NfmNU"
    });

    await fetch('/api/profile/fcm-token', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fcmToken: token }),
    });

    messaging.onMessage(payload => {
      showToast(payload.notification.title, payload.notification.body);
    });
  }
</script>
```

---

## 4. Serviço Socket.io — Admin Dashboard

### 4.1 Como funciona

O Socket.io é usado **exclusivamente para o dashboard do admin**. O servidor:

1. Verifica se o JWT do handshake é de um admin válido
2. Coloca o socket na sala `"admin-room"`
3. Quando algo acontece (novo pedido, status update), emite o evento para a sala
4. Todos os admins conectados recebem em tempo real

### 4.2 Passo 1 — Conectar ao Socket.io

Após o login do admin, conecta passando o JWT no `auth.token`:

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: { token: "<JWT_DO_ADMIN>" },
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 2000,
});
```

### 4.3 Passo 2 — Ouvir os eventos

| Evento | Quando ocorre | Dados |
|--------|--------------|-------|
| `new_order` | Cliente finaliza checkout | `{ orderId, orderNumber, total, contactName, title, body, createdAt }` |
| `status_update` | Admin altera status | `{ orderId, orderNumber, status, title, body, createdAt }` |

```js
socket.on("new_order", (data) => {
  // Mostrar pop-up: "Novo Pedido ORD-123 — João (1.500 Kz)"
});

socket.on("status_update", (data) => {
  // Atualizar lista de pedidos + toast
});
```

### 4.4 Passo 3 — Buscar notificações perdidas via REST

Se o admin estava offline, as notificações ficam no MongoDB. Ao entrar no dashboard:

1. Fazer `GET /api/profile/notifications` — retorna as não lidas
2. Mostrar no dashboard
3. Quando o admin visualizar, fazer `PATCH /api/profile/notifications/:id/read`

### 4.5 Exemplo completo (React)

```js
// services/socket.js
import { io } from "socket.io-client";

let socket = null;

export function connectSocket(jwt) {
  if (socket?.connected) return socket;

  socket = io("http://localhost:3000", {
    auth: { token: jwt },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => console.log("Socket conectado:", socket.id));
  socket.on("connect_error", (err) => console.error("Erro socket:", err.message));

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
```

```jsx
// hooks/useAdminNotifications.js
import { useEffect, useState } from "react";
import { connectSocket, disconnectSocket } from "../services/socket";

export function useAdminNotifications(jwt) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!jwt) return;

    // Buscar notificações perdidas
    fetch("/api/profile/notifications", {
      headers: { Authorization: `Bearer ${jwt}` },
    }).then(r => r.json()).then(d => {
      if (d.status) setNotifications(d.data);
    });

    const socket = connectSocket(jwt);
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("new_order", (data) => {
      setNotifications(prev => [data, ...prev]);
      showToast(`Novo Pedido: ${data.orderNumber}`, data.contactName);
    });
    socket.on("status_update", (data) => {
      setNotifications(prev => [data, ...prev]);
    });

    return () => disconnectSocket();
  }, [jwt]);

  return { connected };
}
```

---

## 5. API REST de Notificações

### 5.1 GET /api/profile/notifications

Lista notificações **não lidas** do user autenticado (máx 50, ordenadas por data).

```
GET /api/profile/notifications
Authorization: Bearer <JWT>
```

Resposta:
```json
{
  "status": true,
  "data": [
    {
      "_id": "60f...",
      "user": "60f...",
      "type": "new_order",
      "title": "Novo Pedido",
      "body": "Pedido ORD-123 — João",
      "data": { "orderId": "...", "orderNumber": "ORD-123", "total": 1500 },
      "read": false,
      "createdAt": "2025-01-15T14:30:00.000Z"
    }
  ]
}
```

### 5.2 PATCH /api/profile/notifications/:id/read

Marca notificação como lida.

```
PATCH /api/profile/notifications/60f.../read
Authorization: Bearer <JWT>
```

Resposta:
```json
{ "status": true, "message": "Notificação marcada como lida.", "data": { ... } }
```

### 5.3 PATCH /api/profile/fcm-token

Regista token FCM do dispositivo (documentado no [Passo 2](#33-passo-2--registar-o-token-fcm-no-backend)).

---

## 6. Documentação Swagger

A documentação interativa da API está disponível em:

```
http://localhost:3000/api-docs
```

Lá encontras documentação para todos os endpoints, incluindo:

- **Notificações**
  - `GET /api/profile/notifications` — listar não lidas
  - `PATCH /api/profile/notifications/{id}/read` — marcar como lida
- **Autenticação**
  - `PATCH /api/profile/fcm-token` — registar token FCM

Os schemas `Notification`, `NotificationsResponse`, `MarkAsReadResponse` e `FcmTokenInput` estão documentados no Swagger.

---

## 7. Mapeamento completo de eventos

| Ação | Push FCM (cliente) | Socket.io (admin) | MongoDB in-app (admins) | MongoDB in-app (clientes) |
|------|:---:|:---:|:---:|:---:|
| Cliente faz checkout | ❌ | ✅ `new_order` | ✅ notificação criada p/ cada admin | ❌ |
| Admin cria produto | ✅ broadcast p/ todos | ❌ | ❌ | ✅ `new_product` p/ todos |
| Admin reduz preço | ❌ | ❌ | ❌ | ✅ `promotion` p/ todos |
| Admin atualiza status | ✅ só dono do pedido | ✅ `status_update` | ✅ notificação p/ cada admin | ✅ `status_update` p/ dono |
| Cliente regista FCM token | — | — | — | ✅ token guardado |

---

## 8. Estrutura de arquivos do backend

```
server.js                                      ← Socket.io (admin-room)
app/
├── app.js                                     ← monta as rotas
├── config/
│   ├── firebase/firebase.js                   ← inicializa Firebase Admin SDK
│   └── services/notificationService.js        ← 7 funções do core
├── controllers/
│   ├── authController.js                      ← updateFcmToken
│   ├── notificationController.js              ← getUserNotifications, markAsRead
│   ├── checkoutController.js                  ← notifyAdmins("new_order")
│   ├── orderController.js                     ← sendPush + notifyAdmins("status_update")
│   └── productController.js                   ← sendPushToAllUsers
├── models/
│   ├── userModel.js                           ← fcmTokens: [String]
│   └── notification.js                        ← schema da notificação
└── routes/
    ├── authRoutes.js                          ← PATCH /profile/fcm-token
    └── notificationRoutes.js                  ← GET/PATCH /profile/notifications

testWeb/
├── testFcmWeb.html                            ← gera token FCM para testes
└── firebase-messaging-sw.js                   ← service worker para FCM web
```

---

## 9. Ambiente de teste

### 9.1 Testar FCM com página web

Na pasta `testWeb/`:

1. Abre `testWeb/testFcmWeb.html` num browser (serve com `npx serve testWeb`)
2. Clica "Gerar Token" e aceita a permissão
3. Copia o token gerado
4. Regista e testa:

```bash
curl -X PATCH http://localhost:3000/api/profile/fcm-token \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"fcmToken": "token_gerado"}'

curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer <JWT_ADMIN>" \
  -F "name=Push Test" -F "price=1000" -F "category=<ID>" \
  -F "partner=<ID>" -F "stock=10" -F "description=teste"
```

Deves receber a notificação no browser.

### 9.2 Testar Socket.io

Salva como `test-socket.mjs`:

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: { token: "<JWT_DO_ADMIN>" }
});

socket.on("connect", () => console.log("✅ Conectado"));
socket.on("new_order", d => console.log("📦 new_order:", JSON.stringify(d, null, 2)));
socket.on("status_update", d => console.log("🔄 status_update:", JSON.stringify(d, null, 2)));
setTimeout(() => process.exit(0), 60000);
```

```bash
node test-socket.mjs
```

Depois faz um checkout ou atualiza status noutro terminal.

### 9.3 Testar endpoints de notificação

```bash
curl http://localhost:3000/api/profile/notifications \
  -H "Authorization: Bearer <JWT>"

curl -X PATCH http://localhost:3000/api/profile/notifications/<ID>/read \
  -H "Authorization: Bearer <JWT>"
```

Ou executa o script automatizado:

```bash
node test-notifications.mjs
```
