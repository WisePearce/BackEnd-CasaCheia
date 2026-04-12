📌 Documentação da API – Casa Cheia
--------------------------------
NOVAS ATUALIZACOES
## ✨ Novas Funcionalidades (Updates Recentes)
# 📦 Documentação da API — Casa Cheia


## 🏪 Parceiros (Fornecedores)

> Todas as rotas exigem autenticação.

### GET `/partners`
Listar todos os parceiros.

**Resposta:**
```json
{
  "status": true,
  "count": 2,
  "data": [
    {
      "_id": "69db9270de482cd75a3d679a",
      "name": "Distribuidora X",
      "email": "dist@email.com",
      "nif": "123456789",
      "phone": "923456789",
      "status": "active",
      "images": ["1775997813605-947394411.png"],
      "address": {
        "street": "Rua X",
        "city": "Luanda",
        "province": "Luanda"
      }
    }
  ]
}
```

---

### GET `/partners/search?query=nome`
Buscar parceiro por nome ou NIF.

**Query params:**
| Param | Tipo | Obrigatório |
|-------|------|-------------|
| query | string | ✅ |

---

### GET `/partners/:id`
Buscar parceiro por ID.

---

### POST `/partners`
Cadastrar novo parceiro. Enviar como **multipart/form-data**.

**Campos:**
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| name | string | ✅ |
| email | string | ✅ |
| nif | string | ✅ |
| phone | string | ✅ |
| status | string | ❌ (active/inactive/suspended) |
| address | JSON string | ❌ |
| images | file(s) | ❌ máx 4 |

**Exemplo de `address` no multipart:**
```
address → {"street":"Rua X","city":"Luanda","province":"Luanda"}
```

---

### PATCH `/partners/:id`
Atualizar parceiro. Enviar como **multipart/form-data**.  
Mesmos campos do POST, todos opcionais. Pelo menos 1 campo obrigatório.

---

### PATCH `/partners/:id/toggle`
Ativar/desativar parceiro. Alterna entre `active` e `inactive`.

**Resposta:**
```json
{
  "status": true,
  "message": "Parceiro desativado com sucesso.",
  "data": { ... }
}
```

---

### DELETE `/partners/:id`
Remover parceiro.

---

## 📂 Categorias

### GET `/categories`
Listar todas as categorias.

### POST `/categories`
Criar categoria. Exige autenticação.

**Body (JSON):**
```json
{
  "name": "Bebidas",
  "description": "Sumos e refrigerantes"
}
```

### PATCH `/categories/:id`
Atualizar categoria.

### DELETE `/categories/:id`
Remover categoria.

---

## 🛒 Produtos

### GET `/products?page=1&limit=10`
Listar produtos com paginação.

**Query params:**
| Param | Tipo | Padrão |
|-------|------|--------|
| page | number | 1 |
| limit | number | 10 |

**Resposta:**
```json
{
  "status": true,
  "data": [
    {
      "_id": "69db9217de482cd75a3d6793",
      "name": "Sumol",
      "price": 2000,
      "stock": 23,
      "image": ["1775997813605-947394411.png"],
      "description": "Bebida para acompanhar com pão",
      "category": { "_id": "...", "name": "Bebidas" },
      "partner": { "_id": "...", "name": "Distribuidora X" }
    }
  ],
  "pagina_atual": 1,
  "total_paginas": 5,
  "total_produtos": 50
}
```

---

### GET `/products/search?name=sumol`
Buscar produto por nome.

---

### GET `/products/:id`
Buscar produto por ID.

---

### POST `/products`
Cadastrar produto. Exige autenticação. Enviar como **multipart/form-data**.

**Campos:**
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| name | string | ✅ |
| price | number | ✅ |
| stock | number | ✅ |
| category | ObjectId | ✅ |
| partner | ObjectId | ✅ |
| description | string | ❌ |
| images | file(s) | ✅ máx 4 |

---

