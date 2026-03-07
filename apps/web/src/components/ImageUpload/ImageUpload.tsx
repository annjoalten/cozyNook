'use client';

import {
  ImageIcon,
  PencilSimpleLine,
  SpinnerGapIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { useRef } from 'react';
import { useImageUpload } from '../../hooks/useImageUpload';
import {
  ClearButton,
  DropZone,
  EditOverlayButton,
  ErrorMsg,
  Preview,
  PreviewFrame,
  PreviewWrap,
  Spinner,
} from './ImageUpload.styles';

interface ImageUploadProps {
  value?: string;
  displayValue?: string;
  showRemove?: boolean;
  onChange: (url: string | undefined) => void;
}

export function ImageUpload({
  value,
  displayValue,
  showRemove = true,
  onChange,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading, error } = useImageUpload();
  const previewSrc = value ?? displayValue;

  const handleFile = async (file: File) => {
    const result = await upload(file);
    if (result) onChange(result.publicUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      {previewSrc ? (
        <PreviewWrap>
          <PreviewFrame>
            <Preview src={previewSrc} alt="Vista previa" />
            <EditOverlayButton
              type="button"
              onClick={() => !isUploading && inputRef.current?.click()}
              aria-label="Editar imagen"
              disabled={isUploading}
            >
              <PencilSimpleLine size={14} weight="bold" />
            </EditOverlayButton>
          </PreviewFrame>
          {showRemove && value ? (
            <ClearButton
              type="button"
              onClick={() => onChange(undefined)}
              aria-label="Eliminar imagen"
            >
              <TrashIcon size={14} weight="bold" />
              Eliminar
            </ClearButton>
          ) : null}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: 'none' }}
            onChange={handleChange}
          />
        </PreviewWrap>
      ) : (
        <DropZone
          $loading={isUploading}
          onClick={() => !isUploading && inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          aria-label="Subir imagen"
        >
          {isUploading ? (
            <Spinner as={SpinnerGapIcon} size={24} weight="bold" />
          ) : (
            <ImageIcon size={24} weight="light" />
          )}
          <span>
            {isUploading ? 'Subiendo…' : 'Haz clic o arrastra una imagen aquí'}
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: 'none' }}
            onChange={handleChange}
          />
        </DropZone>
      )}
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </div>
  );
}
