'use client';

import {
  DownloadSimpleIcon,
  PlusIcon,
  ShoppingCartIcon,
  SquaresFourIcon,
} from '@phosphor-icons/react';
import { useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { SearchBar } from '../../components/SearchBar';
import { SearchResults } from '../../components/SearchResults';
import { ItemListSkeleton } from '../../components/Skeleton';
import { useLoadItems } from '../../hooks/useLoadItems';
import { exportToCSV, exportToJSON } from '../../lib/exportInventory';
import { useItemStore } from '../../store/itemStore';
import {
  Actions,
  AddButton,
  ErrorBanner,
  ExportButton,
  ExportMenu,
  ExportOption,
  ExportWrap,
  Filters,
  Header,
  LetterButton,
  LettersWrap,
  NavLink,
  Page,
  RetryButton,
  SearchPromptImage,
  SearchPromptSub,
  SearchPromptTitle,
  SearchPromptWrap,
  Title,
} from './page.styles';

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
}

function initialBucket(value: string) {
  const first = normalizeText(value).charAt(0);
  return /^[A-Z]$/.test(first) ? first : '#';
}

export default function ItemsPage() {
  useLoadItems();

  const items = useItemStore((s) => s.items);
  const isLoading = useItemStore((s) => s.isLoading);
  const error = useItemStore((s) => s.error);
  const reload = useItemStore((s) => s.reload);
  const [exportOpen, setExportOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const textFiltered = query.trim()
    ? items.filter((item) => {
        const term = query.toLowerCase();
        return (
          item.name.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term) ||
          item.location.room.toLowerCase().includes(term) ||
          item.location.spot.toLowerCase().includes(term) ||
          item.tags.some((tag) => tag.toLowerCase().includes(term))
        );
      })
    : items;

  const filtered = (
    activeLetter
      ? textFiltered.filter((item) => initialBucket(item.name) === activeLetter)
      : textFiltered
  ).sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

  const emptyQueryLabel =
    query || (activeLetter ? `inicial ${activeLetter}` : '');

  return (
    <Page>
      <Header>
        <Title>Tu inventario</Title>
        <Actions>
          <NavLink href="/compra">
            <ShoppingCartIcon size={16} weight="light" />
            Compra
          </NavLink>
          <NavLink href="/rooms">
            <SquaresFourIcon size={16} weight="light" />
            Estancias
          </NavLink>

          {items.length > 0 && (
            <ExportWrap>
              <ExportButton onClick={() => setExportOpen((v) => !v)}>
                <DownloadSimpleIcon size={16} weight="light" />
                Exportar
              </ExportButton>
              {exportOpen && (
                <ExportMenu>
                  <ExportOption
                    onClick={() => {
                      exportToCSV(items);
                      setExportOpen(false);
                    }}
                  >
                    CSV (.csv)
                  </ExportOption>
                  <ExportOption
                    onClick={() => {
                      exportToJSON(items);
                      setExportOpen(false);
                    }}
                  >
                    JSON (.json)
                  </ExportOption>
                </ExportMenu>
              )}
            </ExportWrap>
          )}

          <AddButton href="/items/new">
            <PlusIcon size={16} weight="light" />
            Añadir
          </AddButton>
        </Actions>
      </Header>

      <Filters>
        <SearchBar
          value={query}
          onChange={setQuery}
          onClear={() => setQuery('')}
          placeholder="Busca por nombre, etiqueta o ubicación..."
        />

        <LettersWrap>
          <LetterButton
            $active={activeLetter === null}
            onClick={() => setActiveLetter(null)}
          >
            Todas
          </LetterButton>
          {letters.map((letter) => (
            <LetterButton
              key={letter}
              $active={activeLetter === letter}
              onClick={() => setActiveLetter(letter)}
            >
              {letter}
            </LetterButton>
          ))}
          <LetterButton
            $active={activeLetter === '#'}
            onClick={() => setActiveLetter('#')}
          >
            #
          </LetterButton>
        </LettersWrap>
      </Filters>

      {isLoading ? (
        <ItemListSkeleton count={6} />
      ) : error ? (
        <ErrorBanner>
          <span>
            No se pudo conectar con el servidor. Comprueba tu conexión o
            inténtalo en unos minutos.
          </span>
          <RetryButton onClick={() => void reload()}>Reintentar</RetryButton>
        </ErrorBanner>
      ) : items.length === 0 ? (
        <EmptyState />
      ) : !query.trim() && !activeLetter ? (
        <SearchPromptWrap>
          <SearchPromptTitle>Encuentra cualquier cosa en tu casa</SearchPromptTitle>
          <SearchPromptSub>Usa el buscador o filtra por letra para encontrar un objeto.</SearchPromptSub>
          <SearchPromptImage src="/rooms/items-cover.png" alt="" />
        </SearchPromptWrap>
      ) : filtered.length === 0 ? (
        <SearchPromptWrap>
          <SearchPromptTitle>Sin resultados para &ldquo;{emptyQueryLabel}&rdquo;</SearchPromptTitle>
          <SearchPromptImage src="/rooms/items-cover.png" alt="" />
        </SearchPromptWrap>
      ) : (
        <SearchResults items={filtered} query={emptyQueryLabel} />
      )}
    </Page>
  );
}
