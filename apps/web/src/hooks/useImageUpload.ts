import { useState } from 'react';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_MB = 10;

interface UploadResult {
  publicUrl: string;
  path: string;
}

interface UseImageUploadReturn {
  upload: (file: File) => Promise<UploadResult | null>;
  isUploading: boolean;
  error: string | null;
}

export function useImageUpload(): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File): Promise<UploadResult | null> => {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Solo se permiten imágenes JPG, PNG, WebP o GIF');
      return null;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`La imagen no puede superar ${MAX_SIZE_MB}MB`);
      return null;
    }

    setIsUploading(true);

    try {
      // 1. Obtener URL firmada
      const metaRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });

      if (!metaRes.ok) {
        const { error: msg } = await metaRes.json();
        throw new Error(msg ?? 'Error preparando la subida');
      }

      const { uploadUrl, publicUrl, path } = await metaRes.json();

      // 2. Subir el archivo directamente a Supabase Storage
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error('Error subiendo la imagen');
      }

      return { publicUrl, path };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error subiendo imagen');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading, error };
}
