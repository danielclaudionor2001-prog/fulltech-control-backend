# Fulltech Control Backend

Antes de comecar novos desenvolvimentos, consulte junto com a IA o repositorio de documentacao chamado `fulltech-control-wiki-code`.

## Visao geral

API NestJS responsavel por:

- autenticacao local baseada em token do Clerk;
- autorizacao por roles internas;
- allowlist de e-mails;
- cadastro de clientes;
- regras de ordem de servico;
- validacao de localizacao no inicio do atendimento;
- integracao inicial de WhatsApp;
- persistencia com Prisma e Postgres.

## Scripts principais

```bash
npm install
npx prisma generate
npx prisma db push
npm run build
```

Para desenvolvimento manual local, o projeto tambem possui:

```bash
npm run start:dev
```

## Variaveis importantes

- `DATABASE_URL`
- `CLERK_SECRET_KEY`
- `CLERK_JWT_KEY`
- `CLERK_FIRST_ADMIN_EMAIL`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `WHATSAPP_FROM`
- `WHATSAPP_TO`

## Modulos e arquivos importantes

- `src/auth/`
- `src/users/`
- `src/access-list/`
- `src/customers/`
- `src/service-orders/`
- `src/locations/`
- `src/whatsapp/`
- `prisma/schema.prisma`

## Regra de documentacao

Sempre que alterar auth, schema, DTO, endpoint, localizacao, WhatsApp ou regra de OS, atualize tambem o repositorio `fulltech-control-wiki-code`.
