'use client';

import {
  CheckIcon,
  PlusIcon,
  ShoppingCartIcon,
  TrashIcon,
  XIcon,
} from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useItemStore } from '../../store/itemStore';
import { useShoppingListStore } from '../../store/shoppingListStore';

// ── Layout ──────────────────────────────────────────────────────────────────

const Page = styled.main`
  max-width: 40rem;
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

const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1.25rem;
  background: ${({ theme }) => theme.colors.bark};
  color: ${({ theme }) => theme.colors.parchment};
  border: none;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  cursor: pointer;
  transition: background 0.15s ease;
  &:hover {
    background: ${({ theme }) => theme.colors.clay};
  }
`;

// ── Add form ─────────────────────────────────────────────────────────────────

const FormCard = styled.div`
  background: ${({ theme }) => theme.colors.parchment};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FormRow = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  flex-wrap: wrap;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
  min-width: 8rem;
`;

const Label = styled.label`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.taupe};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
`;

const Select = styled.select`
  padding: 0.55rem 0.75rem;
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.bark};
  background: ${({ theme }) => theme.colors.white};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.sand};
  }
`;

const Input = styled.input`
  padding: 0.55rem 0.75rem;
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.bark};
  background: ${({ theme }) => theme.colors.white};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.sand};
  }
`;

const SubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.1rem;
  background: ${({ theme }) => theme.colors.bark};
  color: ${({ theme }) => theme.colors.parchment};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  cursor: pointer;
  white-space: nowrap;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  &:not(:disabled):hover {
    background: ${({ theme }) => theme.colors.clay};
  }
`;

// ── List ─────────────────────────────────────────────────────────────────────

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.taupe};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.5rem;
`;

const EntryList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const EntryCard = styled.li<{ $checked: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  background: ${({ theme }) => theme.colors.white};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.lg};
  opacity: ${({ $checked }) => ($checked ? 0.5 : 1)};
  transition: opacity 0.15s;
`;

const Checkbox = styled.button<{ $checked: boolean }>`
  flex-shrink: 0;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 2px solid
    ${({ $checked, theme }) =>
      $checked ? theme.colors.bark : theme.colors.sand};
  background: ${({ $checked, theme }) =>
    $checked ? theme.colors.bark : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    border-color: ${({ theme }) => theme.colors.bark};
  }
`;

const EntryInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const EntryName = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.bark};
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EntryMeta = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.taupe};
`;

const Qty = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.taupe};
  white-space: nowrap;
`;

const DeleteButton = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.taupe};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: color 0.15s, background 0.15s;
  &:hover {
    color: ${({ theme }) => theme.colors.bark};
    background: ${({ theme }) => theme.colors.parchment};
  }
`;

const EmptyMsg = styled.p`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.taupe};
  text-align: center;
  padding: 2rem 0;
`;

const ClearCheckedButton = styled.button`
  align-self: flex-end;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.taupe};
  background: transparent;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  &:hover {
    color: ${({ theme }) => theme.colors.bark};
  }
`;

// ── Component ─────────────────────────────────────────────────────────────────

