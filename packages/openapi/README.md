# @ezroot/openapi

OpenAPI-spec og genererede TypeScript-typer til Route Guide API.

## Codegen

Generér typer fra `openapi.yaml`:

```bash
pnpm run codegen
```

Output: `generated/schema.d.ts` (paths, components, operations).

Fra monorepo-root:

```bash
pnpm -C packages/openapi run codegen
```

## Brug i apps/web

Importer typer og brug med openapi-fetch:

```ts
import type { paths } from '@ezroot/openapi/generated/schema';
import createClient from 'openapi-fetch';

const client = createClient<paths>({ baseUrl: process.env.NEXT_PUBLIC_API_URL });
```

Kør codegen efter ændringer i `openapi.yaml`, så typene matcher backend.