### PATCH `/products/:id`
Atualizar produto. Exige autenticação. Enviar como **multipart/form-data**.  
Todos os campos opcionais. Pelo menos 1 obrigatório.

---

### DELETE `/products/:id`
Remover produto. Exige autenticação.

---

## 🖼️ Banners

### GET `/banners`
Listar banners ativos.

**Resposta:**
```json
{
  "status": true,
  "count": 3,
  "data": [
    {
      "_id": "...",
      "images": ["banner1.png", "banner2.png"],
      "description": "Promoção de verão",
      "active": true
    }
  ]
}
```

---

### GET `/banners/:id`
Buscar banner por ID.

---

### POST `/banners`
Criar banner. Exige autenticação. Enviar como **multipart/form-data**.

**Campos:**
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| images | file(s) | ✅ máx 4 |
| description | string | ❌ |
| active | boolean | ❌ (padrão: true) |

---

### PUT `/banners/:id`
Atualizar banner. Exige autenticação. Enviar como **multipart/form-data**.

---

### PATCH `/banners/:id/toggle`
Ativar/desativar banner.

---

### DELETE `/banners/:id`
Remover banner. Exige autenticação.

---

## 🛍️ Carrinho

> Todas as rotas exigem autenticação.

### GET `/cart`
Buscar carrinho do utilizador autenticado.

**Resposta:**
```json
{
  "status": true,
  "cart": {
    "user": { "name": "João Silva" },
    "items": [
      {
        "product": {
          "name": "Sumol",
          "price": 2000,
          "category": { "name": "Bebidas" },
          "partner": { "name": "Distribuidora X" }
        },
        "quantity": 2,
        "priceAtAdd": 2000
      }
    ],
    "totalAmount": 4000
  }
}
```

---

### POST `/cart`
Adicionar produto(s) ao carrinho.

**Body (JSON):**
```json
{
  "items": [
    { "productId": "69db9217de482cd75a3d6793", "quantity": 2 },
    { "productId": "69db9217de482cd75a3d6794", "quantity": 1 }
  ]
}
```

---

### DELETE `/cart`
Remover/reduzir produto(s) do carrinho.

**Body (JSON):**
```json
{
  "items": [
    { "productId": "69db9217de482cd75a3d6793", "quantity": 1 }
  ]
}
```
> Se a quantidade chegar a 0, o item é removido automaticamente.

---

## 🚚 Taxa de Entrega

### POST `/delivery`
Calcular taxa de entrega antes de finalizar o pedido.

**Body (JSON):**
```json
{
  "latitude": -8.8368,
  "longitude": 13.2343
}
```

**Resposta:**
```json
{
  "status": true,
  "data": {
    "distanceKm": "4.73",
    "deliveryFee": 1210,
    "freeDelivery": false
  }
}
```

> Entrega grátis para distâncias até **2km** da loja.

**Tabela de cálculo:**
| Distância | Cálculo | Total |
|-----------|---------|-------|
| até 2km | grátis | 0 Kz |
| 3km | 500 + (3 × 150) | 950 Kz |
| 5km | 500 + (5 × 150) | 1.250 Kz |
| 10km | 500 + (10 × 150) | 2.000 Kz |
| +30km | teto máximo | 5.000 Kz |

---

## ✅ Checkout

### POST `/checkout`
Finalizar pedido. Exige autenticação.

**Body (JSON):**
```json
{
  "payment": "tpa",
  "contactName": "João Silva",
  "phoneNumber": "923456789",
  "street": "Rua das Flores",
  "city": "Luanda",
  "coordinates": {
    "latitude": -8.8368,
    "longitude": 13.2200
  }
}
```

**Métodos de pagamento aceites:** `tpa`, `cash`, `transferencia`

**Resposta:**
```json
{
  "status": true,
  "message": "Pedido realizado com sucesso.",
  "data": {
    "numero_pedido": "ORD-1776008378866-720",
    "id_pedido": "69dbbcba659c24b3759db5a7",
    "subtotal": 4000,
    "deliveryFee": 1100,
    "total": 5100
  }
}
```

