# @sudobility/screenwriter_types

Shared TypeScript types and Zod v4 schemas for the **ViaInk** screenwriting app, imported by both
the frontend and the backend so request/response shapes stay in sync.

Platform-free ESM: no DOM, no Node built-ins, no clock reads. Consumers import from the package root
(`@sudobility/screenwriter_types`), plus the `/test` and `/keys` subpath entry points.

## What's inside

- **API envelope** — `successResponse`, `errorResponse`, `API_ERROR_CODES`, `ERROR_STATUS`, cursor
  pagination (`cursorQuerySchema`, `Paginated`) and the `API_ROUTES` table (`src/api/`)
- **Domain DTOs & request schemas** — workspaces/tenancy, projects, documents, templates, versions,
  snapshots, commands, `/me`, account preferences, lifecycle (folders/trash/bin), sharing,
  reads/search, reports, packets, AI, credits, io (import/export/watermark), public and admin
- **Role/permission matrix** — `ROLE_PERMISSIONS`, `hasPermission`, `roleAtLeast`, … (`src/tenancy/`)
- **Sync protocol** — WebSocket frame schemas, message codes and close codes (`src/sync/`)
- **Fixture factories** — `makeWorkspace`, `makeProject`, `makeDocumentMeta`, … under the `/test`
  entry point

See `CLAUDE.md` for the full module-by-module map.

## Install

This package is published to **GitHub Packages** under the `@sudobility` scope. The repo's `.npmrc`
points the scope at `https://npm.pkg.github.com`; authenticate with a GitHub token that has
`read:packages` before installing.

```bash
bun install
```

It depends on `@sudobility/writing_core` (ids, `DOCUMENT_KINDS`, `TemplateCategory`) and
`@sudobility/types`, both resolved as ordinary npm dependencies. For local cross-repo development,
tooling will **prefer a sibling `../writing_core` checkout** when one exists (see "Local dev" below).

## Commands

```bash
bun run build       # vite library build + emit .d.ts (tsconfig.build.json) -> dist/
bun run typecheck   # tsc --noEmit
bun run test:unit   # vitest run  (one-shot; use test:watch to watch)
bun run lint        # eslint src
bun run format      # prettier --write src/**/*.ts
bun run clean       # rimraf dist
```

This is a types/schemas library — there is no app to "run"; consumers import it. The build emits
three tree-shaken ESM entry points (`index`, `test`, `keys`) plus declarations into `dist/`.

> Use the `bun run` scripts (or `bunx vitest run`) — do not use `bun test`, which is Bun's own
> runner, not Vitest.

## Local dev (cross-repo)

`vitest.config.ts` and `tsconfig.json` alias `@sudobility/writing_core` to `../writing_core/src`
when that sibling repo is checked out, so you can edit both repos together without reinstalling.
When no sibling is present (e.g. CI, downstream installs), it falls back to the published npm
dependency. The `build` step always resolves `writing_core` from `node_modules`
(`tsconfig.build.json` clears the `paths` override) so declaration output stays self-contained.

## Usage

```ts
import { successResponse, documentCreateSchema } from '@sudobility/screenwriter_types';

const body = documentCreateSchema.parse({ title: 'Draft', kind: 'script' });
return successResponse(body);
```

## License

BUSL-1.1
