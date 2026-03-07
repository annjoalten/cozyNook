import type { StockInfo } from '@nook/core';

function packageUnits(stock: StockInfo): number | null {
  if (stock.type !== 'packages') return null;
  if (typeof stock.unitsPerPackage !== 'number') return null;

  const packageCount = Math.max(0, stock.quantity);
  const unitsPerPackage = Math.max(0, stock.unitsPerPackage);

  if (typeof stock.unitsRemaining === 'number') {
    const remaining = Math.max(0, stock.unitsRemaining);
    if (packageCount <= 0) return remaining;
    return Math.max(0, packageCount - 1) * unitsPerPackage + remaining;
  }

  return packageCount * unitsPerPackage;
}

export function isLowStock(stock: StockInfo, threshold = 1): boolean {
  if (stock.type === 'units') {
    return stock.quantity <= threshold;
  }

  const unitsAvailable = packageUnits(stock);
  if (unitsAvailable !== null) {
    return unitsAvailable <= threshold;
  }

  // Fallback when package has no unit metadata.
  return stock.quantity <= threshold;
}
