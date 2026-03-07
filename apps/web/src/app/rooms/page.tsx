'use client';

import { ROOMS } from '@nook/core';
import {
  ArrowLeft,
  HouseLine,
  PencilSimpleLine,
  Plus,
  X,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ImageUpload } from '../../components/ImageUpload';
import { ItemListSkeleton } from '../../components/Skeleton';
import { useLoadItems } from '../../hooks/useLoadItems';
import { getRoomCover } from '../../lib/roomCovers';
import { useItemStore } from '../../store/itemStore';
import { useRoomStore } from '../../store/roomStore';

const Page = styled.main`
  max-width: 64rem;
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

const Header = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fontFamily.heading};
  font-size: ${({ theme }) => theme.fontSize['2xl']};
  color: ${({ theme }) => theme.colors.bark};
`;

const Subtitle = styled.p`
  margin-top: 0.25rem;
  font-family: ${({ theme }) => theme.fontFamily.body};
  color: ${({ theme }) => theme.colors.taupe};
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

const Grid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(14.5rem, 1fr));
  gap: 1rem;
`;

const CreateButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.bark};
  color: ${({ theme }) => theme.colors.parchment};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  cursor: pointer;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(36, 31, 26, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 80;
`;

const ModalCard = styled.section`
  width: min(34rem, 100%);
  max-height: calc(100vh - 2rem);
  overflow: auto;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.white};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadow.elevated};
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
`;

const CloseButton = styled.button`
  padding: 0.2rem;
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.taupe};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.bark};
    background: ${({ theme }) => theme.colors.parchment};
  }
`;

const CreatorTitle = styled.h2`
  font-family: ${({ theme }) => theme.fontFamily.heading};
  font-size: ${({ theme }) => theme.fontSize.lg};
  color: ${({ theme }) => theme.colors.bark};
`;

const CreatorHint = styled.p`
  margin-top: 0.25rem;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.taupe};
`;

const CreatorForm = styled.form`
  margin-top: 0.9rem;
  display: grid;
  gap: 0.75rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.65rem 0.75rem;
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.bark};
  background: ${({ theme }) => theme.colors.parchment};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 5rem;
  resize: vertical;
  padding: 0.65rem 0.75rem;
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.bark};
  background: ${({ theme }) => theme.colors.parchment};
`;

const Submit = styled.button`
  justify-self: start;
  padding: 0.55rem 1rem;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.bark};
  color: ${({ theme }) => theme.colors.parchment};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  cursor: pointer;
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const Cover = styled.div<{ $bg: string; $image?: string }>`
  height: 7.25rem;
  width: 100%;
  background: ${({ $image, $bg }) =>
    $image ? `url(${$image}) center/cover no-repeat` : $bg};
`;

const CardBody = styled.div`
  padding: 0.85rem 0.95rem 1rem;
`;

const RoomName = styled.h2`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.lg};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.bark};
  line-height: ${({ theme }) => theme.lineHeight.tight};
`;

const ItemCount = styled.p`
  margin-top: 0.3rem;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.taupe};
`;

const RoomDescription = styled.p`
  margin-top: 0.35rem;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.taupe};
  line-height: ${({ theme }) => theme.lineHeight.relaxed};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const EmptyMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.parchment};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.lg};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.taupe};
`;

