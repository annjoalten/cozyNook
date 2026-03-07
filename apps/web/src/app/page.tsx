'use client';

import { PlusIcon } from '@phosphor-icons/react';
import { ItemCard } from '../components/ItemCard';
import { SearchBar } from '../components/SearchBar';
import { SearchResults } from '../components/SearchResults';
import { SuggestionBanner } from '../components/SuggestionBanner';
import { useLoadItems } from '../hooks/useLoadItems';
import { useSearch } from '../hooks/useSearch';
import { useItemStore } from '../store/itemStore';
import {
  AddButton,
  Container,
  EmptyHint,
  Grid,
  Hero,
  Page,
  SectionHeader,
  SectionTitle,
  Subtitle,
  Title,
  ViewAll,
} from './page.styles';

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
