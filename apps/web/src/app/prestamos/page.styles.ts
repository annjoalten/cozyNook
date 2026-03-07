import Link from 'next/link';
import styled from 'styled-components';

export const Page = styled.main`
  max-width: 40rem;
  margin: 0 auto;
  padding: 2.5rem 1rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
`;

export const TitleGroup = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
`;

export const Title = styled.h1`
  font-family: ${({ theme }) => theme.fontFamily.heading};
  font-size: ${({ theme }) => theme.fontSize['2xl']};
  color: ${({ theme }) => theme.colors.bark};
`;

export const Count = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.taupe};
`;

export const AddBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  background: ${({ theme }) => theme.colors.bark};
  color: ${({ theme }) => theme.colors.parchment};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.85;
  }
`;

export const LoanCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadow.card};
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

export const LoanInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
`;

export const LentTo = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.base};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.bark};
`;

export const ItemLink = styled(Link)`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.taupe};

  &:hover {
    color: ${({ theme }) => theme.colors.bark};
    text-decoration: underline;
  }
`;

export const LoanMeta = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.taupe};
`;

export const ReturnBtn = styled.button`
  flex-shrink: 0;
  padding: 0.4rem 0.9rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  background: transparent;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.bark};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.bark};
    color: ${({ theme }) => theme.colors.parchment};
    border-color: transparent;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const EmptyWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 0;
  color: ${({ theme }) => theme.colors.taupe};
`;

export const EmptyIcon = styled.div`
  opacity: 0.3;
`;

export const EmptyText = styled.p`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.base};
`;

/* ── Modal ── */

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(36, 31, 26, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 80;
`;

export const ModalCard = styled.div`
  width: min(28rem, 100%);
  background: ${({ theme }) => theme.colors.white};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadow.elevated};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
`;

export const ModalTitle = styled.h2`
  font-family: ${({ theme }) => theme.fontFamily.heading};
  font-size: ${({ theme }) => theme.fontSize.lg};
  color: ${({ theme }) => theme.colors.bark};
`;

export const CloseButton = styled.button`
  padding: 0.2rem;
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.taupe};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.bark};
    background: ${({ theme }) => theme.colors.parchment};
  }
`;

export const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

export const FieldLabel = styled.label`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.taupe};
`;

export const FieldInput = styled.input`
  padding: 0.6rem 0.75rem;
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.bark};
  background: ${({ theme }) => theme.colors.parchment};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.bark};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.taupe};
    opacity: 0.6;
  }
`;

export const ModalActions = styled.div`
  display: flex;
  gap: 0.5rem;
  padding-top: 0.25rem;
`;

export const SubmitBtn = styled.button`
  padding: 0.55rem 1.1rem;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.bark};
  color: ${({ theme }) => theme.colors.parchment};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const CancelBtn = styled.button`
  padding: 0.55rem 0.9rem;
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.md};
  background: transparent;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.taupe};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.bark};
  }
`;

/* ── Item dropdown ── */

export const DropdownWrapper = styled.div`
  position: relative;
`;

export const DropdownTrigger = styled.button<{ $hasValue: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.75rem;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ $hasValue, theme }) =>
    $hasValue ? theme.colors.bark : theme.colors.taupe};
  background: ${({ theme }) => theme.colors.parchment};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.bark};
  }
`;

export const DropdownPanel = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.white};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadow.card};
  z-index: 50;
  overflow: hidden;
`;

export const DropdownSearch = styled.input`
  width: 100%;
  padding: 0.55rem 0.75rem;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.bark};
  background: ${({ theme }) => theme.colors.parchment};
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cream};
  outline: none;
  box-sizing: border-box;

  &::placeholder {
    color: ${({ theme }) => theme.colors.taupe};
  }
`;

export const DropdownList = styled.div`
  max-height: 12rem;
  overflow-y: auto;
  padding: 0.25rem;
`;

export const DropdownOption = styled.button`
  width: 100%;
  text-align: left;
  padding: 0.45rem 0.65rem;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.bark};
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: ${({ theme }) => theme.colors.parchment};
  }
`;

export const DropdownMeta = styled.span`
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.taupe};
  margin-left: 0.4rem;
`;

export const DropdownEmpty = styled.p`
  padding: 0.6rem 0.75rem;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.taupe};
`;
