'use client';

import Link from 'next/link';
import { PlusIcon } from '@phosphor-icons/react';
import { useEffect } from 'react';
import { ItemCard } from '../components/ItemCard';
import { SearchBar } from '../components/SearchBar';
import { SearchResults } from '../components/SearchResults';
import { SuggestionBanner } from '../components/SuggestionBanner';
import { useLoadItems } from '../hooks/useLoadItems';
import { useSearch } from '../hooks/useSearch';
import { isLowStock } from '../lib/stock';
import { useItemStore } from '../store/itemStore';
import { useLoansStore } from '../store/loansStore';
import {
  AddButton,
  AlertBanner,
  Container,
  EmptyHint,
  Grid,
  Hero,
  LoanRow,
  LoanRowInfo,
  LoanRowMeta,
  LoanRowName,
  Page,
  SectionCard,
  SectionHeader,
  SectionTitle,
  Subtitle,
  Title,
  ViewAll,
} from './page.styles';

function formatRelativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'hoy';
  if (days === 1) return 'ayer';
  if (days < 30) return `hace ${days} días`;
  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months} mes${months !== 1 ? 'es' : ''}`;
  return `hace ${Math.floor(months / 12)} año${Math.floor(months / 12) !== 1 ? 's' : ''}`;
}

export default function HomePage() {
  useLoadItems();

  const items = useItemStore((s) => s.items);
  const { query, results, suggestions, isSearching, setQuery, clearSearch } =
    useSearch();

  const loans = useLoansStore((s) => s.loans);
  const loansLoaded = useLoansStore((s) => s.hasLoaded);
  const loadLoans = useLoansStore((s) => s.loadLoans);

  useEffect(() => {
    if (!loansLoaded) void loadLoans();
  }, [loansLoaded, loadLoans]);

  const recent = [...items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const lowStock = items.filter((i) => i.stock && isLowStock(i.stock, 1)).slice(0, 4);
  const activeLoans = loans.filter((l) => !l.returned_at).slice(0, 4);

  return (
    <Page>
      <Hero>
        <Title>Tu hogar, ordenado.</Title>
        <Subtitle>
          Encuentra cualquier cosa, aunque hayas olvidado cómo la llamaste.
        </Subtitle>
        <AddButton href="/items/new">
          <PlusIcon size={16} weight="light" />
          Añadir
        </AddButton>
      </Hero>

      <Container>
        <SearchBar value={query} onChange={setQuery} onClear={clearSearch} />

        {suggestions.length > 0 && (
          <SuggestionBanner suggestions={suggestions} onSelect={setQuery} />
        )}

        {isSearching ? (
          <SearchResults items={results} query={query} />
        ) : (
          <>
            {lowStock.length > 0 && (
              <section>
                <SectionHeader>
                  <SectionTitle>Stock bajo</SectionTitle>
                  <ViewAll href="/compra">Añadir a la compra</ViewAll>
                </SectionHeader>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {lowStock.map((item) => (
                    <AlertBanner key={item.id}>
                      <Link href={`/items/${item.id}`} style={{ fontWeight: 500, color: 'inherit', textDecoration: 'none' }}>
                        {item.name}
                      </Link>
                      <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>
                        {item.stock?.type === 'units'
                          ? `${item.stock.quantity} unidad${item.stock.quantity !== 1 ? 'es' : ''}`
                          : `${item.stock?.quantity} paquete${(item.stock?.quantity ?? 0) !== 1 ? 's' : ''}`}
                      </span>
                    </AlertBanner>
                  ))}
                </div>
              </section>
            )}

            {activeLoans.length > 0 && (
              <section>
                <SectionHeader>
                  <SectionTitle>Préstamos activos</SectionTitle>
                  <ViewAll href="/prestamos">Ver todos</ViewAll>
                </SectionHeader>
                <SectionCard style={{ marginTop: '0.75rem' }}>
                  {activeLoans.map((loan) => (
                    <LoanRow key={loan.id}>
                      <LoanRowInfo>
                        <LoanRowName>{loan.lent_to}</LoanRowName>
                        <LoanRowMeta>
                          {loan.item?.name ?? '—'} · {formatRelativeDate(loan.lent_at)}
                        </LoanRowMeta>
                      </LoanRowInfo>
                      {loan.item && (
                        <Link href={`/items/${loan.item.id}`} style={{ fontSize: '0.8rem', color: 'inherit', opacity: 0.6, textDecoration: 'underline' }}>
                          Ver
                        </Link>
                      )}
                    </LoanRow>
                  ))}
                </SectionCard>
              </section>
            )}

            <section>
              <SectionHeader>
                <SectionTitle>Añadido recientemente</SectionTitle>
                {items.length > 6 && <ViewAll href="/items">Ver todo</ViewAll>}
              </SectionHeader>
              {recent.length > 0 ? (
                <Grid style={{ marginTop: '1rem' }}>
                  {recent.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </Grid>
              ) : (
                <EmptyHint>
                  Todavía no hay nada aquí. ¡Empieza añadiendo tu primer objeto!
                </EmptyHint>
              )}
            </section>
          </>
        )}
      </Container>
    </Page>
  );
}
