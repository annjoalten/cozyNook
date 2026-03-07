import { keyframes } from 'styled-components';
import styled from 'styled-components';

const shimmer = keyframes`
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
`;

export const Bone = styled.div`
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.cream} 25%,
    ${({ theme }) => theme.colors.parchment} 50%,
    ${({ theme }) => theme.colors.cream} 75%
  );
  background-size: 800px 100%;
  animation: ${shimmer} 1.4s infinite linear;
`;

export const CardGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadow.card};
`;

export const DetailPage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 40rem;
  margin: 0 auto;
  padding: 2.5rem 1rem 4rem;
`;
