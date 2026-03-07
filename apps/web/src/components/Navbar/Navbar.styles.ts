import Link from 'next/link';
import styled from 'styled-components';

export const Nav = styled.nav`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${({ theme }) => theme.colors.white};
  border-bottom: 1.5px solid ${({ theme }) => theme.colors.cream};
`;

export const NavInner = styled.div`
  max-width: 64rem;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

export const Logo = styled(Link)`
  font-family: ${({ theme }) => theme.fontFamily.heading};
  font-size: ${({ theme }) => theme.fontSize.xl};
  color: ${({ theme }) => theme.colors.bark};
  flex-shrink: 0;
  letter-spacing: -0.02em;
`;

export const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 0.15rem;
  flex: 1;
`;

export const NavLinkItem = styled(Link)<{ $active: boolean }>`
  padding: 0.4rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ $active, theme }) =>
    $active ? theme.fontWeight.medium : theme.fontWeight.normal};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.bark : theme.colors.taupe};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.parchment : 'transparent'};
  transition:
    color 0.15s,
    background 0.15s;
  white-space: nowrap;
  &:hover {
    color: ${({ theme }) => theme.colors.bark};
    background: ${({ theme }) => theme.colors.parchment};
  }
`;

export const AddBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.bark};
  color: ${({ theme }) => theme.colors.parchment};
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  flex-shrink: 0;
  transition: background 0.15s;
  &:hover {
    background: ${({ theme }) => theme.colors.clay};
  }
`;
