import styled from 'styled-components';
import type { Toast } from '../../store/uiStore';

const typeColors = {
  success: { bg: '#2d6a4f', text: '#ffffff', icon: '#95d5b2' },
  error: { bg: '#8b1a1a', text: '#ffffff', icon: '#f4a9a8' },
  info: { bg: '#59422E', text: '#F5F0E8', icon: '#BF926B' },
} as const;

export const Viewport = styled.div`
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 22rem;
  width: calc(100vw - 3rem);
  pointer-events: none;
`;

export const ToastItem = styled.div<{ $type: Toast['type'] }>`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 0.9rem;
  border-radius: 10px;
  background: ${({ $type }) => typeColors[$type].bg};
  color: ${({ $type }) => typeColors[$type].text};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  pointer-events: all;
`;

export const IconWrap = styled.span<{ $type: Toast['type'] }>`
  flex-shrink: 0;
  color: ${({ $type }) => typeColors[$type].icon};
  display: flex;
`;

export const Message = styled.span`
  flex: 1;
  line-height: 1.4;
`;

export const CloseButton = styled.button`
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 0.15rem;
  cursor: pointer;
  color: inherit;
  opacity: 0.6;
  display: flex;
  align-items: center;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
  }
`;
