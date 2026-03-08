'use client';

import { CaretDown, HandbagSimple, Plus, X } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useItemStore } from '../../store/itemStore';
import { useLoansStore } from '../../store/loansStore';
import {
  AddBtn,
  CancelBtn,
  CloseButton,
  Count,
  DropdownEmpty,
  DropdownList,
  DropdownMeta,
  DropdownOption,
  DropdownPanel,
  DropdownSearch,
  DropdownTrigger,
  DropdownWrapper,
  EmptyIcon,
  EmptyText,
  EmptyWrap,
  FieldGroup,
  FieldInput,
  FieldLabel,
  Header,
  ItemLink,
  LentTo,
  LoanCard,
  LoanInfo,
  LoanMeta,
  ModalActions,
  ModalCard,
  ModalForm,
  ModalHeader,
  ModalOverlay,
  ModalTitle,
  Page,
  ReturnBtn,
  SubmitBtn,
  Title,
  TitleGroup,
} from './page.styles';

function formatRelativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'hoy';
  if (days === 1) return 'ayer';
  if (days < 30) return `hace ${days} días`;
  const months = Math.floor(days / 30);
  if (months === 1) return 'hace 1 mes';
  if (months < 12) return `hace ${months} meses`;
  const years = Math.floor(months / 12);
  return years === 1 ? 'hace 1 año' : `hace ${years} años`;
}

