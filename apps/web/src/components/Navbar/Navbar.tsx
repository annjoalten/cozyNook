'use client';

import {
  ArchiveIcon,
  HandbagIcon,
  ShoppingCartIcon,
  SquaresFourIcon,
} from '@phosphor-icons/react';
import { usePathname } from 'next/navigation';
import { Logo, Nav, NavInner, NavLinkItem, NavLinks } from './Navbar.styles';

const NAV_ITEMS = [
  { href: '/items', label: 'Inventario', icon: ArchiveIcon },
  { href: '/rooms', label: 'Estancias', icon: SquaresFourIcon },
  { href: '/compra', label: 'Compra', icon: ShoppingCartIcon },
  { href: '/prestamos', label: 'Préstamos', icon: HandbagIcon },
];

export function Navbar() {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <Nav>
      <NavInner>
        <Logo href="/">nook</Logo>
        <NavLinks>
          {NAV_ITEMS.map(({ href, label }) => (
            <NavLinkItem key={href} href={href} $active={isActive(href)}>
              {label}
            </NavLinkItem>
          ))}
        </NavLinks>
      </NavInner>
    </Nav>
  );
}
