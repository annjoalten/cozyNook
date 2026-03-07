'use client';

import { ImageIcon, SpinnerGapIcon, TrashIcon } from '@phosphor-icons/react';
import { useRef } from 'react';
import { useImageUpload } from '../../hooks/useImageUpload';
import {
  ClearButton,
  DropZone,
  ErrorMsg,
  Preview,
  PreviewWrap,
  Spinner,
} from './ImageUpload.styles';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading, error } = useImageUpload();

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
      {value ? (
        <PreviewWrap>
          <Preview src={value} alt="Vista previa" />
          <ClearButton
            type="button"
            onClick={() => onChange(undefined)}
            aria-label="Eliminar imagen"
          >
            <TrashIcon size={14} weight="bold" />
            Eliminar
          </ClearButton>
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
            {isUploading
              ? 'Subiendo…'
              : 'Haz clic o arrastra una imagen aquí'}
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
