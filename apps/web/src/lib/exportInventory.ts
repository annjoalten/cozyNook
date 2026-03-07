import type { Item } from '@nook/core';

function escapeCSV(value: string | undefined): string {
  if (!value) return '';
  const str = String(value);
  // Wrap in quotes if contains comma, newline or quote
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToCSV(items: Item[]): void {
  const headers = [
    'Nombre',
    'Descripción',
    'Habitación',
    'Lugar',
    'Etiquetas',
    'Categoría',
    'Creado',
  ];

  const rows = items.map((item) => [
    escapeCSV(item.name),
    escapeCSV(item.description),
    escapeCSV(item.location.room),
    escapeCSV(item.location.spot),
    escapeCSV(item.tags.join('; ')),
    escapeCSV(item.category),
    escapeCSV(new Date(item.createdAt).toLocaleDateString('es-ES')),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadFile(csv, 'inventario-nook.csv', 'text/csv;charset=utf-8;');
}

export function exportToJSON(items: Item[]): void {
  const json = JSON.stringify(items, null, 2);
  downloadFile(json, 'inventario-nook.json', 'application/json');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
