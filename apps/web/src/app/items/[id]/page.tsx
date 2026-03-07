'use client';

import {
  ArrowLeft,
  HandbagSimple,
  ShoppingCart,
  Trash,
  Warning,
} from '@phosphor-icons/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { ItemForm } from '../../../components/ItemForm';
import { LocationBreadcrumb } from '../../../components/LocationBreadcrumb';
import { ItemDetailSkeleton } from '../../../components/Skeleton';
import { TagBadge } from '../../../components/TagBadge';
import { useLoadItems } from '../../../hooks/useLoadItems';
import { isLowStock } from '../../../lib/stock';
import { useItemStore } from '../../../store/itemStore';
import type { Loan } from '../../../store/loansStore';
import { useLoansStore } from '../../../store/loansStore';
import { useShoppingListStore } from '../../../store/shoppingListStore';
import {
  ActionButton,
  Actions,
  AlertInput,
  AlertInputRow,
  AlertLabel,
  AlertRow,
  AlertSaveBtn,
  AlertSection,
  AlertToggle,
  Back,
  Card,
  CardBody,
  Description,
  EditTitle,
  EmptyLoans,
  ItemImage,
  LoanCancelBtn,
  LoanForm,
  LoanFormActions,
  LoanInfo,
  LoanInput,
  LoanList,
  LoanMeta,
  LoanName,
  LoanRow,
  LoanSubmitBtn,
  LoansCard,
  Name,
  NotFound,
  Page,
  ReturnBtn,
  SectionTitle,
  StockBlock,
  StockLabel,
  StockValue,
  Tags,
} from './page.styles';

interface StockAlert {
  id: string;
  item_id: string;
  min_quantity: number;
  enabled: boolean;
}

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

