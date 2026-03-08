---
name: new-page
description: Crea una nueva página de Next.js en cozyNook siguiendo el patrón del proyecto (page.tsx + page.styles.ts separado). Úsala cuando el usuario quiera añadir una nueva ruta/pantalla a la app.
argument-hint: <ruta> [descripción breve]
---

Crea una nueva página para la ruta `$ARGUMENTS` en cozyNook siguiendo estrictamente estos patrones del proyecto:

## Convenciones obligatorias

- **Dos archivos siempre**: `page.tsx` + `page.styles.ts` en el mismo directorio
- La página vive en `apps/web/src/app/<ruta>/`
- `'use client'` al principio si tiene interactividad (hooks, eventos)
- Todos los `styled` van en `page.styles.ts`, **nunca** inline en el tsx
- Importar estilos desde `./page.styles`
- Usar el tema via `${({ theme }) => theme.xxx}` (nunca valores hardcoded)

## Tokens de tema disponibles

```ts
theme.fontFamily.heading   // Lora
theme.fontFamily.body      // DM Sans
theme.fontSize.xs | sm | base | lg | xl | 2xl | 3xl
theme.fontWeight.medium | semibold
theme.colors.bark          // marrón oscuro principal
theme.colors.taupe         // gris cálido (texto secundario)
theme.colors.parchment     // fondo cálido claro
theme.colors.cream         // borders y separadores
theme.colors.white         // cards
theme.colors.terracotta    // errores/danger
theme.colors.sand
theme.radii.sm | md | lg | xl
theme.shadow.card | elevated
theme.lineHeight.tight | snug | relaxed
```

## Estructura de page.styles.ts

```ts
import styled from 'styled-components';
// Si necesitas Link: import Link from 'next/link';

export const Page = styled.main`
  max-width: 40rem;       // o 56rem para páginas anchas
  margin: 0 auto;
  padding: 2.5rem 1rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const Title = styled.h1`
  font-family: ${({ theme }) => theme.fontFamily.heading};
  font-size: ${({ theme }) => theme.fontSize['2xl']};
  color: ${({ theme }) => theme.colors.bark};
`;
// ... resto de componentes
```

## Estructura de page.tsx

```tsx
'use client';

import { ... } from '@phosphor-icons/react';  // Phosphor Icons
import { ComponentA, ComponentB } from './page.styles';
// stores: import { useXxxStore } from '../../store/xxxStore';

export default function XxxPage() {
  // lógica aquí
  return (
    <Page>
      ...
    </Page>
  );
}
```

## Patrones comunes

- **Header con acción**: `<Header>` flex con `justify-content: space-between`
- **Cards**: `background: white`, `border-radius: radii.xl`, `box-shadow: shadow.card`
- **Empty state**: wrap centrado con icono (opacidad 0.3) + texto
- **Botón primario**: `background: bark`, `color: parchment`, border none
- **Botón secundario**: border `1.5px solid cream`, background transparent
- **Estado de carga**: usar `<ItemListSkeleton>` o similar de `../../components/Skeleton`

## Después de crear los archivos

Informa al usuario si necesita:
1. Añadir la ruta al navbar (`apps/web/src/components/Navbar/Navbar.tsx`)
2. Crear un API route correspondiente (`/app/api/...`)
3. Crear un Zustand store para los datos
