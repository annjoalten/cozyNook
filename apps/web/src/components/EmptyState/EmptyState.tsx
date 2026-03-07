'use client';

import { CloverIcon } from '@phosphor-icons/react';
import { Subtitle, Title, Wrapper } from './EmptyState.styles';
import type { EmptyStateProps } from './EmptyState.types';

export function EmptyState({ query }: EmptyStateProps) {
  return (
    <Wrapper>
      <CloverIcon size={36} weight="light" />
      <Title>
        {query ? `Nada encontrado para "${query}"` : 'Tu inventario está vacío'}
      </Title>
      <Subtitle>
        {query
          ? 'Prueba con otro nombre, sinónimo o habitación.'
          : 'Empieza añadiendo el primer objeto de tu hogar. Cada cosa en su lugar.'}
      </Subtitle>
    </Wrapper>
  );
}
