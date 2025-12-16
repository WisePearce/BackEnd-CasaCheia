📌 Documentação da API – Casa Cheia


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

-----------------------------------------------

Detalhes de um Produto

Método: GET

Rota: https://casa-fscp.onrender.com/api/products/id

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

Rota: https://casa-fscp.onrender.com/api/products?search=laranja

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


