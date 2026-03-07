'use client';

import { HandbagSimple } from '@phosphor-icons/react';
import { useEffect } from 'react';
import { useLoansStore } from '../../store/loansStore';
import {
  Count,
  EmptyIcon,
  EmptyText,
  EmptyWrap,
  Header,
  ItemLink,
  LentTo,
  LoanCard,
  LoanInfo,
  LoanMeta,
  Page,
  ReturnBtn,
  Title,
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
  const returnLoan = useLoansStore((s) => s.returnLoan);

  useEffect(() => {
    if (!hasLoaded) void loadLoans();
  }, [hasLoaded, loadLoans]);

  const active = loans.filter((l) => !l.returned_at);

  return (
    <Page>
      <Header>
        <Title>Préstamos</Title>
        {!isLoading && active.length > 0 && (
          <Count>
            {active.length} activo{active.length !== 1 ? 's' : ''}
          </Count>
        )}
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
            <ReturnBtn onClick={() => void returnLoan(loan.id)}>
              Devuelto
            </ReturnBtn>
          </LoanCard>
        ))
      )}
    </Page>
  );
}
