📌 Documentação da API – Casa Cheia
🌍 Endereço base da API
Importante: Ainda falta muita coisa, validacoes dos campos e muitas rotas ainda nao foram implementadas
A aplicação está hospedada em:
https://casa-fscp.onrender.com

🔑 Autenticação

Cadastro de Usuário

Método: POST

Rota: /auth/signup

Campos obrigatórios:

name: Nome completo do usuário

email: E-mail válido

telefone: Número de telefone

role: Pode ser user ou admin

password: Senha escolhida pelo usuário

Resposta de sucesso: Retorna os dados do usuário cadastrado.

Login de Usuário

Método: POST

Rota: /auth/signin

Campos obrigatórios:

email

password

Resposta de sucesso: Retorna os dados do usuário logado e um token JWT, que deve ser usado para acessar rotas protegidas.

Logout de Usuário

Método: POST

Rota: /auth/logout

Observação: O logout apenas invalida o token no front-end. O back-end não guarda sessões.

👤 Usuário

Perfil do Usuário

Método: GET

Rota: /profile

Protegida: Sim (necessário enviar o token JWT no cabeçalho Authorization).

Retorna: Dados do usuário autenticado, incluindo id, nome, e-mail, telefone e role.

🛒 Produtos

Cadastro de Produto

Método: POST

Rota: /products

Campos obrigatórios:

name: Nome do produto

price: Valor numérico (em Kz)

category: Categoria do produto

stock: Quantidade em estoque

description: Descrição detalhada do produto

Listagem de Produtos

Método: GET

Rota: /products

Retorna: Lista de todos os produtos cadastrados.

Detalhes de um Produto

Método: GET

Rota: /products/:id

Retorna: Dados completos de um produto específico.

Atualizar Produto

Método: PUT

Rota: /products/:id

Permite: Alterar informações já cadastradas de um produto.

Excluir Produto

Método: DELETE

Rota: /products/:id

Permite: Remover um produto do banco de dados.

⚠️ Observações importantes para o front-end

Todas as rotas que exigem autenticação devem enviar o token JWT no cabeçalho da requisição:
Authorization: Bearer <token>

O campo role só aceita os valores "user" ou "admin".

O campo price deve ser sempre um número representando o valor em Kz.

O campo stock deve ser um número inteiro representando a quantidade disponível.
