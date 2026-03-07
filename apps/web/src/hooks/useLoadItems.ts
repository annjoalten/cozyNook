import { useEffect } from 'react';
import { useItemStore } from '../store/itemStore';

export function useLoadItems() {
  const hasLoaded = useItemStore((s) => s.hasLoaded);
  const isLoading = useItemStore((s) => s.isLoading);
  const loadItems = useItemStore((s) => s.loadItems);

  useEffect(() => {
    if (!hasLoaded && !isLoading) {
      void loadItems();
    }
  }, [hasLoaded, isLoading, loadItems]);
}
