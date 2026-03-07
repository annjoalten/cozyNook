'use client';

import {
  CaretDownIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
} from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { useItemStore } from '../../store/itemStore';
import { useShoppingListStore } from '../../store/shoppingListStore';
import {
  AddButton,
  Checkbox,
  ClearCheckedButton,
  DeleteButton,
  DropdownFreeRow,
  DropdownList,
  DropdownOption,
  DropdownOptionMeta,
  DropdownPanel,
  DropdownSearch,
  DropdownTrigger,
  DropdownWrapper,
  EmptyMsg,
  EntryCard,
  EntryInfo,
  EntryList,
  EntryMeta,
  EntryName,
  FormCard,
  FormField,
  FormRow,
  Header,
  Label,
  Page,
  Qty,
  QtyInput,
  SectionTitle,
  SubmitButton,
  Title,
} from './page.styles';

export default function CompraPage() {
  const {
    entries,
    isLoading,
    hasLoaded,
    loadList,
    addEntry,
    toggleChecked,
    deleteEntry,
  } = useShoppingListStore();
  const { items, hasLoaded: itemsLoaded, loadItems } = useItemStore();

  const [showForm, setShowForm] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedCustomName, setSelectedCustomName] = useState('');
  const [qty, setQty] = useState('1');
  const [isAdding, setIsAdding] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!hasLoaded) loadList();
  }, [hasLoaded, loadList]);

  useEffect(() => {
    if (!itemsLoaded) loadItems();
  }, [itemsLoaded, loadItems]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = items
    .filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }),
    )
    .slice(0, 10);

  const hasExactMatch = items.some(
    (i) => i.name.toLowerCase() === search.toLowerCase(),
  );

  const displayLabel = selectedItemId
    ? (items.find((i) => i.id === selectedItemId)?.name ?? '')
    : selectedCustomName;

  function openDropdown() {
    setDropdownOpen(true);
    setTimeout(() => searchRef.current?.focus(), 50);
  }

  function selectItem(id: string) {
    setSelectedItemId(id);
    setSelectedCustomName('');
    setSearch('');
    setDropdownOpen(false);
  }

  function selectCustom() {
    setSelectedCustomName(search.trim());
    setSelectedItemId('');
    setSearch('');
    setDropdownOpen(false);
  }

  function resetForm() {
    setSelectedItemId('');
    setSelectedCustomName('');
    setSearch('');
    setQty('1');
    setShowForm(false);
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId && !selectedCustomName) return;
    setIsAdding(true);
    const payload = selectedItemId
      ? { item_id: selectedItemId, quantity_needed: parseInt(qty, 10) || 1 }
      : {
          custom_name: selectedCustomName,
          quantity_needed: parseInt(qty, 10) || 1,
        };
    await addEntry(payload);
    setIsAdding(false);
    resetForm();
  };

  const pending = entries.filter((e) => !e.checked);
  const checked = entries.filter((e) => e.checked);

  const handleClearChecked = async () => {
    await Promise.all(checked.map((e) => deleteEntry(e.id)));
  };

  return (
    <Page>
      <Header>
        <Title>Lista de la compra</Title>
        <AddButton
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
        >
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
                <Label>Objeto</Label>
                <DropdownWrapper ref={wrapperRef}>
                  <DropdownTrigger
                    type="button"
                    $hasValue={!!displayLabel}
                    onClick={openDropdown}
                  >
                    <span>
                      {displayLabel || 'Busca o escribe un artículo…'}
                    </span>
                    <CaretDownIcon size={14} weight="bold" />
                  </DropdownTrigger>

                  {dropdownOpen && (
                    <DropdownPanel>
                      <DropdownSearch
                        ref={searchRef}
                        placeholder="Buscar en inventario…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      <DropdownList>
                        {filtered.map((item) => (
                          <DropdownOption
                            key={item.id}
                            type="button"
                            $selected={item.id === selectedItemId}
                            onClick={() => selectItem(item.id)}
                          >
                            {item.name}
                            <DropdownOptionMeta>
                              {item.location.room}
                            </DropdownOptionMeta>
                          </DropdownOption>
                        ))}
                      </DropdownList>
                      {search.trim() && !hasExactMatch && (
                        <DropdownFreeRow type="button" onClick={selectCustom}>
                          <PlusIcon size={12} weight="bold" />
                          Añadir &ldquo;{search.trim()}&rdquo;
                        </DropdownFreeRow>
                      )}
                    </DropdownPanel>
                  )}
                </DropdownWrapper>
              </FormField>

              <FormField style={{ flex: 1 }}>
                <Label htmlFor="qty-input">Cantidad</Label>
                <QtyInput
                  id="qty-input"
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
              </FormField>

              <SubmitButton
                type="submit"
                disabled={isAdding || (!selectedItemId && !selectedCustomName)}
              >
                Añadir
              </SubmitButton>
            </FormRow>
          </form>
        </FormCard>
      )}

      {isLoading ? (
        <EmptyMsg>Cargando…</EmptyMsg>
      ) : entries.length === 0 ? (
        <EmptyMsg>
          La lista está vacía. ¡Añade lo que necesites comprar!
        </EmptyMsg>
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
                      <EntryName>
                        {entry.custom_name ?? entry.item?.name}
                      </EntryName>
                      <EntryMeta>
                        {entry.item
                          ? `${entry.item.room}${entry.item.category ? ` · ${entry.item.category}` : ''}`
                          : 'Artículo libre'}
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
              <SectionTitle>Comprado ({checked.length})</SectionTitle>
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
                      <EntryName>
                        {entry.custom_name ?? entry.item?.name}
                      </EntryName>
                      <EntryMeta>
                        {entry.item ? entry.item.room : 'Artículo libre'}
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
