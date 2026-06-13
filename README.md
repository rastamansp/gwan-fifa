# Gwan FIFA

Gerador de figurinha estilo FIFA/Panini: o usuário envia uma foto + dados e recebe uma figurinha personalizada (PNG) para download. A análise da imagem usa a **Claude API** (visão — não gera imagem); a composição usa `sharp`; os assets ficam no **MinIO** (S3).

> Especificação canônica (SDD) no monorepo de infra: `gwan-infra/apps/gwan-fifa/docs/spec/`.

## Stack

- **Monorepo:** Turborepo + npm workspaces
- **`apps/api`:** NestJS 10 — Clean Architecture (domain / application / infrastructure / presentation)
- **`apps/web`:** React 18 + Vite + TS (strict)
- **`packages/core`:** tipos + schemas Zod compartilhados (`@gwan-fifa/core`)

## Estrutura

```
gwan-fifa/
├── apps/
│   ├── api/        # NestJS  -> api-fifa.gwan.cloud (dev :3015)
│   └── web/        # Vite    -> fifa.gwan.cloud     (dev :5188)
└── packages/
    └── core/       # @gwan-fifa/core (Zod + contratos)
```

## Desenvolvimento

```bash
npm install
cp .env.example .env   # preencha ANTHROPIC_API_KEY + credenciais MinIO
npm run dev            # API :3015 + Web :5188 (slot 15)
```

| Comando | O quê |
|---------|-------|
| `npm run dev` | sobe API + Web (Turborepo) |
| `npm run build` | builda core → api → web |
| `npm run typecheck` | typecheck de todos os pacotes |

Healthcheck da API: `GET http://localhost:3015/api/health` → `{ "status": "ok" }`.

## Status

**F00 — scaffold.** Monorepo, Clean Architecture (ports + DI), `packages/core` e casca da web prontos. Adapters (Claude/`sharp`/MinIO) e telas são **stubs** — implementados nas features F01–F06. Ver o SDD.

## Variáveis de ambiente

Ver [`.env.example`](.env.example). `ANTHROPIC_API_KEY` e credenciais MinIO ficam **só no backend** — nunca no client.
