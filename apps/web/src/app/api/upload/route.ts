import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '../../../lib/supabase/admin';

const BUCKET = 'item-images';
const MAX_SIZE_MB = 5;

const uploadSchema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z
    .string()
    .regex(/^image\/(jpeg|png|webp|gif)$/, 'Tipo de archivo no permitido'),
  size: z
    .number()
    .max(MAX_SIZE_MB * 1024 * 1024, `El archivo no puede superar ${MAX_SIZE_MB}MB`),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = uploadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { filename, contentType } = parsed.data;
    const ext = filename.split('.').pop() ?? 'jpg';
    const storagePath = `${crypto.randomUUID()}.${ext}`;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(storagePath);

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? 'No se pudo generar la URL de subida' },
        { status: 500 },
      );
    }

    // Build the public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    return NextResponse.json({
      uploadUrl: data.signedUrl,
      path: storagePath,
      publicUrl,
      contentType,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
    );
  }
}
