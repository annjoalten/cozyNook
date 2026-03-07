'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useItemStore } from '../../store/itemStore';
import { ImageUpload } from '../ImageUpload';
import { RoomDropdown } from '../RoomDropdown';
import {
  ErrorMsg,
  Field,
  Form,
  Hint,
  Input,
  Label,
  Row,
  StockSection,
  StockToggle,
  SubmitButton,
  Textarea,
  TypeButton,
  TypeToggle,
} from './ItemForm.styles';
import {
  itemSchema,
  type FormErrors,
  type FormValues,
  type ItemFormProps,
  type StockFormState,
} from './ItemForm.types';

const initialStock = (initial?: ItemFormProps['initial']): StockFormState => ({
  enabled: !!initial?.stock,
  type: initial?.stock?.type ?? 'units',
  quantity: String(initial?.stock?.quantity ?? ''),
  unitsPerPackage: String(initial?.stock?.unitsPerPackage ?? ''),
  unitsRemaining: String(initial?.stock?.unitsRemaining ?? ''),
});

export function ItemForm({ initial }: ItemFormProps) {
  const router = useRouter();
  const { addItem, updateItem } = useItemStore();
  const isEdit = !!initial;

  const [values, setValues] = useState<FormValues>({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    location: {
      room: initial?.location.room ?? '',
      spot: initial?.location.spot ?? '',
    },
    tags: initial?.tags.join(', ') ?? '',
    category: initial?.category ?? '',
  });
  const [imageUrl, setImageUrl] = useState<string | undefined>(initial?.imageUrl);
  const [stock, setStock] = useState<StockFormState>(initialStock(initial));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (field: string, value: string) => {
    if (field === 'location.room' || field === 'location.spot') {
      const key = field.split('.')[1] as 'room' | 'spot';
      setValues((v) => ({ ...v, location: { ...v.location, [key]: value } }));
    } else {
      setValues((v) => ({ ...v, [field]: value }));
    }
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const buildStock = () => {
    if (!stock.enabled) return undefined;
    const quantity = parseInt(stock.quantity, 10);
    if (isNaN(quantity)) return undefined;
    return {
      type: stock.type,
      quantity,
      ...(stock.type === 'packages' && stock.unitsPerPackage
        ? { unitsPerPackage: parseInt(stock.unitsPerPackage, 10) }
        : {}),
      ...(stock.type === 'packages' && stock.unitsRemaining
        ? { unitsRemaining: parseInt(stock.unitsRemaining, 10) }
        : {}),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    const result = itemSchema.safeParse(values);

    if (!result.success) {
      const flat = result.error.flatten();
      setErrors({
        ...(flat.fieldErrors as FormErrors),
        'location.room': flat.fieldErrors.location?.[0],
        'location.spot': flat.fieldErrors.location?.[0],
      });
      return;
    }

    const data = {
      name: result.data.name,
      description: result.data.description,
      location: result.data.location,
      tags: result.data.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      category: result.data.category,
      imageUrl,
      stock: buildStock(),
    };

    setIsSubmitting(true);

    if (isEdit && initial) {
      const updated = await updateItem(initial.id, data);
      if (updated) {
        router.push(`/items/${initial.id}`);
      } else {
        setSubmitError('No se pudo guardar. Intenta de nuevo.');
      }
    } else {
      const created = await addItem(data);
      if (created) {
        router.push('/items');
      } else {
        setSubmitError('No se pudo crear el objeto. Intenta de nuevo.');
      }
    }

    setIsSubmitting(false);
  };

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <Field>
        <Label htmlFor="name">Nombre del objeto</Label>
        <Input
          id="name"
          value={values.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Destornillador estrella, adaptador HDMI…"
        />
        {errors.name && <ErrorMsg>{errors.name}</ErrorMsg>}
      </Field>

      <Field>
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Textarea
          id="description"
          value={values.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Detalles que te ayuden a identificarlo"
        />
      </Field>

      <Row>
        <Field>
          <Label>Habitación</Label>
          <RoomDropdown
            value={values.location.room}
            onChange={(room) => set('location.room', room)}
          />
          {errors['location.room'] && (
            <ErrorMsg>{errors['location.room']}</ErrorMsg>
          )}
        </Field>

        <Field>
          <Label htmlFor="spot">Lugar exacto</Label>
          <Input
            id="spot"
            value={values.location.spot}
            onChange={(e) => set('location.spot', e.target.value)}
            placeholder="Cajón izquierdo, estante alto…"
          />
          {errors['location.spot'] && (
            <ErrorMsg>{errors['location.spot']}</ErrorMsg>
          )}
        </Field>
      </Row>

      <Field>
        <Label htmlFor="tags">Sinónimos / etiquetas</Label>
        <Input
          id="tags"
          value={values.tags}
          onChange={(e) => set('tags', e.target.value)}
          placeholder="tornillo, phillips, herramienta"
        />
        <Hint>
          Separados por comas — te ayudan a encontrarlo con otras palabras
        </Hint>
      </Field>

      <Field>
        <Label htmlFor="category">Categoría (opcional)</Label>
        <Input
          id="category"
          value={values.category}
          onChange={(e) => set('category', e.target.value)}
          placeholder="Herramientas, Electrónica, Cocina…"
        />
      </Field>

      <StockSection>
        <StockToggle>
          <input
            type="checkbox"
            checked={stock.enabled}
            onChange={(e) => setStock((s) => ({ ...s, enabled: e.target.checked }))}
          />
          Llevar control de stock
        </StockToggle>

        {stock.enabled && (
          <>
            <TypeToggle>
              <TypeButton
                type="button"
                $active={stock.type === 'units'}
                onClick={() => setStock((s) => ({ ...s, type: 'units' }))}
              >
                Unidades
              </TypeButton>
              <TypeButton
                type="button"
                $active={stock.type === 'packages'}
                onClick={() => setStock((s) => ({ ...s, type: 'packages' }))}
              >
                Paquetes
              </TypeButton>
            </TypeToggle>

            {stock.type === 'units' && (
              <Field>
                <Label htmlFor="stock-qty">Cantidad de unidades</Label>
                <Input
                  id="stock-qty"
                  type="number"
                  min="0"
                  value={stock.quantity}
                  onChange={(e) => setStock((s) => ({ ...s, quantity: e.target.value }))}
                  placeholder="3"
                />
              </Field>
            )}

            {stock.type === 'packages' && (
              <>
                <Field>
                  <Label htmlFor="stock-pkgs">Número de paquetes</Label>
                  <Input
                    id="stock-pkgs"
                    type="number"
                    min="0"
                    value={stock.quantity}
                    onChange={(e) => setStock((s) => ({ ...s, quantity: e.target.value }))}
                    placeholder="2"
                  />
                </Field>
                <Row>
                  <Field>
                    <Label htmlFor="stock-upp">Unidades por paquete</Label>
                    <Input
                      id="stock-upp"
                      type="number"
                      min="1"
                      value={stock.unitsPerPackage}
                      onChange={(e) => setStock((s) => ({ ...s, unitsPerPackage: e.target.value }))}
                      placeholder="12"
                    />
                  </Field>
                  <Field>
                    <Label htmlFor="stock-rem">Unidades restantes (paquete abierto)</Label>
                    <Input
                      id="stock-rem"
                      type="number"
                      min="0"
                      value={stock.unitsRemaining}
                      onChange={(e) => setStock((s) => ({ ...s, unitsRemaining: e.target.value }))}
                      placeholder="7"
                    />
                  </Field>
                </Row>
              </>
            )}
          </>
        )}
      </StockSection>

      <Field>
        <Label>Foto (opcional)</Label>
        <ImageUpload value={imageUrl} onChange={setImageUrl} />
      </Field>

      {submitError && <ErrorMsg>{submitError}</ErrorMsg>}

      <SubmitButton type="submit" disabled={isSubmitting}>
        {isEdit ? 'Guardar cambios' : 'Añadir objeto'}
      </SubmitButton>
    </Form>
  );
}
