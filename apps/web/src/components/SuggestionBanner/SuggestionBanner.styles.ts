import styled from 'styled-components'
import { motion } from 'framer-motion'

export const Banner = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.bark};
`

export const Pill = styled.button`
  background: ${({ theme }) => theme.colors.sand};
  color: ${({ theme }) => theme.colors.parchment};
  border: none;
  border-radius: ${({ theme }) => theme.radii.full};
  padding: 0.2rem 0.75rem;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.bark};
  }
`
