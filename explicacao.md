# Sistema de Notificações — Casa Cheia

## Sumário

1. [Visão geral](#1-visão-geral)
2. [Canais de notificação](#2-canais-de-notificação)
3. [Fluxo completo](#3-fluxo-completo)
4. [Arquitetura e decisões técnicas](#4-arquitetura-e-decisões-técnicas)
5. [Serviços e dependências](#5-serviços-e-dependências)
6. [Como testar](#6-como-testar)
7. [Problemas conhecidos e gaps](#7-problemas-conhecidos-e-gaps)

---

## 1. Visão geral

O sistema de notificações da Casa Cheia foi projetado para manter **clientes** e **administradores** informados sobre eventos importantes da plataforma em **tempo real**. Ele combina três canais distintos:

| Canal | Tecnologia | Público | Finalidade |
|-------|-----------|---------|------------|
| Push Notification | **Firebase Cloud Messaging (FCM)** | Clientes | Notificar sobre mudanças de status do pedido, novos produtos |
| Notificação in-app | **MongoDB + Socket.io** | Administradores | Notificar em tempo real no dashboard sobre novos pedidos e atualizações |
| SMS | **API Ombala** | Clientes | Códigos de verificação (registro, recuperação de senha) e confirmação de pedido |

---

## 2. Canais de notificação

### 2.1 Push Notification — Firebase Cloud Messaging (FCM)

**Arquivo principal:** `app/config/services/notificationService.js`
**Firebase init:** `app/config/firebase/firebase.js`
**Credenciais:** `firebase-service-account.json`

#### Registro do dispositivo — `PATCH /api/profile/fcm-token`

O cliente (app mobile) deve registar o token FCM do dispositivo no servidor após o login:

```
Requisição: PATCH /api/profile/fcm-token
Headers: Authorization: Bearer <JWT>
Body: { "fcmToken": "<token_gerado_pelo_firebase_no_app>" }
```

O token é armazenado no array `fcmTokens` do documento do usuário no MongoDB. Um usuário pode ter **vários tokens** (um por dispositivo onde está logado).

#### Envio para um dispositivo específico — `sendPush(token, title, body, data)`

Usado no `orderController.updateStatusOrder` para notificar o cliente quando o status do pedido muda. Para cada token do usuário, é feita uma chamada individual à API do FCM.

Exemplo: quando o admin atualiza um pedido para "shipped", o cliente recebe:
> "O teu pedido ORD-123 foi Em entrega."

#### Envio para todos os utilizadores — `sendPushToAllUsers(title, body, data)`

Usado no `productController.createProduct` para notificar **todos os clientes** sobre um novo produto. Busca no MongoDB todos os usuários que têm pelo menos um token FCM, junta todos os tokens num único array e envia via `sendEachForMulticast` (FCM suporta até **500 tokens por chamada**).

Se algum token falhar com `messaging/invalid-registration-token`, ele é automaticamente removido da base de dados.

### 2.2 Notificações in-app + Socket.io — Administradores

**Socket.io setup:** `server.js`
**Notificação:** `notificationService.notifyAdmins()`

Quando ocorre um evento relevante para os administradores, duas coisas acontecem em paralelo:

1. **Persistência no MongoDB:** Busca todos os usuários com `role: "admin"` e cria um documento `Notification` para cada um.
2. **Evento em tempo real via Socket.io:** Emite um evento para a sala `"admin-room"` onde todos os admins conectados via Socket.io estão ouvindo.

#### Eventos emitidos via Socket.io

| Evento | Ocorre quando | Dados enviados |
|--------|--------------|----------------|
| `new_order` | Cliente finaliza um checkout | `{ orderId, orderNumber, total, contactName }` |
| `status_update` | Admin altera o status de um pedido | `{ orderId, orderNumber, status }` |

#### Conexão Socket.io (lado do frontend admin)

O admin dashboard deve conectar-se ao servidor Socket.io passando o JWT do admin:

```js
const socket = io("http://localhost:3000", {
  auth: { token: "<jwt_do_admin>" }
});

socket.on("new_order", (data) => {
  console.log("Novo pedido:", data);
});

socket.on("status_update", (data) => {
  console.log("Pedido atualizado:", data);
});
```

### 2.3 SMS — API Ombala

**Arquivo:** `app/config/services/ombalaService.js`
**Provider:** [Ombala](https://useombala.ao) (operadora angolana de SMS)

Usado em três situações:

| Função | Controller | Finalidade |
|--------|-----------|------------|
| `sendMessages(code, "Casa Cheia", telefone)` | `authController.signup` | Envio do código de verificação de 6 dígitos para registro |
| `sendMessages(code, "Casa Cheia", telefone)` | `forgotPasswordController.forgotPassword` | Envio do código de recuperação de senha |
| `sendMessages(confirmacao, "Casa Cheia", telefone)` | `checkoutController.checkOut` | Confirmação de pedido realizado |

---

## 3. Fluxo completo

### Fluxo: Cliente faz um pedido

```
[App Cliente]                          [Backend]                          [Admin Dashboard]
     |                                     |                                     |
     |--- PATCH /profile/fcm-token ------->|                                     |
     |    (registra token FCM)             |                                     |
     |                                     |                                     |
     |--- POST /orders/checkout --------->|                                     |
     |                                     |--- notifyAdmins("new_order") ------>|
     |                                     |    (Socket.io + MongoDB)            |-- pop-up: "Novo Pedido"
     |                                     |                                     |
     |                                     |--- SMS de confirmação ------------->| (cliente)
     |<-- 201 Pedido realizado ------------|                                     |
```

### Fluxo: Admin atualiza status do pedido

```
[Admin Dashboard]                       [Backend]                          [App Cliente]
     |                                     |                                     |
     |--- PATCH /orders/:id/status ------->|                                     |
     |                                     |--- sendPush(token, ...) ----------->|
     |                                     |    (FCM push notification)          |-- "Pedido foi Em entrega"
     |                                     |                                     |
     |<-- notifyAdmins("status_update") ---|                                     |
     |    (Socket.io)                      |                                     |
```

---

## 4. Arquitetura e decisões técnicas

### Porque Firebase Cloud Messaging (FCM) e não outro serviço?

| Serviço | Considerado? | Motivo da escolha/rejeição |
|---------|-------------|---------------------------|
| **FCM (Firebase)** | ✅ **Escolhido** | Grátis, sem limite de envios, suporte nativo Android/iOS via Google Play Services, integração simples com `firebase-admin`, ecossistema Firebase já usado no projeto |
| **OneSignal** | ❌ Rejeitado | Camada extra de dependência, custos em escala, menos controlo sobre os tokens |
| **APNs (Apple Push)** | ❌ Rejeitado | Só iOS, exigiria manter dois sistemas separados (APNs + outro para Android) |
| **WebSocket próprio** | ❌ Rejeitado | Não escala, sem garantia de entrega em dispositivos móveis com app em background |

**Vantagens do FCM para este projeto:**
- Envio multicast para até 500 tokens numa única chamada (usado em `sendPushToAllUsers`)
- Limpeza automática de tokens inválidos
- Documentação extensa e suporte multiplataforma

### Porque Socket.io e não Server-Sent Events (SSE) ou Polling?

| Tecnologia | Considerado? | Motivo |
|-----------|-------------|--------|
| **Socket.io** | ✅ **Escolhido** | Bidirecional, fallback automático para long-polling, salas (rooms) para segmentar admins, amplamente adotado |
| **SSE** | ❌ Rejeitado | Unidirecional (só servidor → cliente), sem suporte nativo em todos os browsers, sem salas |
| **Polling** | ❌ Rejeitado | Ineficiente, latência alta, consumo desnecessário de recursos |

### Porque Ombala e não Twilio ou outra API de SMS?

| Serviço | Considerado? | Motivo |
|---------|-------------|--------|
| **Ombala** | ✅ **Escolhido** | Operadora angolana, preços locais, suporte a números angolanos (9 dígitos), integração REST simples |
| **Twilio** | ❌ Rejeitado | Mais caro para Angola, processo de verificação burocrático, suporte limitado a operadoras angolanas |
| **AWS SNS** | ❌ Rejeitado | Complexidade de configuração, sem suporte específico para Angola |

### Porque usar MongoDB para armazenar notificações?

- **Persistência:** As notificações ficam salvas mesmo que o admin esteja offline — quando ele reconectar, pode buscar o histórico via API
- **Escalabilidade:** MongoDB lida bem com documentos de notificação que são inseridos em massa (`insertMany`)
- **Schema flexível:** O campo `data` é um objeto livre, permitindo enviar payloads diferentes para cada tipo de notificação
- **Indexação:** O índice `{ user: 1, createdAt: -1 }` otimiza as consultas de "notificações não lidas do usuário X ordenadas por data"

---

## 5. Serviços e dependências

### Dependências npm

| Pacote | Versão | Uso |
|--------|--------|-----|
| `firebase-admin` | ^14.1.0 | SDK Firebase para Node.js — FCM push notifications |
| `socket.io` | ^4.8.3 | WebSocket para tempo real no dashboard admin |
| `axios` | ^1.13.2 | Cliente HTTP para API Ombala (SMS) e ImgBB (imagens) |

### Variáveis de ambiente (`.env`)

| Variável | Onde é usada | Obrigatória? |
|----------|-------------|:---:|
| `TOKEN_OMBALA` | `ombalaService.js` — autenticação na API Ombala | Sim (SMS) |
| `URL_OMBALA` | `ombalaService.js` — endpoint da API Ombala | Sim (SMS) |
| `JWT_KEY` | `server.js` — verificação de token no Socket.io | Sim |

### Firebase Service Account

O arquivo `firebase-service-account.json` na raiz do projeto contém as credenciais da conta de serviço do Firebase. Este arquivo:
- É gerado no [Firebase Console](https://console.firebase.google.com) (Project Settings → Service Accounts → Generate New Private Key)
- **NÃO deve ser commitado** no git (está no `.gitignore` se configurado corretamente)
- Permite ao servidor Node.js autenticar-se no Firebase sem depender de um usuário logado

### Estrutura de arquivos

```
app/
├── config/
│   ├── firebase/
│   │   └── firebase.js              ← Inicialização do Firebase Admin SDK
│   ├── services/
│   │   ├── notificationService.js   ← Core do sistema (6 funções exportadas)
│   │   ├── ombalaService.js         ← Envio de SMS via API Ombala
│   │   └── redis.js                 ← Redis (apenas para códigos de verificação)
├── controllers/
│   ├── authController.js            ← updateFcmToken (registro de token)
│   ├── orderController.js           ← sendPush + notifyAdmins
│   ├── productController.js         ← sendPushToAllUsers
│   └── checkoutController.js        ← notifyAdmins
├── models/
│   ├── notification.js              ← Schema da notificação in-app
│   └── userModel.js                 ← Campo fcmTokens[]
└── routes/
    └── authRoutes.js                ← Rota PATCH /profile/fcm-token

server.js                            ← Socket.io server + admin-room
firebase-service-account.json        ← Credenciais Firebase (não commitar)
```

---

## 6. Como testar

### 6.1 Pré-requisitos

- Servidor rodando (`npm run dev` ou `npm start`)
- MongoDB conectado
- Redis conectado (para fluxo de registro)

### 6.2 Testar Push Notification (FCM)

#### Registrar um token FCM

```bash
curl -X PATCH http://localhost:3000/api/profile/fcm-token \
  -H "Authorization: Bearer <JWT_DO_USUARIO>" \
  -H "Content-Type: application/json" \
  -d '{"fcmToken": "token_fcm_valido_ou_falso"}'
```

**Resposta esperada (200):**
```json
{ "status": true, "message": "FCM token registado com sucesso." }
```

#### Testar notificação ao criar produto (broadcast)

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer <JWT_ADMIN>" \
  -F "name=Produto Teste Notificação" \
  -F "price=1000" \
  -F "category=<ID_CATEGORIA>" \
  -F "partner=<ID_PARCEIRO>" \
  -F "stock=10" \
  -F "description=Produto para testar notificação push"
```

**No console do servidor** deves ver:
```
Push enviado para X dispositivos, Y falhas
```

Se o token for inválido, verás também:
```
Erro ao enviar push FCM: messaging/invalid-registration-token
```

E o token será automaticamente removido da base.

#### Testar notificação ao atualizar status do pedido

```bash
curl -X PATCH http://localhost:3000/api/orders/<ORDER_ID>/status \
  -H "Authorization: Bearer <JWT_ADMIN>" \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

**Resposta esperada (200):**
```json
{ "status": true, "message": "Status atualizado com sucesso.", "data": { "id_pedido": "...", "novo_status": "confirmed", "statusLabel": "Confirmado" } }
```

No console do servidor deves ver:
```
Push enviado para X dispositivos, Y falhas
```

### 6.3 Testar Socket.io (admin dashboard em tempo real)

Podes usar o `socket.io-client` no Node.js ou ferramentas como [Postman WebSocket](https://learning.postman.com/docs/sending-requests/websocket/websocket/) ou [socket.io-client no browser](https://www.npmjs.com/package/socket.io-client).

**Script de teste rápido:**

```js
// salva como test-socket.js na raiz
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: { token: "<JWT_DO_ADMIN>" }
});

socket.on("connect", () => {
  console.log("Conectado ao Socket.io como admin");
});

socket.on("new_order", (data) => {
  console.log("Evento new_order recebido:", data);
});

socket.on("status_update", (data) => {
  console.log("Evento status_update recebido:", data);
});

socket.on("disconnect", (reason) => {
  console.log("Desconectado:", reason);
});

// Manter o script rodando
setTimeout(() => process.exit(0), 30000);
```

```bash
node test-socket.js
```

Depois, dispara um checkout ou uma atualização de status para ver os eventos chegando.

### 6.4 Testar SMS (Ombala)

Para testar o SMS, basta fazer uma requisição de registro:

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Teste SMS", "telefone": "923456789", "password": "senha123"}'
```

**Resposta esperada (200):**
```json
{ "status": true, "message": "Codigo de verificacao enviado com sucesso! por favor verifique seu telefone.", "telefone": "923456789" }
```

Se o SMS não chegar, verifica:
- O `TOKEN_OMBALA` está correto no `.env`?
- O `URL_OMBALA` está correto?
- O número de telefone é angolano válido (9 dígitos)?
- O console do servidor mostra erro da API Ombala?

### 6.5 Verificar Firebase

Para verificar se o Firebase está configurado corretamente:

```bash
node -e "import('./app/config/firebase/firebase.js').then(m => console.log('Firebase OK:', m.app.name)).catch(e => console.error('Erro:', e.message))"
```

**Resposta esperada:** `Firebase OK: [DEFAULT]`

Se houver erro, verifica:
- O `firebase-service-account.json` existe na raiz e tem conteúdo válido
- A conta de serviço tem permissão "Firebase Cloud Messaging Admin"

---

## 7. Problemas conhecidos e gaps

### 7.1 Funcionalidades não implementadas (definidas no service mas sem rota)

| Função | O que faz | Status |
|--------|----------|--------|
| `getUnreadNotifications(userId)` | Busca notificações não lidas do usuário | ❌ Sem rota REST |
| `markAsRead(notificationId)` | Marca notificação como lida | ❌ Sem rota REST |
| `saveInAppNotification(userId, type, title, body, data)` | Salva notificação in-app para um usuário específico | ❌ Sem uso |

Sugestão: criar endpoints `GET /api/notifications` e `PATCH /api/notifications/:id/read` para o frontend consumir.

### 7.2 Enum de tipos de notificação

Agora corrigido — o schema `notification.js` inclui `['new_order', 'new_product', 'promotion', 'status_update']`.

### 7.3 Rotas não montadas

- `refreshToken`: a função existe no controller mas nenhuma rota a monta.

### 7.4 Tokens FCM

O `sendPush` é chamado individualmente por token em vez de usar multicast. Para usuários com vários dispositivos, são feitas N chamadas à API do FCM em vez de uma. Isto é ineficiente mas funcional.

### 7.5 Dependências não utilizadas

- `@supabase/supabase-js` está no `package.json` e configurado em `app/config/supabaseClient.js` mas não é usado em nenhum controller (seria para armazenamento de imagens em produção, mas o ImgBB é que está ativo).
- O schema de `paymentMethodModel.js` existe mas também não tem rotas.
