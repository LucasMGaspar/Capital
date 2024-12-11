import { create } from "zustand";

type FilterProductStore = {
  selectedFilter: string;
  changeFilteredProduct: (category: string) => void;
}

export const useFilterProductStore = create<FilterProductStore>()((set) => ({
  selectedFilter: "Produtos",
  changeFilteredProduct: (category) => set({ selectedFilter: category }),
}))