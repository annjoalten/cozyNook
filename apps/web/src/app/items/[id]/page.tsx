'use client';

import { ArrowLeft, ShoppingCart, Trash } from '@phosphor-icons/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import styled from 'styled-components';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { ItemForm } from '../../../components/ItemForm';
import { LocationBreadcrumb } from '../../../components/LocationBreadcrumb';
import { ItemDetailSkeleton } from '../../../components/Skeleton';
import { TagBadge } from '../../../components/TagBadge';
import { useLoadItems } from '../../../hooks/useLoadItems';
import { isLowStock } from '../../../lib/stock';
import { useItemStore } from '../../../store/itemStore';
import { useShoppingListStore } from '../../../store/shoppingListStore';

const Page = styled.main`
  max-width: 40rem;
  margin: 0 auto;
  padding: 2.5rem 1rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

const Card = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadow.card};
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Name = styled.h1`
  font-family: ${({ theme }) => theme.fontFamily.heading};
  font-size: ${({ theme }) => theme.fontSize['2xl']};
  color: ${({ theme }) => theme.colors.bark};
  line-height: ${({ theme }) => theme.lineHeight.snug};
`;

const Description = styled.p`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.base};
  color: ${({ theme }) => theme.colors.taupe};
  line-height: ${({ theme }) => theme.lineHeight.relaxed};
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.cream};
`;

const ActionButton = styled.button<{ $danger?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1.5px solid
    ${({ $danger, theme }) =>
      $danger ? theme.colors.terracotta : theme.colors.cream};
  background: transparent;
  color: ${({ $danger, theme }) =>
    $danger ? theme.colors.terracotta : theme.colors.bark};

  &:hover {
    background: ${({ $danger, theme }) =>
      $danger ? theme.colors.terracotta : theme.colors.bark};
    color: ${({ theme }) => theme.colors.parchment};
    border-color: transparent;
  }
`;

const EditTitle = styled.h2`
  font-family: ${({ theme }) => theme.fontFamily.heading};
  font-size: ${({ theme }) => theme.fontSize.xl};
  color: ${({ theme }) => theme.colors.bark};
`;

const NotFound = styled.p`
  font-family: ${({ theme }) => theme.fontFamily.body};
  color: ${({ theme }) => theme.colors.taupe};
`;

const StockBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.parchment};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
`;

const StockLabel = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.taupe};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StockValue = styled.span<{ $low?: boolean }>`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.base};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ $low, theme }) =>
    $low ? theme.colors.terracotta : theme.colors.bark};
`;

export default function ItemDetailPage() {
  useLoadItems();

  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const getItemById = useItemStore((s) => s.getItemById);
  const deleteItem = useItemStore((s) => s.deleteItem);
  const hasLoaded = useItemStore((s) => s.hasLoaded);
  const addToList = useShoppingListStore((s) => s.addEntry);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addingToList, setAddingToList] = useState(false);

  const item = getItemById(id);

  if (!hasLoaded) {
    return <ItemDetailSkeleton />;
  }

  if (!item) {
    return (
      <Page>
        <Back href="/items">
          <ArrowLeft size={16} weight="light" />
          Volver
        </Back>
        <NotFound>Objeto no encontrado.</NotFound>
      </Page>
    );
  }

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    const ok = await deleteItem(id);
    setDeleting(false);
    setConfirmOpen(false);
    if (ok) router.push('/items');
  };

  return (
    <Page>
      <Back href="/items">
        <ArrowLeft size={16} weight="light" />
        Volver al inventario
      </Back>

      <Card>
        <Name>{item.name}</Name>
        {item.description && <Description>{item.description}</Description>}
        <LocationBreadcrumb
          room={item.location.room}
          spot={item.location.spot}
        />
        {item.tags.length > 0 && (
          <Tags>
            {item.tags.map((tag) => (
              <TagBadge key={tag} label={tag} />
            ))}
          </Tags>
        )}
        {item.stock &&
          (() => {
            const s = item.stock;
            const isLow = isLowStock(s);
            const lines: string[] = [];
            if (s.type === 'units') {
              lines.push(`${s.quantity} unidad${s.quantity !== 1 ? 'es' : ''}`);
            } else {
              lines.push(`${s.quantity} paquete${s.quantity !== 1 ? 's' : ''}`);
              if (s.unitsPerPackage)
                lines.push(`${s.unitsPerPackage} unidades por paquete`);
              if (s.unitsRemaining !== undefined)
                lines.push(
                  `${s.unitsRemaining} unidades restantes (paquete abierto)`,
                );
            }
            return (
              <StockBlock>
                <StockLabel>Stock{isLow ? ' · ⚠ Queda poco' : ''}</StockLabel>
                {lines.map((l) => (
                  <StockValue key={l} $low={isLow}>
                    {l}
                  </StockValue>
                ))}
              </StockBlock>
            );
          })()}
        <Actions>
          <ActionButton
            onClick={async () => {
              setAddingToList(true);
              await addToList({ item_id: item.id });
              setAddingToList(false);
            }}
            disabled={addingToList}
          >
            <ShoppingCart size={15} weight="light" />
            {addingToList ? 'Añadiendo…' : 'Añadir a la compra'}
          </ActionButton>
          <ActionButton $danger onClick={() => setConfirmOpen(true)}>
            <Trash size={15} weight="light" />
            Eliminar
          </ActionButton>
        </Actions>
      </Card>

      <EditTitle id="edit-form">Editar objeto</EditTitle>
      <ItemForm initial={item} />

      <ConfirmDialog
        open={confirmOpen}
        title={`¿Eliminar "${item.name}"?`}
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </Page>
  );
}
