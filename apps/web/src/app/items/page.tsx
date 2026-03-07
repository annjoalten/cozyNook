'use client';

import { PlusIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import styled from 'styled-components';
import { EmptyState } from '../../components/EmptyState';
import { RoomSelector } from '../../components/RoomSelector';
import { SearchResults } from '../../components/SearchResults';
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

export default function ItemsPage() {
  const items = useItemStore((s) => s.items);
  const activeRoom = useUIStore((s) => s.activeRoom);
  const setActiveRoom = useUIStore((s) => s.setActiveRoom);

  const filtered = activeRoom
    ? items.filter((item) => item.location.room === activeRoom)
    : items;

  return (
    <Page>
      <Header>
        <Title>Tu inventario</Title>
        <AddButton href="/items/new">
          <PlusIcon size={16} weight="light" />
          Añadir objeto
        </AddButton>
      </Header>

      <RoomSelector value={activeRoom} onChange={setActiveRoom} />

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <SearchResults items={filtered} query="" />
      )}
    </Page>
  );
}
