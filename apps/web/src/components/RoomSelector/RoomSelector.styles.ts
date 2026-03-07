import styled from 'styled-components'

export const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`

export const Chip = styled.button<{ $active: boolean }>`
  padding: 0.35rem 0.9rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  border: 1.5px solid ${({ $active, theme }) =>
    $active ? theme.colors.bark : theme.colors.cream};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.bark : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.parchment : theme.colors.bark};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.bark};
    background: ${({ $active, theme }) =>
      $active ? theme.colors.bark : theme.colors.cream};
  }
`
