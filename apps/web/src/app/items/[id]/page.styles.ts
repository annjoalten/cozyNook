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

export const Back = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.taupe};
  &:hover {
    color: ${({ theme }) => theme.colors.bark};
  }
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadow.card};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const ItemImage = styled.img`
  width: 100%;
  height: 14rem;
  object-fit: cover;
  display: block;
`;

export const CardBody = styled.div`
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Name = styled.h1`
  font-family: ${({ theme }) => theme.fontFamily.heading};
  font-size: ${({ theme }) => theme.fontSize['2xl']};
  color: ${({ theme }) => theme.colors.bark};
  line-height: ${({ theme }) => theme.lineHeight.snug};
`;

export const Description = styled.p`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.base};
  color: ${({ theme }) => theme.colors.taupe};
  line-height: ${({ theme }) => theme.lineHeight.relaxed};
`;

export const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
`;

export const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.cream};
  flex-wrap: wrap;
`;

export const ActionButton = styled.button<{ $danger?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1.5px solid
    ${({ $danger, theme }) =>
      $danger ? theme.colors.terracotta : theme.colors.cream};
  background: transparent;
  color: ${({ $danger, theme }) =>
    $danger ? theme.colors.terracotta : theme.colors.bark};

  &:hover {
    background: ${({ $danger, theme }) =>
      $danger ? theme.colors.terracotta : theme.colors.bark};
    color: ${({ theme }) => theme.colors.parchment};
    border-color: transparent;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const EditTitle = styled.h2`
  font-family: ${({ theme }) => theme.fontFamily.heading};
  font-size: ${({ theme }) => theme.fontSize.xl};
  color: ${({ theme }) => theme.colors.bark};
`;

export const NotFound = styled.p`
  font-family: ${({ theme }) => theme.fontFamily.body};
  color: ${({ theme }) => theme.colors.taupe};
`;

export const StockBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.parchment};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
`;

export const StockLabel = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.taupe};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const StockValue = styled.span<{ $low?: boolean }>`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.base};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ $low, theme }) =>
    $low ? theme.colors.terracotta : theme.colors.bark};
`;

export const SectionTitle = styled.h3`
  font-family: ${({ theme }) => theme.fontFamily.heading};
  font-size: ${({ theme }) => theme.fontSize.base};
  color: ${({ theme }) => theme.colors.bark};
  margin-bottom: 0.5rem;
`;

export const StockControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

export const StockQtyBtn = styled.button`
  width: 2rem;
  height: 2rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  background: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.bark};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.bark};
    background: ${({ theme }) => theme.colors.parchment};
  }
  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

export const StockQtyDisplay = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.base};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.bark};
  min-width: 2rem;
  text-align: center;
`;

export const StockSaveBtn = styled.button`
  padding: 0.35rem 0.85rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: none;
  background: ${({ theme }) => theme.colors.bark};
  color: ${({ theme }) => theme.colors.parchment};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  cursor: pointer;
  transition: opacity 0.15s;
  &:hover:not(:disabled) { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

/* ── Stock alert ── */

export const AlertSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
`;

export const AlertRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

export const AlertToggle = styled.button<{ $active?: boolean }>`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  padding: 0.3rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.bark : theme.colors.cream};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.bark : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.parchment : theme.colors.taupe};
  cursor: pointer;
  transition: all 0.15s ease;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const AlertLabel = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.taupe};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const AlertInputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

export const AlertInput = styled.input`
  width: 5rem;
  padding: 0.3rem 0.5rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.bark};
  background: ${({ theme }) => theme.colors.white};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.bark};
  }
`;

export const AlertSaveBtn = styled.button`
  padding: 0.3rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  background: transparent;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
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

/* ── Loans ── */

export const LoansCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadow.card};
  padding: 1.25rem 1.75rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const LoanList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const LoanRow = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.parchment};
`;

export const LoanInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
`;

export const LoanName = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.bark};
`;

export const LoanMeta = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.taupe};
`;

export const ReturnBtn = styled.button`
  flex-shrink: 0;
  padding: 0.3rem 0.65rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  background: transparent;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
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

export const LoanForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
`;

export const LoanInput = styled.input`
  padding: 0.4rem 0.6rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.bark};
  background: ${({ theme }) => theme.colors.white};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.bark};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.taupe};
    opacity: 0.6;
  }
`;

export const LoanFormActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const LoanSubmitBtn = styled.button`
  padding: 0.4rem 0.9rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: none;
  background: ${({ theme }) => theme.colors.bark};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.parchment};
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const LoanCancelBtn = styled.button`
  padding: 0.4rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  background: transparent;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.taupe};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.bark};
  }
`;

export const EmptyLoans = styled.p`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.taupe};
`;
