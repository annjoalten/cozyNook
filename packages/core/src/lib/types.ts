export interface Item {
  id: string;
  name: string;
  description?: string;
  location: {
    room: string;
    spot: string;
  };
  tags: string[];
  category?: string;
  imageUrl?: string;
  createdAt: string;
}

export const ROOMS = [
  'Cocina',
  'Salón',
  'Dormitorio principal',
  'Dormitorio secundario',
  'Baño principal',
  'Baño de invitados',
  'Trastero',
  //'Garaje',
  //'Terraza',
  //'Pasillo',
  'Entrada',
  'Estudio',
  'Otro',
] as const;

export type Room = (typeof ROOMS)[number];
