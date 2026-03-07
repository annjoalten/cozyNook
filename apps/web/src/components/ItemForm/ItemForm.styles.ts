import styled, { css } from 'styled-components'

const inputBase = css`
  padding: 0.65rem 0.9rem;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.base};
  color: ${({ theme }) => theme.colors.bark};
  background: ${({ theme }) => theme.colors.white};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.md};
  outline: none;
  width: 100%;
  transition: border-color 0.15s ease;

  &:focus { border-color: ${({ theme }) => theme.colors.sand}; }
  &::placeholder { color: ${({ theme }) => theme.colors.taupe}; }
`

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 36rem;
`

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`

export const Label = styled.label`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.bark};
`

export const Input = styled.input`${inputBase}`

export const Textarea = styled.textarea`
  ${inputBase}
  resize: vertical;
  min-height: 5rem;
`

export const ErrorMsg = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.terracotta};
`

export const Hint = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.taupe};
`

export const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`

export const SubmitButton = styled.button`
  align-self: flex-start;
  padding: 0.75rem 2rem;
  background: ${({ theme }) => theme.colors.bark};
  color: ${({ theme }) => theme.colors.parchment};
  border: none;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.base};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover { background: ${({ theme }) => theme.colors.clay}; }
`

export const StockSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.parchment};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
`

export const StockToggle = styled.label`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.bark};

  input[type='checkbox'] {
    width: 1rem;
    height: 1rem;
    accent-color: ${({ theme }) => theme.colors.olive};
    cursor: pointer;
  }
`

export const TypeToggle = styled.div`
  display: flex;
  gap: 0.5rem;
`

export const TypeButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 0.45rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1.5px solid
    ${({ $active, theme }) => ($active ? theme.colors.olive : theme.colors.cream)};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.olive : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.parchment : theme.colors.taupe};
`
