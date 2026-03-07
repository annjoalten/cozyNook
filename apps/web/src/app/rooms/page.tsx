'use client';

import { ROOMS } from '@nook/core';
import {
  HouseLine,
  PencilSimpleLine,
  Plus,
  X,
} from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';
import { ImageUpload } from '../../components/ImageUpload';
import { ItemListSkeleton } from '../../components/Skeleton';
import { useLoadItems } from '../../hooks/useLoadItems';
import { getRoomCover } from '../../lib/roomCovers';
import { useItemStore } from '../../store/itemStore';
import { useRoomStore } from '../../store/roomStore';
import {
  CardBody,
  CloseButton,
  Cover,
  CreateButton,
  CreatorForm,
  CreatorHint,
  CreatorTitle,
  EditButton,
  EmptyMessage,
  Grid,
  Header,
  Input,
  ItemCount,
  ModalCard,
  ModalHeader,
  ModalOverlay,
  Page,
  RoomCard,
  RoomDescription,
  RoomLink,
  RoomName,
  Submit,
  Subtitle,
  TextArea,
  Title,
} from './page.styles';

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
  const [displayImageUrl, setDisplayImageUrl] = useState<string | undefined>();
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
    .sort((a, b) => {
      const aIsOther = a.name.trim().toLowerCase() === 'otro';
      const bIsOther = b.name.trim().toLowerCase() === 'otro';

      if (aIsOther && !bIsOther) return 1;
      if (!aIsOther && bIsOther) return -1;

      return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
    });

  const openCreateModal = () => {
    setEditingRoomId(null);
    setNewTitle('');
    setNewDescription('');
    setNewImageUrl(undefined);
    setDisplayImageUrl(undefined);
    setIsCreateOpen(true);
  };

  const openEditModal = (room: {
    id?: string;
    name: string;
    description?: string | null;
    image_url?: string | null;
  }) => {
    const cover = getRoomCover(room.name);
    setEditingRoomId(room.id ?? null);
    setNewTitle(room.name);
    setNewDescription(room.description ?? '');
    setNewImageUrl(room.image_url ?? undefined);
    setDisplayImageUrl(room.image_url ?? cover.image ?? undefined);
    setIsCreateOpen(true);
  };

  const closeModal = () => {
    setIsCreateOpen(false);
    setEditingRoomId(null);
    setNewTitle('');
    setNewDescription('');
    setNewImageUrl(undefined);
    setDisplayImageUrl(undefined);
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
      <Header>
        <div>
          <Title>Estancias</Title>
          <Subtitle>Explora por estancia y entra para ver sus objetos.</Subtitle>
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
              <ImageUpload
                value={newImageUrl}
                displayValue={displayImageUrl}
                showRemove={!editingRoomId}
                onChange={(url) => {
                  setNewImageUrl(url);
                  setDisplayImageUrl(url);
                }}
              />
              <Submit
                type="submit"
                disabled={isSavingRoom || !newTitle.trim()}
              >
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
