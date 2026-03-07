'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useItemStore } from '../../store/itemStore'
import { RoomDropdown } from '../RoomDropdown'
import { Form, Field, Label, Input, Textarea, ErrorMsg, Hint, Row, SubmitButton } from './ItemForm.styles'
import { itemSchema, type FormValues, type FormErrors, type ItemFormProps } from './ItemForm.types'

export function ItemForm({ initial }: ItemFormProps) {
  const router = useRouter()
  const { addItem, updateItem } = useItemStore()
  const isEdit = !!initial

  const [values, setValues] = useState<FormValues>({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    location: {
      room: initial?.location.room ?? '',
      spot: initial?.location.spot ?? '',
    },
    tags: initial?.tags.join(', ') ?? '',
    category: initial?.category ?? '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const set = (field: string, value: string) => {
    if (field === 'location.room' || field === 'location.spot') {
      const key = field.split('.')[1] as 'room' | 'spot'
      setValues((v) => ({ ...v, location: { ...v.location, [key]: value } }))
    } else {
      setValues((v) => ({ ...v, [field]: value }))
    }
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = itemSchema.safeParse(values)

    if (!result.success) {
      const flat = result.error.flatten()
      setErrors({
        ...(flat.fieldErrors as FormErrors),
        'location.room': flat.fieldErrors.location?.[0],
        'location.spot': flat.fieldErrors.location?.[0],
      })
      return
    }

    const data = {
      name: result.data.name,
      description: result.data.description,
      location: result.data.location,
      tags: result.data.tags.split(',').map((t) => t.trim()).filter(Boolean),
      category: result.data.category,
    }

    if (isEdit && initial) {
      updateItem(initial.id, data)
      router.push(`/items/${initial.id}`)
    } else {
      addItem(data)
      router.push('/items')
    }
  }

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
          {errors['location.room'] && <ErrorMsg>{errors['location.room']}</ErrorMsg>}
        </Field>

        <Field>
          <Label htmlFor="spot">Lugar exacto</Label>
          <Input
            id="spot"
            value={values.location.spot}
            onChange={(e) => set('location.spot', e.target.value)}
            placeholder="Cajón izquierdo, estante alto…"
          />
          {errors['location.spot'] && <ErrorMsg>{errors['location.spot']}</ErrorMsg>}
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
        <Hint>Separados por comas — te ayudan a encontrarlo con otras palabras</Hint>
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

      <SubmitButton type="submit">
        {isEdit ? 'Guardar cambios' : 'Añadir objeto'}
      </SubmitButton>
    </Form>
  )
}
