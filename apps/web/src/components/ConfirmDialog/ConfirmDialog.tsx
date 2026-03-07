'use client';

import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import {
  Actions,
  Body,
  CancelButton,
  ConfirmButton,
  Dialog,
  Overlay,
  Title,
} from './ConfirmDialog.styles';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onCancel}
        >
          <Dialog
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <Title id="confirm-title">{title}</Title>
            {description && <Body>{description}</Body>}
            <Actions>
              <CancelButton onClick={onCancel} disabled={loading}>
                {cancelLabel}
              </CancelButton>
              <ConfirmButton onClick={onConfirm} disabled={loading}>
                {loading ? 'Eliminando…' : confirmLabel}
              </ConfirmButton>
            </Actions>
          </Dialog>
        </Overlay>
      )}
    </AnimatePresence>
  );
}
