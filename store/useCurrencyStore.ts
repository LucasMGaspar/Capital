import { create } from 'zustand';

type Currency = 'BRL' | 'USD';

interface CurrencyState {
    currency: Currency;
    exchangeRate: number;
    setExchangeRate: (newRate: number) => void;
    setCurrency: (newCurrency: Currency) => void;
}

// Cria a store Zustand para gerenciamento do estado de moeda
const useCurrencyStore = create<CurrencyState>((set) => ({
    currency: 'BRL',
    exchangeRate: 0, // Valor inicial padrão, atualizado após a montagem
    setExchangeRate: (newRate) => set({ exchangeRate: newRate }),
    setCurrency: (newCurrency: Currency) => set({ currency: newCurrency }),
}));

export default useCurrencyStore;
