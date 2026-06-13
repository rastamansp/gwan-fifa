# Gwan FIFA

> Gerador de figurinha estilo FIFA/Panini, parte do ecossistema [gwan.cloud](https://gwan.cloud).

## O que é

O usuário envia uma **foto + dados pessoais** (nome, nascimento, altura, peso, clube, país) e recebe uma **figurinha personalizada** no estilo de álbum esportivo, pronta para download. A análise da imagem usa a **Claude API** (visão/interpretação — não gera imagem); a composição final usa `sharp`; os assets ficam no **MinIO** (S3 compartilhado da infra GWAN).

## Status

| Ambiente | URL | Estado |
|----------|-----|--------|
| Web (produção) | https://worldcup.gwan.cloud | 🔴 não deployado |
| API (produção) | https://api-worldcup.gwan.cloud/api | 🔴 não deployado |
| Código | **F00 — scaffold** (monorepo + Clean Architecture; adapters/telas stub) | 🟡 em desenvolvimento |

## Stack

- **Monorepo:** Turborepo + npm workspaces
- **`apps/api`** — NestJS 10, **Clean Architecture** (domain / application / infrastructure / presentation), ports & adapters
- **`apps/web`** — React 18 + Vite + TypeScript (strict)
- **`packages/core`** — tipos + schemas Zod compartilhados (`@gwan-fifa/core`)
- **Integrações:** Claude (visão) · `sharp` (composição) · MinIO (S3)

## Como rodar localmente

```bash
npm install
cp .env.example .env   # preencha ANTHROPIC_API_KEY + credenciais MinIO
npm run dev            # API :3015 + Web :5188 (slot 15)
```

Healthcheck da API: `GET http://localhost:3015/api/health` → `{ "status": "ok" }`.

No monorepo de infra (Windows): `cd apps/gwan-fifa && .\make.ps1 setup` → `install` → `dev`.

## Documentação

- **Especificação canônica (SDD)** — vive no repositório de infra: [`gwan-infra/apps/gwan-fifa/docs/spec/`](https://github.com/rastamansp/gwan-infra/tree/main/apps/gwan-fifa/docs/spec)
  - Comportamento das features (F00–F09), contratos REST, arquitetura backend/frontend e NFRs.
- **README do repositório** — [README.md](https://github.com/rastamansp/gwan-fifa/blob/main/README.md)

## Roadmap (resumo)

| Fase | Entrega |
|------|---------|
| **MVP** | Página única → `POST /api/generate` → análise Claude + composição `sharp` + MinIO → preview/download. Job em memória. |
| **Fase 2** | Fila durável BullMQ + Redis; lifecycle/TTL no MinIO; rate-limit. |
| **Fase 3** | Geração real de imagem (image-gen provider) — opcional. |

## Links

- Repositório: <https://github.com/rastamansp/gwan-fifa>
- Infra / orquestração: [gwan-infra](https://github.com/rastamansp/gwan-infra)
- Site institucional: <https://gwan.cloud>