export default function CompraPage() {
  const { entries, isLoading, hasLoaded, loadList, addEntry, toggleChecked, deleteEntry } =
    useShoppingListStore();
  const { items, hasLoaded: itemsLoaded, loadItems } = useItemStore();

  const [showForm, setShowForm] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [qty, setQty] = useState('1');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!hasLoaded) loadList();
  }, [hasLoaded, loadList]);

  useEffect(() => {
    if (!itemsLoaded) loadItems();
  }, [itemsLoaded, loadItems]);

  const pending = entries.filter((e) => !e.checked);
  const checked = entries.filter((e) => e.checked);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) return;
    setIsAdding(true);
    await addEntry({ item_id: selectedItemId, quantity_needed: parseInt(qty, 10) || 1 });
    setIsAdding(false);
    setSelectedItemId('');
    setQty('1');
    setShowForm(false);
  };

  const handleClearChecked = async () => {
    await Promise.all(checked.map((e) => deleteEntry(e.id)));
  };

  return (
    <Page>
      <Header>
        <Title>Lista de la compra</Title>
        <AddButton onClick={() => setShowForm((v) => !v)}>
          {showForm ? (
            <>
              <XIcon size={16} weight="light" />
              Cancelar
            </>
          ) : (
            <>
              <PlusIcon size={16} weight="light" />
              Añadir
            </>
          )}
        </AddButton>
      </Header>

      {showForm && (
        <FormCard>
          <form onSubmit={handleAdd}>
            <FormRow>
              <FormField style={{ flex: 3 }}>
                <Label htmlFor="item-select">Objeto del inventario</Label>
                <Select
                  id="item-select"
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  required
                >
                  <option value="">Selecciona un objeto…</option>
                  {items
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }))
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                        {item.location.room ? ` · ${item.location.room}` : ''}
                      </option>
                    ))}
                </Select>
              </FormField>

              <FormField style={{ flex: 1 }}>
                <Label htmlFor="qty-input">Cantidad</Label>
                <Input
                  id="qty-input"
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
              </FormField>

              <SubmitButton type="submit" disabled={isAdding || !selectedItemId}>
                <ShoppingCartIcon size={15} weight="light" />
                Añadir
              </SubmitButton>
            </FormRow>
          </form>
        </FormCard>
      )}

      {isLoading ? (
        <EmptyMsg>Cargando…</EmptyMsg>
      ) : entries.length === 0 ? (
        <EmptyMsg>La lista está vacía. ¡Añade lo que necesites comprar!</EmptyMsg>
      ) : (
        <>
          {pending.length > 0 && (
            <div>
              <SectionTitle>Por comprar ({pending.length})</SectionTitle>
              <EntryList>
                {pending.map((entry) => (
                  <EntryCard key={entry.id} $checked={false}>
                    <Checkbox
                      $checked={false}
                      onClick={() => void toggleChecked(entry.id, true)}
                      aria-label="Marcar como comprado"
                    />
                    <EntryInfo>
                      <EntryName>{entry.item.name}</EntryName>
                      <EntryMeta>
                        {entry.item.room}
                        {entry.item.category ? ` · ${entry.item.category}` : ''}
                      </EntryMeta>
                    </EntryInfo>
                    {entry.quantity_needed > 1 && (
                      <Qty>×{entry.quantity_needed}</Qty>
                    )}
                    <DeleteButton
                      onClick={() => void deleteEntry(entry.id)}
                      aria-label="Eliminar"
                    >
                      <TrashIcon size={15} weight="light" />
                    </DeleteButton>
                  </EntryCard>
                ))}
              </EntryList>
            </div>
          )}

          {checked.length > 0 && (
            <div>
              <SectionTitle>
                <span>Comprado ({checked.length})</span>
              </SectionTitle>
              <EntryList>
                {checked.map((entry) => (
                  <EntryCard key={entry.id} $checked>
                    <Checkbox
                      $checked
                      onClick={() => void toggleChecked(entry.id, false)}
                      aria-label="Desmarcar"
                    >
                      <CheckIcon size={10} weight="bold" color="white" />
                    </Checkbox>
                    <EntryInfo>
                      <EntryName>{entry.item.name}</EntryName>
                      <EntryMeta>{entry.item.room}</EntryMeta>
                    </EntryInfo>
                    {entry.quantity_needed > 1 && (
                      <Qty>×{entry.quantity_needed}</Qty>
                    )}
                    <DeleteButton
                      onClick={() => void deleteEntry(entry.id)}
                      aria-label="Eliminar"
                    >
                      <TrashIcon size={15} weight="light" />
                    </DeleteButton>
                  </EntryCard>
                ))}
              </EntryList>
              <ClearCheckedButton onClick={() => void handleClearChecked()}>
                Limpiar comprados
              </ClearCheckedButton>
            </div>
          )}
        </>
      )}
    </Page>
  );
}
