'use client';

import { PlusIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import styled from 'styled-components';
import { ItemCard } from '../components/ItemCard';
import { SearchBar } from '../components/SearchBar';
import { SearchResults } from '../components/SearchResults';
import { SuggestionBanner } from '../components/SuggestionBanner';
import { useLoadItems } from '../hooks/useLoadItems';
import { useSearch } from '../hooks/useSearch';
import { useItemStore } from '../store/itemStore';

const Page = styled.main`
  min-height: 100vh;
  padding: 0 1rem 4rem;
`;

const Hero = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 1rem 3rem;
  gap: 1rem;
  text-align: center;
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fontFamily.heading};
  font-size: ${({ theme }) => theme.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.bark};
  line-height: ${({ theme }) => theme.lineHeight.tight};
`;

const Subtitle = styled.p`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.base};
  color: ${({ theme }) => theme.colors.taupe};
  max-width: 32rem;
`;

const Container = styled.div`
  max-width: 56rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fontFamily.heading};
  font-size: ${({ theme }) => theme.fontSize.xl};
  color: ${({ theme }) => theme.colors.bark};
`;

const ViewAll = styled(Link)`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.taupe};
  text-decoration: underline;
  text-underline-offset: 3px;
  &:hover {
    color: ${({ theme }) => theme.colors.bark};
  }
`;

const AddButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1.25rem;
  background: ${({ theme }) => theme.colors.bark};
  color: ${({ theme }) => theme.colors.parchment};
  border-radius: ${({ theme }) => theme.radii.lg};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  transition: background 0.15s ease;
  &:hover {
    background: ${({ theme }) => theme.colors.clay};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  gap: 1rem;
`;

const EmptyHint = styled.p`
  font-family: ${({ theme }) => theme.fontFamily.body};
  color: ${({ theme }) => theme.colors.taupe};
`;

export default function HomePage() {
  useLoadItems();

  const items = useItemStore((s) => s.items);
  const { query, results, suggestions, isSearching, setQuery, clearSearch } =
    useSearch();

  const recent = [...items]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 6);

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
        )}
      </Container>
    </Page>
  );
}
