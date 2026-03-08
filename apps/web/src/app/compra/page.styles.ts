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

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
`;

export const Title = styled.h1`
  font-family: ${({ theme }) => theme.fontFamily.heading};
  font-size: ${({ theme }) => theme.fontSize['2xl']};
  color: ${({ theme }) => theme.colors.bark};
`;

export const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1.25rem;
  background: ${({ theme }) => theme.colors.bark};
  color: ${({ theme }) => theme.colors.parchment};
  border: none;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  cursor: pointer;
  transition: background 0.15s ease;
  &:hover {
    background: ${({ theme }) => theme.colors.clay};
  }
`;

export const FormCard = styled.div`
  background: ${({ theme }) => theme.colors.parchment};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const FormRow = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  flex-wrap: wrap;
`;

export const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
  min-width: 8rem;
`;

export const Label = styled.label`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.taupe};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
`;

export const QtyInput = styled.input`
  padding: 0.65rem 0.9rem;
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.base};
  color: ${({ theme }) => theme.colors.bark};
  background: ${({ theme }) => theme.colors.white};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.sand};
  }
`;

export const SubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1.1rem;
  background: ${({ theme }) => theme.colors.bark};
  color: ${({ theme }) => theme.colors.parchment};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.base};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  cursor: pointer;
  white-space: nowrap;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  &:not(:disabled):hover {
    background: ${({ theme }) => theme.colors.clay};
  }
`;

export const DropdownWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const DropdownTrigger = styled.button<{ $hasValue: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.9rem;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.base};
  color: ${({ $hasValue, theme }) =>
    $hasValue ? theme.colors.bark : theme.colors.taupe};
  background: ${({ theme }) => theme.colors.white};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s ease;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.sand};
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
  padding: 0.6rem 0.9rem;
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
  max-height: 15rem;
  overflow-y: auto;
  padding: 0.25rem;
`;

export const DropdownOption = styled.button<{ $selected: boolean }>`
  width: 100%;
  text-align: left;
  padding: 0.5rem 0.75rem;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.bark};
  background: ${({ $selected, theme }) =>
    $selected ? theme.colors.parchment : 'transparent'};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  transition: background 0.1s;
  &:hover {
    background: ${({ theme }) => theme.colors.parchment};
  }
`;

export const DropdownOptionMeta = styled.span`
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.taupe};
  margin-left: 0.4rem;
`;

export const DropdownFreeRow = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.taupe};
  background: transparent;
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.cream};
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
  &:hover {
    background: ${({ theme }) => theme.colors.parchment};
    color: ${({ theme }) => theme.colors.bark};
  }
`;

export const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.taupe};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.5rem;
`;

export const EntryList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const EntryCard = styled.li<{ $checked: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  background: ${({ theme }) => theme.colors.white};
  border: 1.5px solid ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.radii.lg};
  opacity: ${({ $checked }) => ($checked ? 0.5 : 1)};
  transition: opacity 0.15s;
`;

export const Checkbox = styled.button<{ $checked: boolean }>`
  flex-shrink: 0;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 2px solid
    ${({ $checked, theme }) =>
      $checked ? theme.colors.bark : theme.colors.sand};
  background: ${({ $checked, theme }) =>
    $checked ? theme.colors.bark : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    border-color: ${({ theme }) => theme.colors.bark};
  }
`;

export const EntryInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const EntryName = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.bark};
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const EntryMeta = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.taupe};
`;

export const Qty = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.taupe};
  white-space: nowrap;
`;

export const DeleteButton = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.taupe};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.radii.sm};
  transition:
    color 0.15s,
    background 0.15s;
  &:hover {
    color: ${({ theme }) => theme.colors.bark};
    background: ${({ theme }) => theme.colors.parchment};
  }
`;

export const EmptyMsg = styled.p`
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.taupe};
  text-align: center;
  padding: 2rem 0;
`;

export const EmptyPromptWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0.5rem 0 1rem;
  margin-top: 2rem;
`;

export const EmptyPromptTitle = styled.p`
  font-family: ${({ theme }) => theme.fontFamily.heading};
  font-size: ${({ theme }) => theme.fontSize['2xl']};
  color: ${({ theme }) => theme.colors.bark};
  line-height: ${({ theme }) => theme.lineHeight.snug};
`;

export const EmptyPromptImage = styled.img`
  width: 600px;
  margin-top: -4rem;
  max-width: 100%;
`;

export const ClearCheckedButton = styled.button`
  align-self: flex-end;
  font-family: ${({ theme }) => theme.fontFamily.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.taupe};
  background: transparent;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  &:hover {
    color: ${({ theme }) => theme.colors.bark};
  }
`;