export default function RoomsPage() {
  useLoadItems();

  const items = useItemStore((s) => s.items);
  const isLoading = useItemStore((s) => s.isLoading);
  const error = useItemStore((s) => s.error);
  const reload = useItemStore((s) => s.reload);

  const roomRecords = useRoomStore((s) => s.rooms);
  const hasLoadedRooms = useRoomStore((s) => s.hasLoaded);
  const loadRooms = useRoomStore((s) => s.loadRooms);
  const addRoom = useRoomStore((s) => s.addRoom);
  const updateRoom = useRoomStore((s) => s.updateRoom);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState<string | undefined>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSavingRoom, setIsSavingRoom] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (!hasLoadedRooms) {
      void loadRooms();
    }
  }, [hasLoadedRooms, loadRooms]);

  const itemCounts = items.reduce((acc, item) => {
    const roomName = item.location.room?.trim() || 'Sin estancia';
    acc.set(roomName, (acc.get(roomName) ?? 0) + 1);
    return acc;
  }, new Map<string, number>());

  const roomByName = useMemo(
    () => new Map(roomRecords.map((room) => [room.name, room])),
    [roomRecords],
  );

  const allRoomNames = Array.from(
    new Set([
      ...ROOMS,
      ...roomRecords.map((room) => room.name),
      ...Array.from(itemCounts.keys()),
    ]),
  );

  const rooms = allRoomNames
    .map((name) => ({
      name,
      count: itemCounts.get(name) ?? 0,
      meta: roomByName.get(name),
    }))
    .sort((a, b) =>
      a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }),
    );

  const openCreateModal = () => {
    setEditingRoomId(null);
    setNewTitle('');
    setNewDescription('');
    setNewImageUrl(undefined);
    setIsCreateOpen(true);
  };

  const openEditModal = (room: {
    id?: string;
    name: string;
    description?: string | null;
    image_url?: string | null;
  }) => {
    setEditingRoomId(room.id ?? null);
    setNewTitle(room.name);
    setNewDescription(room.description ?? '');
    setNewImageUrl(room.image_url ?? undefined);
    setIsCreateOpen(true);
  };

  const closeModal = () => {
    setIsCreateOpen(false);
    setEditingRoomId(null);
    setNewTitle('');
    setNewDescription('');
    setNewImageUrl(undefined);
  };

  const handleSaveRoom = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newTitle.trim();
    if (!name || isSavingRoom) return;

    setIsSavingRoom(true);

    const payload = {
      name,
      description: newDescription.trim() || undefined,
      imageUrl: newImageUrl,
    };

    const saved = editingRoomId
      ? await updateRoom(editingRoomId, payload)
      : await addRoom(payload);

    setIsSavingRoom(false);

    if (saved) {
      closeModal();
    }
  };

  return (
    <Page>
      <Back href="/items">
        <ArrowLeft size={16} weight="light" />
        Volver al inventario
      </Back>

      <Header>
        <div>
          <Title>Estancias</Title>
          <Subtitle>
            Explora por estancia y entra para ver sus objetos.
          </Subtitle>
        </div>
        <CreateButton type="button" onClick={openCreateModal}>
          <Plus size={16} weight="bold" />
          Crear estancia
        </CreateButton>
      </Header>

      {isCreateOpen ? (
        <ModalOverlay onClick={closeModal}>
          <ModalCard onClick={(event) => event.stopPropagation()}>
            <ModalHeader>
              <div>
                <CreatorTitle>
                  {editingRoomId ? 'Editar estancia' : 'Crear estancia'}
                </CreatorTitle>
                <CreatorHint>
                  {editingRoomId
                    ? 'Actualiza título, descripción e imagen de esta estancia.'
                    : 'Añade título, descripción e imagen para personalizar tus estancias.'}
                </CreatorHint>
              </div>
              <CloseButton
                type="button"
                aria-label="Cerrar modal"
                onClick={closeModal}
              >
                <X size={16} weight="bold" />
              </CloseButton>
            </ModalHeader>

            <CreatorForm onSubmit={handleSaveRoom}>
              <Input
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="Título de la estancia"
              />
              <TextArea
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                placeholder="Descripción corta"
                maxLength={300}
              />
              <ImageUpload value={newImageUrl} onChange={setNewImageUrl} />
              <Submit type="submit" disabled={isSavingRoom || !newTitle.trim()}>
                {isSavingRoom
                  ? 'Guardando...'
                  : editingRoomId
                    ? 'Guardar cambios'
                    : 'Guardar estancia'}
              </Submit>
            </CreatorForm>
          </ModalCard>
        </ModalOverlay>
      ) : null}

      {isLoading ? (
        <ItemListSkeleton count={6} />
      ) : error ? (
        <EmptyMessage>
          <span>No se pudo cargar el inventario.</span>
          <button type="button" onClick={() => void reload()}>
            Reintentar
          </button>
        </EmptyMessage>
      ) : rooms.length === 0 ? (
        <EmptyMessage>
          <HouseLine size={18} weight="light" />
          No hay estancias con objetos todavía.
        </EmptyMessage>
      ) : (
        <Grid>
          {rooms.map((room) => {
            const cover = getRoomCover(room.name);
            const coverImage = room.meta?.image_url ?? cover.image;
            const description = room.meta?.description?.trim();
            return (
              <RoomCard key={room.name}>
                <EditButton
                  type="button"
                  aria-label={`Editar ${room.name}`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    openEditModal({
                      id: room.meta?.id,
                      name: room.name,
                      description: room.meta?.description,
                      image_url: room.meta?.image_url,
                    });
                  }}
                >
                  <PencilSimpleLine size={14} weight="bold" />
                </EditButton>
                <RoomLink href={`/rooms/${encodeURIComponent(room.name)}`}>
                  <Cover
                    $bg={cover.background}
                    $image={coverImage ?? undefined}
                  />
                  <CardBody>
                    <RoomName>{room.name}</RoomName>
                    <ItemCount>
                      {room.count} {room.count === 1 ? 'item' : 'items'}
                    </ItemCount>
                    {description ? (
                      <RoomDescription>{description}</RoomDescription>
                    ) : null}
                  </CardBody>
                </RoomLink>
              </RoomCard>
            );
          })}
        </Grid>
      )}
    </Page>
  );
}

const RoomCard = styled.article`
  position: relative;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadow.card};
  overflow: hidden;
`;

const RoomLink = styled(Link)`
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-2px);
    transition: transform 0.15s ease;
  }
`;

const EditButton = styled.button`
  position: absolute;
  top: 0.55rem;
  right: 0.55rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.8rem;
  height: 1.8rem;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: ${({ theme }) => theme.colors.bark};
  box-shadow: ${({ theme }) => theme.shadow.card};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.white};
  }
`;
