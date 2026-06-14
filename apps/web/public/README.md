# public/

Assets estáticos servidos pelo Vite na raiz (`/`).

## `farofa.jpg` (foto de exemplo do tutorial — F10)

O modal de demonstração (`DemoModal`) gera uma figurinha de exemplo a partir de
`/farofa.jpg`. **Este arquivo não é versionado neste repositório** (ver `.gitignore`).

O canônico vive no monorepo de infra em `apps/gwan-fifa/farofa.jpg` e é copiado
para cá pelo `make.ps1` (alvos `setup`/`dev`). Para rodar só o frontend sem o
`make.ps1`, copie manualmente um retrato para `public/farofa.jpg`.

Use sempre um retrato **com direito de uso** (foto própria, de modelo liberado
ou royalty-free). **Nunca** fotos/figurinhas/logos oficiais de terceiros
(Panini/FIFA/clubes/atletas) — ver `RN-F10-01` / `NFR-IP-01` no SDD.

Sem o arquivo, o tutorial degrada com elegância: o passo 4 exibe um aviso e o
restante da página segue funcionando.
