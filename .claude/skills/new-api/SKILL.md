---
name: new-api
description: Crea un nuevo API route en cozyNook siguiendo el patrón del proyecto (Next.js App Router + Supabase + Zod). Úsala cuando el usuario quiera añadir un endpoint nuevo.
argument-hint: <recurso> [operaciones: get,post,patch,delete]
---

Crea un nuevo API route para el recurso `$ARGUMENTS` en cozyNook.

## Ubicación

`apps/web/src/app/api/<recurso>/route.ts`
Para rutas con parámetros: `apps/web/src/app/api/<recurso>/[id]/route.ts`

## Patrón estándar de un route.ts

```ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '../../../lib/supabase/admin';
// Ajustar la ruta relativa según la profundidad

const createSchema = z.object({
  field: z.string().min(1).max(200),
  // ...
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('tabla')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.issues },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('tabla')
      .insert(parsed.data)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
    );
  }
}
```

## Patrón para rutas con parámetro [id]

```ts
interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  // ...
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  // ...
}
```

## Reglas obligatorias

- Siempre usar `getSupabaseAdmin()` (nunca cliente browser en rutas)
- Siempre validar con Zod antes de escribir en la DB
- Siempre envolver en `try/catch`
- Siempre retornar `{ error: string }` con el status HTTP correcto en errores
- Usar `.catch(() => null)` en `request.json()` para manejar body vacío
- Para joins: `.select('*, tabla_rel:tabla(id, nombre)')`
- Para upsert: `.upsert(data, { onConflict: 'campo_unique' })`
- Queries de lista: añadir `.order(...)` siempre
- Filtros opcionales por query param: leer con `new URL(request.url).searchParams`

## Convenciones de respuesta HTTP

- GET lista → 200 con array (nunca null, usar `?? []`)
- GET individual → 200 o 404 si no existe
- POST → 201 con el recurso creado
- PATCH/PUT → 200 con el recurso actualizado
- DELETE → 200 con `{ ok: true }`
- Error de validación → 400
- Error de servidor → 500
