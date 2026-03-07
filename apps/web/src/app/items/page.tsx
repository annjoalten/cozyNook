'use client';

import {
  DownloadSimpleIcon,
  PlusIcon,
  ShoppingCartIcon,
  SquaresFourIcon,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { useState } from 'react';
import styled from 'styled-components';
import { EmptyState } from '../../components/EmptyState';
import { SearchBar } from '../../components/SearchBar';
import { SearchResults } from '../../components/SearchResults';
import { ItemListSkeleton } from '../../components/Skeleton';
import { useLoadItems } from '../../hooks/useLoadItems';
import { exportToCSV, exportToJSON } from '../../lib/exportInventory';
import { useItemStore } from '../../store/itemStore';

const Page = styled.main`
  max-width: 56rem;
  margin: 0 auto;
  padding: 2.5rem 1rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fontFamily.heading};
  font-size: ${({ theme }) => theme.fontSize['2xl']};
  color: ${({ theme }) => theme.colors.bark};
`;

const AddButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1.25rem;
  background: ${({ theme }) => theme.colors.bark};
  color: ${({ theme }) => theme.colors.parchment};
  border-radius: ${({ theme }) => theme.radii.lg};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  transition: background 0.15s ease;
  &:hover {
    background: ${({ theme }) => theme.colors.clay};
  }
`;

const RoomsLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1rem;
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.lg};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.taupe};
  transition:
    border-color 0.15s,
    color 0.15s;
  &:hover {
    border-color: ${({ theme }) => theme.colors.sand};
    color: ${({ theme }) => theme.colors.bark};
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const ExportWrap = styled.div`
  position: relative;
`;

const ExportButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1rem;
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.lg};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.taupe};
  background: transparent;
  cursor: pointer;
  transition:
    border-color 0.15s,
    color 0.15s;
  &:hover {
    border-color: ${({ theme }) => theme.colors.sand};
    color: ${({ theme }) => theme.colors.bark};
  }
`;

const ExportMenu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: ${({ theme }) => theme.colors.white};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadow.card};
  z-index: 50;
  min-width: 9rem;
  overflow: hidden;
`;

const ExportOption = styled.button`
  width: 100%;
  text-align: left;
  padding: 0.6rem 0.9rem;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.bark};
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.1s;
  &:hover {
    background: ${({ theme }) => theme.colors.parchment};
  }
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
  transition: opacity 0.15s;
  &:hover {
    opacity: 0.85;
  }
`;

const Filters = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const LettersWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

const LetterButton = styled.button<{ $active?: boolean }>`
  min-width: 2.2rem;
  padding: 0.45rem 0.55rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.bark : theme.colors.cream};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.bark : theme.colors.white};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.parchment : theme.colors.taupe};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.sand};
    color: ${({ $active, theme }) =>
      $active ? theme.colors.parchment : theme.colors.bark};
  }
`;

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
          <RoomsLink href="/compra">
            <ShoppingCartIcon size={16} weight="light" />
            Compra
          </RoomsLink>
          <RoomsLink href="/rooms">
            <SquaresFourIcon size={16} weight="light" />
            Estancias
          </RoomsLink>

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
      ) : (
        <SearchResults items={filtered} query={emptyQueryLabel} />
      )}
    </Page>
  );
}
