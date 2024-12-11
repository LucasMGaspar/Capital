// ClearSearchButton.tsx

'use client';

import { useFilterProductStore } from "@/store/filterProductStore";

export default function ClearSearchButton() {
  // Função para limpar a pesquisa e resetar o filtro ao estado inicial
  function handleClearSearch(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    event.preventDefault();  // Previne o comportamento padrão do link
    useFilterProductStore.getState().changeFilteredProduct("Produtos");
    window.location.href = "/";  // Redireciona para a página inicial forçando o recarregamento
  }

  return (
    <a 
      href="/" 
      onClick={handleClearSearch}  // Adicionando a função de reset e redirecionamento
      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
    >
      Limpar Pesquisa
    </a>
  );
}
