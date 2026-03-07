import styled from 'styled-components'

export const Wrapper = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.taupe};
`

export const Crumb = styled.span`
  background: ${({ theme }) => theme.colors.parchment};
  border: 1px solid ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 0.1rem 0.45rem;
  color: ${({ theme }) => theme.colors.bark};
`

export const Sep = styled.span`
  color: ${({ theme }) => theme.colors.cream};
  font-size: ${({ theme }) => theme.fontSize.base};
  user-select: none;
`