export default function PrestamosPage() {
  const loans = useLoansStore((s) => s.loans);
  const isLoading = useLoansStore((s) => s.isLoading);
  const hasLoaded = useLoansStore((s) => s.hasLoaded);
  const loadLoans = useLoansStore((s) => s.loadLoans);
  const addLoan = useLoansStore((s) => s.addLoan);
  const returnLoan = useLoansStore((s) => s.returnLoan);

  const items = useItemStore((s) => s.items);
  const itemsLoaded = useItemStore((s) => s.hasLoaded);
  const loadItems = useItemStore((s) => s.loadItems);

  const [modalOpen, setModalOpen] = useState(false);
  const [lentTo, setLentTo] = useState('');
  const [note, setNote] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmReturnId, setConfirmReturnId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!hasLoaded) void loadLoans();
  }, [hasLoaded, loadLoans]);

  useEffect(() => {
    if (!itemsLoaded) void loadItems();
  }, [itemsLoaded, loadItems]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const filteredItems = items
    .filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }))
    .slice(0, 10);

  const selectedItem = items.find((i) => i.id === selectedItemId);

  function openDropdown() {
    setDropdownOpen(true);
    setTimeout(() => searchRef.current?.focus(), 50);
  }

  function selectItem(id: string) {
    setSelectedItemId(id);
    setSearch('');
    setDropdownOpen(false);
  }

  function resetModal() {
    setLentTo('');
    setNote('');
    setSelectedItemId('');
    setSearch('');
    setDropdownOpen(false);
    setModalOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItemId || !lentTo.trim()) return;
    setSubmitting(true);
    await addLoan({
      item_id: selectedItemId,
      lent_to: lentTo.trim(),
      note: note.trim() || undefined,
    });
    setSubmitting(false);
    resetModal();
  }

  const active = loans.filter((l) => !l.returned_at);
  const past = loans.filter((l) => l.returned_at);

  return (
    <Page>
      <Header>
        <TitleGroup>
          <Title>Préstamos</Title>
          {!isLoading && active.length > 0 && (
            <Count>
              {active.length} activo{active.length !== 1 ? 's' : ''}
            </Count>
          )}
        </TitleGroup>
        <AddBtn onClick={() => setModalOpen(true)}>
          <Plus size={15} weight="bold" />
          Registrar
        </AddBtn>
      </Header>

      {isLoading ? (
        <EmptyText style={{ color: 'inherit', opacity: 0.5 }}>
          Cargando…
        </EmptyText>
      ) : active.length === 0 ? (
        <EmptyWrap>
          <EmptyIcon>
            <HandbagSimple size={48} weight="light" />
          </EmptyIcon>
          <EmptyText>No hay préstamos activos.</EmptyText>
        </EmptyWrap>
      ) : (
        active.map((loan) => (
          <LoanCard key={loan.id}>
            <LoanInfo>
              <LentTo>{loan.lent_to}</LentTo>
              {loan.item && (
                <ItemLink href={`/items/${loan.item.id}`}>
                  {loan.item.name}
                </ItemLink>
              )}
              <LoanMeta>
                Prestado {formatRelativeDate(loan.lent_at)}
                {loan.note ? ` · ${loan.note}` : ''}
              </LoanMeta>
            </LoanInfo>
            <ReturnBtn onClick={() => setConfirmReturnId(loan.id)}>
              Devuelto
            </ReturnBtn>
          </LoanCard>
        ))
      )}

      {past.length > 0 && (
        <div>
          <ReturnBtn
            style={{ background: 'transparent', border: 'none', padding: '0', fontSize: '0.8rem', color: 'inherit', opacity: 0.5 }}
            onClick={() => setShowHistory((v) => !v)}
          >
            {showHistory ? 'Ocultar historial' : `Ver historial (${past.length} devuelto${past.length !== 1 ? 's' : ''})`}
          </ReturnBtn>
          {showHistory && past.map((loan) => (
            <LoanCard key={loan.id} style={{ opacity: 0.45, marginTop: '0.5rem' }}>
              <LoanInfo>
                <LentTo>{loan.lent_to}</LentTo>
                {loan.item && (
                  <ItemLink href={`/items/${loan.item.id}`}>
                    {loan.item.name}
                  </ItemLink>
                )}
                <LoanMeta>
                  Prestado {formatRelativeDate(loan.lent_at)}
                  {loan.note ? ` · ${loan.note}` : ''}
                  {loan.returned_at ? ` · Devuelto ${formatRelativeDate(loan.returned_at)}` : ''}
                </LoanMeta>
              </LoanInfo>
            </LoanCard>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmReturnId}
        title="¿Marcar como devuelto?"
        description="Esto moverá el préstamo al historial."
        confirmLabel="Sí, devuelto"
        onConfirm={async () => {
          if (confirmReturnId) await returnLoan(confirmReturnId);
          setConfirmReturnId(null);
        }}
        onCancel={() => setConfirmReturnId(null)}
      />

      {modalOpen && (
        <ModalOverlay onClick={resetModal}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Registrar préstamo</ModalTitle>
              <CloseButton onClick={resetModal} aria-label="Cerrar">
                <X size={16} weight="bold" />
              </CloseButton>
            </ModalHeader>

            <ModalForm onSubmit={handleSubmit}>
              <FieldGroup>
                <FieldLabel>Objeto</FieldLabel>
                <DropdownWrapper ref={dropdownRef}>
                  <DropdownTrigger
                    type="button"
                    $hasValue={!!selectedItemId}
                    onClick={openDropdown}
                  >
                    <span>
                      {selectedItem ? selectedItem.name : 'Selecciona un objeto…'}
                    </span>
                    <CaretDown size={14} weight="bold" />
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
                        {filteredItems.length > 0 ? (
                          filteredItems.map((item) => (
                            <DropdownOption
                              key={item.id}
                              type="button"
                              onClick={() => selectItem(item.id)}
                            >
                              {item.name}
                              <DropdownMeta>{item.location.room}</DropdownMeta>
                            </DropdownOption>
                          ))
                        ) : (
                          <DropdownEmpty>Sin resultados</DropdownEmpty>
                        )}
                      </DropdownList>
                    </DropdownPanel>
                  )}
                </DropdownWrapper>
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="lent-to">¿A quién se lo prestas?</FieldLabel>
                <FieldInput
                  id="lent-to"
                  placeholder="Nombre"
                  value={lentTo}
                  onChange={(e) => setLentTo(e.target.value)}
                  autoFocus={false}
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="loan-note">Nota (opcional)</FieldLabel>
                <FieldInput
                  id="loan-note"
                  placeholder="Ej: hasta el viernes"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </FieldGroup>

              <ModalActions>
                <SubmitBtn
                  type="submit"
                  disabled={submitting || !selectedItemId || !lentTo.trim()}
                >
                  {submitting ? 'Guardando…' : 'Registrar préstamo'}
                </SubmitBtn>
                <CancelBtn type="button" onClick={resetModal}>
                  Cancelar
                </CancelBtn>
              </ModalActions>
            </ModalForm>
          </ModalCard>
        </ModalOverlay>
      )}
    </Page>
  );
}