> ⚠️ O carrinho é limpo automaticamente após o checkout.

---

## 📋 Pedidos

### GET `/orders`
Listar pedidos do utilizador autenticado.

**Resposta:**
```json
{
  "status": true,
  "total": 1,
  "data": [
    {
      "_id": "...",
      "orderNumber": "ORD-1776008378866-720",
      "status": "pending",
      "statusLabel": "Aguardando confirmação",
      "paymentMethod": "tpa",
      "createdAt": "2026-04-12T15:39:38.871Z",
      "shippedAt": null,
      "deliveredAt": null,
      "entrega": {
        "contactName": "João Silva",
        "phoneNumber": "923456789",
        "street": "Rua das Flores",
        "city": "Luanda"
      },
      "items": [
        {
          "productName": "Sumol",
          "category": "Bebidas",
          "unitPrice": 2000,
          "quantity": 2,
          "totalItem": 4000
        }
      ],
      "totalItens": 1,
      "resumoFinanceiro": {
        "subtotal": 4000,
        "deliveryFee": 1100,
        "discount": 0,
        "total": 5100
      }
    }
  ]
}
```

---

### GET `/orders/all?page=1&limit=10&status=pending`
Listar todos os pedidos. **Apenas admin.**

**Query params:**
| Param | Tipo | Obrigatório |
|-------|------|-------------|
| page | number | ❌ (padrão: 1) |
| limit | number | ❌ (padrão: 10) |
| status | string | ❌ (filtro por status) |

---

### PATCH `/orders/:id/status`
Atualizar status do pedido. **Apenas admin.**

**Body (JSON):**
```json
{ "status": "confirmed" }
```

**Fluxo de status permitido:**
```
pending → confirmed → shipped → delivered
pending → canceled
confirmed → canceled
```

**Status e labels:**
| Status | Label |
|--------|-------|
| pending | Aguardando confirmação |
| confirmed | Confirmado |
| shipped | Em entrega |
| delivered | Entregue |
| canceled | Cancelado |

---

## 📍 Coordenadas da Loja

> Apenas admin.

### GET `/store`
Buscar coordenadas da loja.

### POST `/store`
Cadastrar coordenadas da loja.

**Body (JSON):**
```json
{
  "name": "Casa Cheia",
  "latitude": -8.8368,
  "longitude": 13.2343
}
```

### PUT `/store`
Atualizar coordenadas.

### DELETE `/store`
Remover coordenadas.

---

## 🖼️ Servir Imagens (Desenvolvimento)

As imagens são servidas estaticamente pelo servidor:

```
http://SEU_IP:PORTA/uploads/products/NOME_DO_ARQUIVO.png
```

**Exemplos:**
```
http://192.168.1.100:3000/uploads/products/1775997813605-947394411.png
http://192.168.1.100:3000/uploads/products/1775997813628-717987972.png
```

> Em produção as imagens são hospedadas no **ImgBB** e a URL completa já vem na resposta.

---

## ❌ Erros comuns

| Código | Significado |
|--------|-------------|
| 400 | Dados inválidos ou campo em falta |
| 401 | Não autenticado (token em falta ou expirado) |
| 403 | Sem permissão (ex: rota de admin) |
| 404 | Recurso não encontrado |
| 500 | Erro interno no servidor |

**Formato padrão de erro:**
```json
{
  "status": false,
  "message": "Descrição do erro"
}
```

---

## 📝 Notas Gerais

- Rotas com upload de imagens devem usar **multipart/form-data**
- Rotas sem upload devem usar **application/json**
- O campo `address` em multipart deve ser enviado como **string JSON**: `{"street":"Rua X","city":"Luanda"}`
- O token JWT deve ser enviado no header: `Authorization: Bearer <token>`
- Imagens: formatos aceites são `.png`, `.jpg`, `.jpeg`, `.webp` com tamanho máximo de **5MB** por ficheiro


