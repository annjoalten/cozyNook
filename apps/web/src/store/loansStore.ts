import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useUIStore } from './uiStore';

export interface Loan {
  id: string;
  item_id: string;
  lent_to: string;
  note: string | null;
  lent_at: string;
  returned_at: string | null;
  item: { id: string; name: string } | null;
}

interface LoansState {
  loans: Loan[];
  isLoading: boolean;
  hasLoaded: boolean;
  loadLoans: () => Promise<void>;
  loadItemLoans: (item_id: string) => Promise<Loan[]>;
  addLoan: (payload: { item_id: string; lent_to: string; note?: string }) => Promise<Loan | null>;
  returnLoan: (id: string) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
}

const toast = {
  success: (msg: string) => useUIStore.getState().addToast(msg, 'success'),
  error: (msg: string) => useUIStore.getState().addToast(msg, 'error'),
};

export const useLoansStore = create<LoansState>()(
  devtools(
    (set, get) => ({
      loans: [],
      isLoading: false,
      hasLoaded: false,

      loadLoans: async () => {
        if (get().isLoading) return;
        set({ isLoading: true }, false, 'loadLoans:start');
        try {
          const res = await fetch('/api/loans', { cache: 'no-store' });
          if (!res.ok) throw new Error('No se pudieron cargar los préstamos');
          const loans = (await res.json()) as Loan[];
          set({ loans, hasLoaded: true }, false, 'loadLoans:success');
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : 'Error cargando préstamos',
          );
        } finally {
          set({ isLoading: false }, false, 'loadLoans:end');
        }
      },

      loadItemLoans: async (item_id) => {
        try {
          const res = await fetch(`/api/loans?item_id=${item_id}`, {
            cache: 'no-store',
          });
          if (!res.ok) return [];
          return (await res.json()) as Loan[];
        } catch {
          return [];
        }
      },

      addLoan: async (payload) => {
        try {
          const res = await fetch('/api/loans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const { error } = await res.json();
            throw new Error(error ?? 'No se pudo registrar el préstamo');
          }
          const loan = (await res.json()) as Loan;
          set(
            (state) => ({ loans: [loan, ...state.loans] }),
            false,
            'addLoan:success',
          );
          toast.success('Préstamo registrado');
          return loan;
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : 'Error registrando préstamo',
          );
          return null;
        }
      },

      returnLoan: async (id) => {
        try {
          const res = await fetch(`/api/loans/${id}`, { method: 'PATCH' });
          if (!res.ok) throw new Error('No se pudo marcar como devuelto');
          const updated = (await res.json()) as Loan;
          set(
            (state) => ({
              loans: state.loans.map((l) => (l.id === id ? updated : l)),
            }),
            false,
            'returnLoan:success',
          );
          toast.success('Objeto devuelto');
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : 'Error actualizando préstamo',
          );
        }
      },

      deleteLoan: async (id) => {
        try {
          const res = await fetch(`/api/loans/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('No se pudo eliminar');
          set(
            (state) => ({ loans: state.loans.filter((l) => l.id !== id) }),
            false,
            'deleteLoan:success',
          );
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : 'Error eliminando préstamo',
          );
        }
      },
    }),
    { name: 'nook/loans' },
  ),
);