export default function ItemDetailPage() {
  useLoadItems();

  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const getItemById = useItemStore((s) => s.getItemById);
  const deleteItem = useItemStore((s) => s.deleteItem);
  const hasLoaded = useItemStore((s) => s.hasLoaded);
  const addToList = useShoppingListStore((s) => s.addEntry);
  const loadItemLoans = useLoansStore((s) => s.loadItemLoans);
  const addLoan = useLoansStore((s) => s.addLoan);
  const returnLoan = useLoansStore((s) => s.returnLoan);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addingToList, setAddingToList] = useState(false);

  // Stock alert
  const [alert, setAlert] = useState<StockAlert | null>(null);
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [threshold, setThreshold] = useState(1);
  const [alertSaving, setAlertSaving] = useState(false);

  // Loans
  const [loans, setLoans] = useState<Loan[]>([]);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [lentTo, setLentTo] = useState('');
  const [loanNote, setLoanNote] = useState('');
  const [submittingLoan, setSubmittingLoan] = useState(false);
  const [returningId, setReturningId] = useState<string | null>(null);

  const item = getItemById(id);

  useEffect(() => {
    if (!id) return;

    // Load stock alert
    void fetch(`/api/stock-alerts/${id}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: StockAlert | null) => {
        if (data) {
          setAlert(data);
          setAlertEnabled(data.enabled);
          setThreshold(data.min_quantity);
        }
      })
      .catch(() => null);

    // Load loans
    void loadItemLoans(id).then(setLoans);
  }, [id, loadItemLoans]);

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

  const handleToggleAlert = async () => {
    setAlertSaving(true);
    if (alertEnabled && alert) {
      // Disable: delete the alert
      await fetch(`/api/stock-alerts/${id}`, { method: 'DELETE' });
      setAlert(null);
      setAlertEnabled(false);
    } else {
      // Enable: upsert with current threshold
      const res = await fetch(`/api/stock-alerts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ min_quantity: threshold, enabled: true }),
      });
      if (res.ok) {
        const data = (await res.json()) as StockAlert;
        setAlert(data);
        setAlertEnabled(true);
      }
    }
    setAlertSaving(false);
  };

  const handleSaveAlert = async () => {
    setAlertSaving(true);
    const res = await fetch(`/api/stock-alerts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ min_quantity: threshold, enabled: true }),
    });
    if (res.ok) {
      const data = (await res.json()) as StockAlert;
      setAlert(data);
    }
    setAlertSaving(false);
  };

  const handleAddLoan = async () => {
    if (!lentTo.trim()) return;
    setSubmittingLoan(true);
    const loan = await addLoan({
      item_id: id,
      lent_to: lentTo.trim(),
      note: loanNote.trim() || undefined,
    });
    if (loan) {
      setLoans((prev) => [loan, ...prev]);
      setLentTo('');
      setLoanNote('');
      setShowLoanForm(false);
    }
    setSubmittingLoan(false);
  };

  const handleReturn = async (loanId: string) => {
    setReturningId(loanId);
    await returnLoan(loanId);
    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId ? { ...l, returned_at: new Date().toISOString() } : l,
      ),
    );
    setReturningId(null);
  };

  const activeLoans = loans.filter((l) => !l.returned_at);
  const pastLoans = loans.filter((l) => l.returned_at);

  const stockLines: string[] = [];
  let isLow = false;
  if (item.stock) {
    const s = item.stock;
    isLow = isLowStock(s, alertEnabled ? threshold : 1);
    if (s.type === 'units') {
      stockLines.push(`${s.quantity} unidad${s.quantity !== 1 ? 'es' : ''}`);
    } else {
      stockLines.push(
        `${s.quantity} paquete${s.quantity !== 1 ? 's' : ''}`,
      );
      if (s.unitsPerPackage)
        stockLines.push(`${s.unitsPerPackage} unidades por paquete`);
      if (s.unitsRemaining !== undefined)
        stockLines.push(
          `${s.unitsRemaining} unidades restantes (paquete abierto)`,
        );
    }
  }

  return (
    <Page>
      <Back href="/items">
        <ArrowLeft size={16} weight="light" />
        Volver al inventario
      </Back>

      <Card>
        {item.imageUrl && (
          <ItemImage src={item.imageUrl} alt={item.name} />
        )}
        <CardBody>
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

          {item.stock && (
            <StockBlock>
              <StockLabel>
                Stock{isLow ? ' · ⚠ Queda poco' : ''}
              </StockLabel>
              {stockLines.map((l) => (
                <StockValue key={l} $low={isLow}>
                  {l}
                </StockValue>
              ))}
            </StockBlock>
          )}

          {item.stock && (
            <AlertSection>
              <AlertRow>
                <AlertLabel>
                  <Warning size={12} weight="bold" style={{ marginRight: 4 }} />
                  Alerta de stock bajo
                </AlertLabel>
                <AlertToggle
                  $active={alertEnabled}
                  onClick={handleToggleAlert}
                  disabled={alertSaving}
                >
                  {alertEnabled ? 'Activa' : 'Desactivada'}
                </AlertToggle>
              </AlertRow>
              {alertEnabled && (
                <AlertInputRow>
                  <AlertLabel>Avisar si queda menos de</AlertLabel>
                  <AlertInput
                    type="number"
                    min={0}
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                  />
                  <AlertLabel>unidades</AlertLabel>
                  <AlertSaveBtn
                    onClick={handleSaveAlert}
                    disabled={alertSaving || threshold === alert?.min_quantity}
                  >
                    Guardar
                  </AlertSaveBtn>
                </AlertInputRow>
              )}
            </AlertSection>
          )}

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
            <ActionButton onClick={() => setShowLoanForm((v) => !v)}>
              <HandbagSimple size={15} weight="light" />
              Prestar
            </ActionButton>
            <ActionButton $danger onClick={() => setConfirmOpen(true)}>
              <Trash size={15} weight="light" />
              Eliminar
            </ActionButton>
          </Actions>
        </CardBody>
      </Card>

      <LoansCard>
        <SectionTitle>Préstamos</SectionTitle>

        {showLoanForm && (
          <LoanForm>
            <LoanInput
              placeholder="¿A quién se lo prestas?"
              value={lentTo}
              onChange={(e) => setLentTo(e.target.value)}
              autoFocus
            />
            <LoanInput
              placeholder="Nota (opcional)"
              value={loanNote}
              onChange={(e) => setLoanNote(e.target.value)}
            />
            <LoanFormActions>
              <LoanSubmitBtn
                onClick={handleAddLoan}
                disabled={submittingLoan || !lentTo.trim()}
              >
                {submittingLoan ? 'Guardando…' : 'Registrar préstamo'}
              </LoanSubmitBtn>
              <LoanCancelBtn onClick={() => setShowLoanForm(false)}>
                Cancelar
              </LoanCancelBtn>
            </LoanFormActions>
          </LoanForm>
        )}

        {activeLoans.length > 0 ? (
          <LoanList>
            {activeLoans.map((loan) => (
              <LoanRow key={loan.id}>
                <LoanInfo>
                  <LoanName>{loan.lent_to}</LoanName>
                  <LoanMeta>
                    Prestado {formatRelativeDate(loan.lent_at)}
                    {loan.note ? ` · ${loan.note}` : ''}
                  </LoanMeta>
                </LoanInfo>
                <ReturnBtn
                  onClick={() => handleReturn(loan.id)}
                  disabled={returningId === loan.id}
                >
                  {returningId === loan.id ? '…' : 'Devuelto'}
                </ReturnBtn>
              </LoanRow>
            ))}
          </LoanList>
        ) : (
          !showLoanForm && (
            <EmptyLoans>Ningún préstamo activo.</EmptyLoans>
          )
        )}

        {pastLoans.length > 0 && (
          <>
            <SectionTitle style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.6 }}>
              Devueltos
            </SectionTitle>
            <LoanList>
              {pastLoans.map((loan) => (
                <LoanRow key={loan.id} style={{ opacity: 0.5 }}>
                  <LoanInfo>
                    <LoanName>{loan.lent_to}</LoanName>
                    <LoanMeta>
                      Prestado {formatRelativeDate(loan.lent_at)}
                      {loan.note ? ` · ${loan.note}` : ''}
                    </LoanMeta>
                  </LoanInfo>
                </LoanRow>
              ))}
            </LoanList>
          </>
        )}
      </LoansCard>

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
