'use client';

import { DownloadSimpleIcon, PlusIcon, SquaresFourIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { useState } from 'react';
import styled from 'styled-components';
import { EmptyState } from '../../components/EmptyState';
import { RoomSelector } from '../../components/RoomSelector';
import { SearchResults } from '../../components/SearchResults';
import { ItemListSkeleton } from '../../components/Skeleton';
import { useLoadItems } from '../../hooks/useLoadItems';
import { exportToCSV, exportToJSON } from '../../lib/exportInventory';
import { useItemStore } from '../../store/itemStore';
import { useUIStore } from '../../store/uiStore';

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
  transition: border-color 0.15s, color 0.15s;
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
  transition: border-color 0.15s, color 0.15s;
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
  &:hover { background: ${({ theme }) => theme.colors.parchment}; }
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
  &:hover { opacity: 0.85; }
`;

export default function ItemsPage() {
  useLoadItems();

  const items = useItemStore((s) => s.items);
  const isLoading = useItemStore((s) => s.isLoading);
  const error = useItemStore((s) => s.error);
  const reload = useItemStore((s) => s.reload);
  const activeRoom = useUIStore((s) => s.activeRoom);
  const setActiveRoom = useUIStore((s) => s.setActiveRoom);
  const [exportOpen, setExportOpen] = useState(false);

  const filtered = activeRoom
    ? items.filter((item) => item.location.room === activeRoom)
    : items;

  return (
    <Page>
      <Header>
        <Title>Tu inventario</Title>
        <Actions>
          <RoomsLink href="/rooms">
            <SquaresFourIcon size={16} weight="light" />
            Habitaciones
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
                    onClick={() => { exportToCSV(items); setExportOpen(false); }}
                  >
                    CSV (.csv)
                  </ExportOption>
                  <ExportOption
                    onClick={() => { exportToJSON(items); setExportOpen(false); }}
                  >
                    JSON (.json)
                  </ExportOption>
                </ExportMenu>
              )}
            </ExportWrap>
          )}

          <AddButton href="/items/new">
            <PlusIcon size={16} weight="light" />
            Añadir objeto
          </AddButton>
        </Actions>
      </Header>

      <RoomSelector value={activeRoom} onChange={setActiveRoom} />

      {isLoading ? (
        <ItemListSkeleton count={6} />
      ) : error ? (
        <ErrorBanner>
          <span>No se pudo conectar con el servidor. Comprueba tu conexión o inténtalo en unos minutos.</span>
          <RetryButton onClick={() => void reload()}>Reintentar</RetryButton>
        </ErrorBanner>
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <SearchResults items={filtered} query="" />
      )}
    </Page>
  );
}
