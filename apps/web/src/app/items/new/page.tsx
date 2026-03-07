'use client';

import { ArrowLeft } from '@phosphor-icons/react';
import { ItemForm } from '../../../components/ItemForm';
import { Back, Page, Title } from './page.styles';

export default function NewItemPage() {
  return (
    <Page>
      <Back href="/items">
        <ArrowLeft size={16} weight="light" />
        Volver al inventario
      </Back>
      <Title>Añadir</Title>
      <ItemForm />
    </Page>
  );
}