------------------------------------------------------------------------------------------------------------






### 📂 Módulo de Parceiros (Partners)
Implementação completa do CRUD com validações avançadas:
- **Criação e Atualização:** Suporte a dados fiscais (NIF) e geográficos (Províncias de Angola).
- **Busca Global:** Endpoint inteligente que permite pesquisar parceiros por **Nome** ou **NIF** em uma única.
- **Status Management:** Controle de estados do parceiro (`active`, `inactive`, `suspended`).

## 🚀 Endpoints Principais

### Parceiros
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/partners` | Cadastra um novo parceiro |
| `GET` | `/partners` | Lista todos os parceiros cadastrados |
| `GET` | `/partners/:id` | Obtém detalhes de um parceiro específico |
| `GET` | `/partners/search` | Busca por termo (Nome ou NIF) via Query Param |
| `PATCH` | `/partners/:id` | Atualização parcial de dados (Validação Joi) |
| `DELETE` | `/partners/:id` | Remove um parceiro do sistema |

---

### Criar Parceiro (`POST /partners`)
https://backend-casacheia.onrender.com/api/partners
```json
nota: use o form-data
{
  "name": "Empresa Exemplo Lda",
  "email": "contato@exemplo.ao",
  "nif": "5400123456",
  "phone": "923000111",
	"images": "aqui vem as imagens"
  "address": {
    "street": "Via AL15",
    "city": "Talatona",
    "province": "Luanda"
  }
}
###
ATUALIZAR NOME DO USUARIO
Método: PATCH : https://casa-fscp.onrender.com/api/users/me
{

	"name": "Novo Nome"	
}

ATUALIZAR TELEFONE DO USUARIO
Método: PATCH : https://casa-fscp.onrender.com/api/users/me/telefone
{

	"telefone": "979935479"	
}

NOTA: sera enviado novo codigo de 6 digitos para este numero de telefone

