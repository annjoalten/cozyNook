import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

export const DropZone = styled.div<{ $loading: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem;
  border: 2px dashed ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.lg};
  color: ${({ theme }) => theme.colors.taupe};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  text-align: center;
  cursor: ${({ $loading }) => ($loading ? 'not-allowed' : 'pointer')};
  transition:
    border-color 0.15s,
    color 0.15s;
  background: ${({ theme }) => theme.colors.parchment};

  &:hover {
    border-color: ${({ $loading, theme }) =>
      $loading ? theme.colors.cream : theme.colors.sand};
    color: ${({ $loading, theme }) =>
      $loading ? theme.colors.taupe : theme.colors.bark};
  }
`;

export const Spinner = styled.div`
  animation: ${spin} 0.8s linear infinite;
`;

export const PreviewWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const PreviewFrame = styled.div`
  position: relative;
`;

export const Preview = styled.img`
  width: 100%;
  height: 14rem;
  object-fit: contain;
  background: ${({ theme }) => theme.colors.parchment};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
`;

export const EditOverlayButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.8rem;
  height: 1.8rem;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: ${({ theme }) => theme.colors.bark};
  box-shadow: ${({ theme }) => theme.shadow.card};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.white};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const ClearButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  align-self: flex-start;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.terracotta};
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.75;
  }
`;

export const ErrorMsg = styled.p`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.terracotta};
  margin: 0.35rem 0 0;
`;
