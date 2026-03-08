---
name: migration
description: Genera el SQL de migración para Supabase en cozyNook. Úsala cuando el usuario necesite crear o modificar tablas, añadir columnas, crear índices o ajustar constraints en la base de datos.
argument-hint: <descripción de lo que necesitas>
---

Genera el SQL de migración para Supabase basándote en: `$ARGUMENTS`

## Convenciones del proyecto

### Tipos de columnas estándar
- IDs: `uuid default gen_random_uuid() primary key`
- Timestamps: `timestamptz default now() not null`
- Texto corto: `text not null` con CHECK de longitud si aplica
- Texto opcional: `text`
- Números: `integer not null default 0` o `numeric`
- Booleanos: `boolean not null default false`
- FK obligatoria: `uuid not null references tabla(id) on delete cascade`
- FK opcional: `uuid references tabla(id) on delete set null`

### Estructura base de una tabla nueva

```sql
create table public.nombre_tabla (
  id              uuid        default gen_random_uuid() primary key,
  -- campos específicos aquí
  created_at      timestamptz default now() not null
);

-- RLS (siempre activar)
alter table public.nombre_tabla enable row level security;

-- Política permisiva para uso interno (ajustar según necesidades)
create policy "allow all" on public.nombre_tabla
  for all using (true) with check (true);

-- Índices (orden: tablespace ANTES de where)
create index nombre_tabla_campo_idx
  on public.nombre_tabla using btree (campo)
  tablespace pg_default;

-- Índice parcial (si aplica)
create index nombre_tabla_activos_idx
  on public.nombre_tabla using btree (created_at desc)
  tablespace pg_default
  where campo_condicion is null;
```

### Modificaciones a tablas existentes

```sql
-- Añadir columna
alter table public.tabla add column nueva_col text;

-- Hacer columna nullable
alter table public.tabla alter column col drop not null;

-- Añadir constraint
alter table public.tabla add constraint nombre_check
  check (col_a is not null or col_b is not null);

-- Añadir FK
alter table public.tabla add column item_id uuid references public.items(id) on delete cascade;
```

## Reglas importantes

- `tablespace pg_default` siempre ANTES de `where` en índices parciales
- Activar RLS en todas las tablas nuevas
- Usar `cascade` en FKs hacia recursos "padre" (si se borra el item, se borran sus loans)
- Usar `set null` en FKs opcionales
- Nombres en snake_case
- Prefijo `public.` en todos los nombres de tabla
- Los índices parciales mejoran rendimiento en filtros frecuentes (ej: `where returned_at is null`)

## Tablas existentes en el proyecto

- `public.items` — id, name, description, category, room, spot, tags[], image_url, stock jsonb, created_at
- `public.rooms` — id, name, description, image_url, created_at
- `public.shopping_list` — id, item_id (nullable FK→items), custom_name, quantity_needed, checked, checked_at, note, created_at
- `public.stock_alerts` — id, item_id (unique FK→items), min_quantity, enabled, created_at
- `public.loans` — id, item_id (FK→items), lent_to, note, lent_at, returned_at

Genera el SQL listo para ejecutar en el SQL Editor de Supabase.