Método: PATCH : https://casa-fscp.onrender.com/api/users/me/verify-number
{

	{
	"telefone": "979935479",
	"code": "994836"
}


Listar somente usuarios com role=user
Método: GET : https://casa-fscp.onrender.com/api/users
<img width="1375" height="887" alt="1" src="https://github.com/user-attachments/assets/8443a9fd-8ee4-470d-b825-ee87f7f3ce06" />


{

	Precisa estar autenticado como Admin
	o limte e o page sao Opcionais
}

-----------------------------------------
Listar Todo tipo de usuarios
Método: GET : https://casa-fscp.onrender.com/api/users/all

<img width="1362" height="835" alt="2" src="https://github.com/user-attachments/assets/bd2dd708-a203-4eb0-938c-191a36cf58df" />

{

	Precisa estar autenticado como Admin
	o limte e o page sao Opcionais
}

Esqueci a minha Senha (GERAR Codigo)

Método: POST : https://casa-fscp.onrender.com/api/auth/forgot-password

{

	"telefone": "937579318"
}

-------------------------------------

Esqueci a minha Senha (JA TEM O CODIGO EM POSSE)

Método: POST : https://casa-fscp.onrender.com/api/auth/reset-password

{

	"telefone": "937579318",
	"password": "luanda123456",
	"code": "301641"
}

-----------------------------------

Cadastro de Usuário

Método: POST : https://casa-fscp.onrender.com/api/auth/register

Campos obrigatórios:

name: Nome completo do usuário

telefone: Número de telefone

role: Pode ser user ou admin, se nao informar sera cadastrado como user

password: Senha escolhida pelo usuário

Resposta de sucesso: Retorna os dados do usuário cadastrado.

MODELO: 

{

    "name": "Samuel Gomes",
		"telefone": "111111111",
		"password": "samuel1234",
    "role": "user"
}
---------------------------------

Login de Usuário

Método: POST

Rota: https://casa-fscp.onrender.com/api/auth/login

Campos obrigatórios:

email

password

Resposta de sucesso: Retorna os dados do usuário logado e um token JWT, que deve ser usado para acessar rotas protegidas.
MODELO: 
{

		"telefone": "111111111",
		"password": "samuel1234"
}
-----------------------------------------------------------------
Logout de Usuário NOTA (EM ATUALIZACAO, SERVICO INDISPONIVEL)

Método: POST

Rota: /auth/logout

Observação: O logout apenas invalida o token no front-end. O back-end não guarda sessões.

----------------------------------------------

Perfil do Usuário

Método: GET

Rota: https://casa-fscp.onrender.com/api/auth/profile

Protegida: Sim (necessário enviar o token JWT no cabeçalho Authorization).

Retorna: Dados do usuário autenticado, incluindo id, nome, e-mail, telefone e role.

EXEMPLO:
{

	"status": true,
	"user": {
		"name": "Samuel Gomes",
		"telefone": "111111111",
		"role": "user",
		"createdAt": "2025-12-16T14:24:40.501Z",
		"updatedAt": "2025-12-16T14:24:40.501Z",
		"__v": 0
	}
	
}
------------------------------------------

Perfil do Usuário (ATUALIZAR PASSWORD)

Método: PATCH

Rota: https://casa-fscp.onrender.com/api/auth/profile/password

Protegida: Sim (necessário enviar o token JWT no cabeçalho Authorization).

Retorna:

{

    "status": false,
    "message": "sua senha antiga esta incorreta!"
}

EXEMPLO DO JSON A SER ENVIADO:

{

    "newPassword": "angola1234",
    "currentPassword": "luanda12349"
}

----------------------------------------------

🛒 Produtos

Cadastro de Produto

Método: POST

Rota: https://casa-fscp.onrender.com/api/products

NOTA: O body precisa ser form-data

Campos obrigatórios:

name: Nome do produto

price: Valor numérico (em Kz)

category: Categoria do produto

stock: Quantidade em estoque

description: Descrição detalhada do produto

NOTA: o campo category deve ser preenchido com o ID da sua categoria e nao pelo nome

images: type: file

----------------------------------------------

Listagem de Produtos

Método: GET

Rota: https://casa-fscp.onrender.com/api/products

Retorna: Lista de todos os produtos cadastrados.

Rota: https://casa-fscp.onrender.com/api/products?page=2&limit=6

Retorna: Paginacao de produtos.

-----------------------------------------------

Detalhes de um Produto

Método: GET

Rota: https://casa-fscp.onrender.com/api/products/getbyid/id

nota: id deve ser parecido a este 69402a52b943ed00fa46b7ed

Retorna: Dados completos de um produto específico.

---------------------------------------------------------

Atualizar Produto

Método: PATCH

Rota: https://casa-fscp.onrender.com/api/products/id

Permite: Alterar informações já cadastradas de um produto.

---------------------------------------------------------

Excluir Produto

Método: DELETE

Rota: https://casa-fscp.onrender.com/api/products/id

Permite: Remover um produto do banco de dados.

---------------------------------------------------------

Buscar Produtos pelo nome

Método: GET

Rota: https://casa-fscp.onrender.com/api/products/search?name=algumacoisa

Permite: Buscar os produtos pelos seus nomes.

⚠️ Observações importantes Deve passar o parametro search

----------------------------------------------------------

CATEGORIAS

Cadastrar:

Metodo: POST

Rota: https://casa-fscp.onrender.com/api/categories

EXEMPLO: 
{

	"name": "Bebidas",
    "description": "Produtos Bebiveis"
}

-------------------------------------------------------------

Listar todas as Categorias

Metodo: GET

Rota: https://casa-fscp.onrender.com/api/categories

--------------------------------------------------

Buscar categoria por id

Metodo: GET

Rota: https://casa-fscp.onrender.com/api/categories/id

--------------------------------------------------

Atualizar Categoria por id

Metodo: PATCH

Rota: https://casa-fscp.onrender.com/api/categories/id

-----------------------------------------------------

Buscar Categoria por nome

Metodo: GET

Rota: https://casa-fscp.onrender.com/api/categories/?search=bebidas

-----------------------------------------------------

-----------------------------------------------------

Deletar Categoria por ID

Metodo: DELETE

Rota: https://casa-fscp.onrender.com/api/categories/id

-----------------------------------------------------

Carrinho
Guardar produtos no carrinho (Banco de Dados) -> Obrigatorio para permitir o checkout

Metodo: POST

Rota: https://casa-fscp.onrender.com/api/cart

Modelo: 
{

    "items": [
        {
        "productId": "6941b57dcb8789ee253b388c",
        "quantity": 4,
        "priceAtAdd": 500
    },
    {
        "productId": "6941b56acb8789ee253b3889",
        "quantity": 6,
        "priceAtAdd": 1500
    }
    ]

}

----------------------------------

Listar produtos do Carrinho

Metodo: GET

Rota: https://casa-fscp.onrender.com/api/cart

REPOSTA: 

{

    "status": true,
    "carrinho": [
        {
            "_id": "6941c84e93e9d63492b5e738",
            "user": "694145ecbd5487799964d7e6",
            "items": [
                {
                    "product": "6941b57dcb8789ee253b388c",
                    "quantity": 4,
                    "priceAtAdd": 240,
                    "_id": "6941c84e93e9d63492b5e73b"
                },
                {
                    "product": "6941b56acb8789ee253b3889",
                    "quantity": 6,
                    "priceAtAdd": 515,
                    "_id": "6941c84e93e9d63492b5e73c"
                }
            ],
            "totalAmount": 4050,
            "createdAt": "2025-12-16T20:59:58.177Z",
            "updatedAt": "2025-12-16T20:59:58.177Z",
            "__v": 0
        }
    ]
}

--------------------------------------

Remover Carrinho em Atualizacao Futura

----------------------------------------------------

FAZER  CHECKOUT

Metodo: POST

Rota: https://casa-fscp.onrender.com/api/orders/checkout

NOTA: Deve preencher o endereco de entrega

MODELO:

{

	"payment": "tpa",
    "contactName": "Quimbuadi",
    "phoneNumber": "937579318",
    "street": "Malueka",
    "city": "Luanda"
}

Resposta:

{

    "status": true,
    "message": "Pedido bem Succedido!",
    "Numero do Pedido": "ORD-1765922661503-588",
    "Id_Pedido": "6941d7654c58987722a0050f"
}

-----------------------------------------------------

Ver Estado Do Pedido (Cliente)

Metodo: GET

Rota: https://casa-fscp.onrender.com/api/orders/my-orders

Resposta:

[

    {
        "_id": "6941d7654c58987722a0050f",
        "orderNumber": "ORD-1765922661503-588",
        "total": 4050,
        "status": "pending",
        "items": [
            {
                "productId": "6941b57dcb8789ee253b388c",
                "productName": "Sumo de Laranja",
                "price": 240,
                "quantity": 4
            },
            {
                "productId": "6941b56acb8789ee253b3889",
                "productName": "Sumo de Limao",
                "price": 515,
                "quantity": 6
            }
        ]
    }
	
]

--------------------------------------

LISTAR TODOS OS PEDIDOS (ADMIN)

Metodo: GET

Rota: https://casa-fscp.onrender.com/api/orders/all

-----------------------------------------------

ATUALIZAR STATUS DO PEDIDO

Metodo: PATCH

Rota: https://casa-fscp.onrender.com/api/orders/id/status

NOTA: id = 69407197e29243ead76d8310/status
MODELO:
{
	"status": "canceled"
}

['pending', 'confirmed', 'shipped', 'delivered', 'canceled']


