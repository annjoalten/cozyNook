'use client';

import {
  ArrowLeft,
  Check,
  PencilSimple,
  Plus,
  Trash,
  X,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { SkeletonBlock } from '../../components/Skeleton';
import { useRoomStore } from '../../store/roomStore';

const Page = styled.main`
  max-width: 36rem;
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
  &:hover { color: ${({ theme }) => theme.colors.bark}; }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fontFamily.heading};
  font-size: ${({ theme }) => theme.fontSize['2xl']};
  color: ${({ theme }) => theme.colors.bark};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadow.card};
  overflow: hidden;
`;

const RoomRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1.1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.parchment};

  &:last-child { border-bottom: none; }
`;

const RoomName = styled.span`
  flex: 1;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.base};
  color: ${({ theme }) => theme.colors.bark};
`;

const InlineInput = styled.input`
  flex: 1;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.base};
  color: ${({ theme }) => theme.colors.bark};
  background: ${({ theme }) => theme.colors.parchment};
  border: 1.5px solid ${({ theme }) => theme.colors.olive};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 0.25rem 0.5rem;
  outline: none;
`;

const IconButton = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.3rem;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ $danger, theme }) =>
    $danger ? theme.colors.terracotta : theme.colors.taupe};
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: color 0.15s, background 0.15s;

  &:hover {
    color: ${({ $danger, theme }) =>
      $danger ? theme.colors.terracotta : theme.colors.bark};
    background: ${({ theme }) => theme.colors.parchment};
  }
`;

const AddRow = styled.form`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1rem 1.1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.cream};
`;

const AddInput = styled.input`
  flex: 1;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.bark};
  background: ${({ theme }) => theme.colors.parchment};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 0.5rem 0.75rem;
  outline: none;
  transition: border-color 0.15s;

  &:focus { border-color: ${({ theme }) => theme.colors.olive}; }
  &::placeholder { color: ${({ theme }) => theme.colors.taupe}; opacity: 0.7; }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 0.9rem;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.parchment};
  background: ${({ theme }) => theme.colors.bark};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const SkeletonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.1rem;
`;

export default function RoomsPage() {
  const { rooms, isLoading, hasLoaded, loadRooms, addRoom, updateRoom, deleteRoom } =
    useRoomStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!hasLoaded) loadRooms();
  }, [hasLoaded, loadRooms]);

  useEffect(() => {
    if (editingId) editRef.current?.focus();
  }, [editingId]);

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    await updateRoom(id, editName.trim());
    cancelEdit();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const ok = await addRoom(newName.trim());
    if (ok) setNewName('');
  };

  const handleDeleteConfirm = async () => {
    if (!confirmId) return;
    setDeletingId(confirmId);
    await deleteRoom(confirmId);
    setDeletingId(null);
    setConfirmId(null);
  };

  const confirmingRoom = rooms.find((r) => r.id === confirmId);

  return (
    <Page>
      <Back href="/items">
        <ArrowLeft size={16} weight="light" />
        Volver al inventario
      </Back>

      <Header>
        <Title>Habitaciones</Title>
      </Header>

      <Card>
        {isLoading && !hasLoaded ? (
          <SkeletonList>
            {[1, 2, 3, 4].map((i) => (
              <SkeletonBlock key={i} height="1.1rem" width={`${50 + i * 8}%`} />
            ))}
          </SkeletonList>
        ) : rooms.length === 0 ? (
          <RoomRow>
            <RoomName style={{ color: 'var(--taupe)', fontStyle: 'italic' }}>
              Aún no hay habitaciones
            </RoomName>
          </RoomRow>
        ) : (
          rooms.map((room) => (
            <RoomRow key={room.id}>
              {editingId === room.id ? (
                <>
                  <InlineInput
                    ref={editRef}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(room.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <IconButton onClick={() => saveEdit(room.id)} aria-label="Guardar">
                    <Check size={16} weight="bold" />
                  </IconButton>
                  <IconButton onClick={cancelEdit} aria-label="Cancelar">
                    <X size={16} weight="bold" />
                  </IconButton>
                </>
              ) : (
                <>
                  <RoomName>{room.name}</RoomName>
                  <IconButton
                    onClick={() => startEdit(room.id, room.name)}
                    aria-label="Editar"
                  >
                    <PencilSimple size={16} weight="light" />
                  </IconButton>
                  <IconButton
                    $danger
                    onClick={() => setConfirmId(room.id)}
                    aria-label="Eliminar"
                  >
                    <Trash size={16} weight="light" />
                  </IconButton>
                </>
              )}
            </RoomRow>
          ))
        )}

        <AddRow onSubmit={handleAdd}>
          <AddInput
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nueva habitación…"
          />
          <AddButton type="submit" disabled={!newName.trim()}>
            <Plus size={14} weight="bold" />
            Añadir
          </AddButton>
        </AddRow>
      </Card>

      <ConfirmDialog
        open={!!confirmId}
        title={`¿Eliminar "${confirmingRoom?.name}"?`}
        description="Los objetos en esta habitación no se eliminarán, pero perderán su habitación asignada."
        confirmLabel="Eliminar"
        loading={deletingId === confirmId}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmId(null)}
      />
    </Page>
  );
}
