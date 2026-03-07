import styled from 'styled-components'

export const Wrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 42rem;
  margin: 0 auto;
`

export const Input = styled.input`
  width: 100%;
  padding: 1rem 3rem 1rem 3.25rem;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.lg};
  color: ${({ theme }) => theme.colors.bark};
  background: #fff;
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadow.card};
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.taupe};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.sand};
    box-shadow: ${({ theme }) => theme.shadow.elevated};
  }
`

export const IconLeft = styled.span`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.taupe};
  pointer-events: none;
  display: flex;
`

export const ClearButton = styled.button`
  position: absolute;
  right: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.taupe};
  display: flex;
  padding: 0.25rem;
  border-radius: ${({ theme }) => theme.radii.full};
  transition: color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.bark};
  }
`
