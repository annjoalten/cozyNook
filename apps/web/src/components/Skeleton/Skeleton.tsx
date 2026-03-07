'use client';

import { Bone, CardGrid, DetailPage } from './Skeleton.styles';

/** Bloque genérico de skeleton */
export function SkeletonBlock({
  width = '100%',
  height = '1rem',
  radius = '6px',
}: {
  width?: string;
  height?: string;
  radius?: string;
}) {
  return <Bone style={{ width, height, borderRadius: radius }} />;
}

/** Esqueleto de una tarjeta de item (para la lista) */
export function ItemCardSkeleton() {
  return (
    <CardGrid>
      <SkeletonBlock height="1.2rem" width="60%" />
      <SkeletonBlock height="0.85rem" width="90%" />
      <SkeletonBlock height="0.85rem" width="40%" />
      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
        <SkeletonBlock height="1.4rem" width="4rem" radius="999px" />
        <SkeletonBlock height="1.4rem" width="3.5rem" radius="999px" />
      </div>
    </CardGrid>
  );
}

/** Esqueleto de la página de detalle */
export function ItemDetailSkeleton() {
  return (
    <DetailPage>
      <SkeletonBlock height="1.5rem" width="8rem" />
      <div
        style={{
          background: '#fff',
          borderRadius: '1rem',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        <SkeletonBlock height="1.75rem" width="55%" />
        <SkeletonBlock height="0.9rem" width="85%" />
        <SkeletonBlock height="0.9rem" width="70%" />
        <SkeletonBlock height="0.85rem" width="35%" />
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <SkeletonBlock height="1.4rem" width="4rem" radius="999px" />
          <SkeletonBlock height="1.4rem" width="3.5rem" radius="999px" />
        </div>
        <div
          style={{
            display: 'flex',
            gap: '0.6rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid #D9CDBF',
          }}
        >
          <SkeletonBlock height="2rem" width="6rem" radius="8px" />
          <SkeletonBlock height="2rem" width="6rem" radius="8px" />
        </div>
      </div>
    </DetailPage>
  );
}

/** N tarjetas skeleton para la lista */
export function ItemListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ItemCardSkeleton key={i} />
      ))}
    </>
  );
}
