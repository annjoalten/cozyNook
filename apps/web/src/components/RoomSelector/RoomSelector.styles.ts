import styled from 'styled-components'

export const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
`

export const Chip = styled.button<{ $active: boolean }>`
  padding: 0.35rem 0.9rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  border: 1.5px solid ${({ $active, theme }) =>
    $active ? theme.colors.bark : theme.colors.sand};
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

export const AddChip = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 1.5px dashed ${({ theme }) => theme.colors.sand};
  background: transparent;
  color: ${({ theme }) => theme.colors.taupe};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.bark};
    color: ${({ theme }) => theme.colors.bark};
    background: ${({ theme }) => theme.colors.cream};
  }
`

export const AddInput = styled.input`
  padding: 0.3rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 1.5px solid ${({ theme }) => theme.colors.olive};
  background: #fff;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.bark};
  outline: none;
  width: 10rem;

  &::placeholder {
    color: ${({ theme }) => theme.colors.taupe};
  }
`
