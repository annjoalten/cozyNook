'use client';

import { ArrowLeft, PencilSimple, Trash } from '@phosphor-icons/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { ItemForm } from '../../../components/ItemForm';
import { LocationBreadcrumb } from '../../../components/LocationBreadcrumb';
import { TagBadge } from '../../../components/TagBadge';
import { useLoadItems } from '../../../hooks/useLoadItems';
import { useItemStore } from '../../../store/itemStore';

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
  background: #fff;
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

export default function ItemDetailPage() {
  useLoadItems();

  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const getItemById = useItemStore((s) => s.getItemById);
  const deleteItem = useItemStore((s) => s.deleteItem);
  const hasLoaded = useItemStore((s) => s.hasLoaded);

  const item = getItemById(id);

  if (!hasLoaded) {
    return (
      <Page>
        <Back href="/items">
          <ArrowLeft size={16} weight="light" />
          Volver
        </Back>
        <NotFound>Cargando objeto...</NotFound>
      </Page>
    );
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

  const handleDelete = async () => {
    if (window.confirm(`¿Eliminar "${item.name}"?`)) {
      const ok = await deleteItem(id);
      if (ok) {
        router.push('/items');
      }
    }
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
        <Actions>
          <ActionButton
            onClick={() =>
              document
                .getElementById('edit-form')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <PencilSimple size={15} weight="light" />
            Editar
          </ActionButton>
          <ActionButton $danger onClick={handleDelete}>
            <Trash size={15} weight="light" />
            Eliminar
          </ActionButton>
        </Actions>
      </Card>

      <EditTitle id="edit-form">Editar objeto</EditTitle>
      <ItemForm initial={item} />
    </Page>
  );
}
