'use client';

import { ArrowLeft } from '@phosphor-icons/react';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { SearchBar } from '../../../components/SearchBar';
import { SearchResults } from '../../../components/SearchResults';
import { ItemListSkeleton } from '../../../components/Skeleton';
import { useLoadItems } from '../../../hooks/useLoadItems';
import { useItemStore } from '../../../store/itemStore';
import {
  Back,
  Count,
  ErrorBanner,
  Header,
  Page,
  RetryButton,
  Title,
} from './page.styles';

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
          {roomItems.length} {roomItems.length === 1 ? 'item' : 'items'} en
          esta estancia
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
