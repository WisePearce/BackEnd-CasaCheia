# Postman — Casa Cheia API

Coleções no formato **v3 (Git-native)**: cada pedido/exemplo é um ficheiro YAML
separado, revisível em PR.

```
postman/
├── collections/
│   └── Casa Cheia - Autenticação/
│       ├── register.request.yaml          # POST /api/register
│       ├── register-verify.request.yaml   # POST /api/register/verify
│       └── .resources/
│           ├── definition.yaml
│           ├── register.resources/examples/
│           └── register-verify.resources/examples/
└── environments/
    └── Casa Cheia - Local.environment.yaml
```

## Correr o fluxo de registo

1. Arranca a API (`npm run dev`) e confirma que MongoDB e Redis estão acessíveis.
2. Seleciona o environment **Casa Cheia - Local**.
3. Ajusta `user_name`, `user_phone` e `user_password` se necessário.
   O telefone tem de ter 9 dígitos, ainda não estar registado e conseguir
   receber SMS.
4. Corre o pedido **Register — enviar código SMS**. Ele guarda o telefone na
   variável `verify_phone` quando a resposta é 200.
5. Lê o código de 6 dígitos no SMS e coloca-o em `verification_code`
   (variável secreta).
6. Corre **Verify — confirmar código SMS**. Em caso de 201, o JWT fica em
   `auth_token`.

Pela CLI:

```bash
postman collection run "postman/collections/Casa Cheia - Autenticação" \
  -e "postman/environments/Casa Cheia - Local.environment.yaml" \
  --env-var "verification_code=123456"
```

## Limitações do fluxo

- O código é gerado aleatoriamente e guardado **apenas como hash argon2** no
  Redis (`new-user: <telefone>`, TTL 10 min). Não é possível recuperá-lo do
  Redis; só o SMS o contém.
- Cada código permite no máximo **3 tentativas**; à quarta, o registo é apagado
  e a resposta é 429 — é preciso repetir o Register.
- `POST /register` pode devolver 422 se o telefone já existir na base de dados.
  Usa outro número para testar o caminho feliz.
- Os exemplos guardados descrevem o contrato (sucesso, 400, 422 e 429). O
  pedido de Verify usa as variáveis de ambiente, por isso os exemplos não são
  executados automaticamente pelo `collection run`.

## Validar alterações

```bash
postman collection lint "postman/collections/Casa Cheia - Autenticação"
postman environment lint postman/environments --fail-severity warning
```
