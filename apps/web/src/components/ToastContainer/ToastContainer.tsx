'use client';

import { CheckCircle, Info, WarningCircle, X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useUIStore, type Toast } from '../../store/uiStore';
import {
  CloseButton,
  IconWrap,
  Message,
  ToastItem,
  Viewport,
} from './ToastContainer.styles';

const ICONS = {
  success: <CheckCircle size={18} weight="fill" />,
  error: <WarningCircle size={18} weight="fill" />,
  info: <Info size={18} weight="fill" />,
} as const;

const AUTO_DISMISS_MS = 4000;

function ToastEntry({ toast }: { toast: Toast }) {
  const removeToast = useUIStore((s) => s.removeToast);

  useEffect(() => {
    const t = setTimeout(() => removeToast(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [toast.id, removeToast]);

  return (
    <ToastItem
      $type={toast.type}
      as={motion.div}
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      layout
    >
      <IconWrap $type={toast.type}>{ICONS[toast.type]}</IconWrap>
      <Message>{toast.message}</Message>
      <CloseButton onClick={() => removeToast(toast.id)} aria-label="Cerrar">
        <X size={14} weight="bold" />
      </CloseButton>
    </ToastItem>
  );
}

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);

  return (
    <Viewport>
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastEntry key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </Viewport>
  );
}
