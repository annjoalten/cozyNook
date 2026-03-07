'use client';

import { ArrowLeft } from '@phosphor-icons/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { SearchBar } from '../../../components/SearchBar';
import { SearchResults } from '../../../components/SearchResults';
import { ItemListSkeleton } from '../../../components/Skeleton';
import { useLoadItems } from '../../../hooks/useLoadItems';
import { useItemStore } from '../../../store/itemStore';

const Page = styled.main`
  max-width: 56rem;
  margin: 0 auto;
  padding: 2.5rem 1rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const Back = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.taupe};

  &:hover {
    color: ${({ theme }) => theme.colors.bark};
  }
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fontFamily.heading};
  font-size: ${({ theme }) => theme.fontSize['2xl']};
  color: ${({ theme }) => theme.colors.bark};
`;

const Count = styled.p`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.taupe};
`;

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: ${({ theme }) => theme.colors.parchment};
  border: 1.5px solid ${({ theme }) => theme.colors.sand};
  border-radius: ${({ theme }) => theme.radii.lg};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.bark};
`;

const RetryButton = styled.button`
  flex-shrink: 0;
  padding: 0.4rem 1rem;
  background: ${({ theme }) => theme.colors.bark};
  color: ${({ theme }) => theme.colors.parchment};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  cursor: pointer;
`;

function normalize(value: string) {
  return value.trim().toLocaleLowerCase('es');
}

export default function RoomDetailPage() {
  useLoadItems();

  const params = useParams<{ room: string }>();
  const roomName = decodeURIComponent(params.room ?? '');

  const items = useItemStore((s) => s.items);
  const isLoading = useItemStore((s) => s.isLoading);
  const error = useItemStore((s) => s.error);
  const reload = useItemStore((s) => s.reload);
  const [query, setQuery] = useState('');

  const roomItems = useMemo(
    () =>
      items
        .filter((item) => normalize(item.location.room) === normalize(roomName))
        .sort((a, b) =>
          a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }),
        ),
    [items, roomName],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('es');
    if (!term) return roomItems;

    return roomItems.filter((item) => {
      return (
        item.name.toLocaleLowerCase('es').includes(term) ||
        item.description?.toLocaleLowerCase('es').includes(term) ||
        item.tags.some((tag) => tag.toLocaleLowerCase('es').includes(term)) ||
        item.location.spot.toLocaleLowerCase('es').includes(term)
      );
    });
  }, [query, roomItems]);

  return (
    <Page>
      <Back href="/rooms">
        <ArrowLeft size={16} weight="light" />
        Volver a estancias
      </Back>

      <Header>
        <Title>{roomName || 'Estancia'}</Title>
        <Count>
          {roomItems.length} {roomItems.length === 1 ? 'item' : 'items'} en esta
          estancia
        </Count>
      </Header>

      <SearchBar
        value={query}
        onChange={setQuery}
        onClear={() => setQuery('')}
        placeholder="Buscar en esta estancia..."
      />

      {isLoading ? (
        <ItemListSkeleton count={6} />
      ) : error ? (
        <ErrorBanner>
          <span>No se pudo cargar el inventario.</span>
          <RetryButton onClick={() => void reload()}>Reintentar</RetryButton>
        </ErrorBanner>
      ) : (
        <SearchResults items={filtered} query={query || roomName} />
      )}
    </Page>
  );
}
