import styled from 'styled-components'

export const Badge = styled.span<{ $clickable: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  background: ${({ theme }) => theme.colors.cream};
  color: ${({ theme }) => theme.colors.bark};
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition: background 0.15s ease;

  &:hover {
    background: ${({ $clickable, theme }) =>
      $clickable ? theme.colors.sand : theme.colors.cream};
  }
`
