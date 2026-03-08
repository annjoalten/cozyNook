---
name: extract-styles
description: Extrae los styled-components inline de un archivo .tsx a su correspondiente .styles.ts, siguiendo el patrón del proyecto cozyNook. Úsala cuando un componente o página tenga estilos definidos directamente en el mismo archivo.
argument-hint: <ruta-del-archivo.tsx>
---

Extrae los estilos inline del archivo `$ARGUMENTS` a un archivo `.styles.ts` separado.

## Pasos a seguir

1. **Lee** el archivo indicado completamente
2. **Identifica** todos los `styled.xxx` y `styled(Component)` definidos en el archivo
3. **Crea** el archivo `.styles.ts` en el mismo directorio con todos los componentes exportados
4. **Actualiza** el `.tsx` original:
   - Elimina las definiciones de `styled`
   - Elimina el import `from 'styled-components'` si ya no se usa
   - Añade el import `from './NombreArchivo.styles'` (o `'./page.styles'` para páginas)
   - Mantén toda la lógica, JSX y otros imports intactos

## Formato del archivo .styles.ts

```ts
import styled from 'styled-components';
// Si hay componentes extendidos: import Link from 'next/link'; etc.

export const ComponenteA = styled.div`
  ...
`;

export const ComponenteB = styled.button<{ $prop?: boolean }>`
  ...
`;
```

## Reglas

- **Todos** los styled-components van al .styles.ts — sin excepciones
- Mantener los nombres exactos de los componentes
- Mantener las props transient (`$prop`) tal cual
- Si el styled extiende otro componente que no es HTML nativo, ese import también va en el .styles.ts
- El orden de exportación en .styles.ts debe seguir el orden de aparición en el .tsx original
- No modificar nada de la lógica ni el JSX del .tsx

## Verificación final

- El .tsx no debe contener ningún `styled.` ni `import styled`
- Todos los nombres de componentes importados deben coincidir exactamente con los exportados
- El archivo .styles.ts debe ser un módulo TypeScript válido sin errores
