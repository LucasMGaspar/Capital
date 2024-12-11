"use server";

import { getProductList } from "@/actions/product";
import banner1 from "@/assets/banner-1.jpg";
import { auth } from "@/auth";
import AddProductButton from "@/components/admin/AddProduct";
import { ProductName } from "@/components/productNameClient";
import { SheetCategoriesSidebar } from "@/components/site/CategoriesSidebar";
import DeleteProductButton from "@/components/site/ProductCard/DeleteProductButton";
import UpdateProductButton from "@/components/site/ProductCard/UpdateProductButton";
import Navbar from "@/components/site/navbar";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/categories";
import { useFilterProductStore } from "@/store/filterProductStore";
import useCurrencyStore from "@/store/useCurrencyStore";
import { FolderOpen, Package } from "lucide-react";
import { revalidatePath } from "next/cache";
import { PriceCalculed } from "@/components/PriceCalculed";
import Image from "next/image";
import { updateCurrency } from "@/actions/currency";
import AddProductToCartButton from "@/components/site/ProductCard/AddToCartButton";
import ClearSearchButton from "@/components/ClearSearchButton";

// Função para analisar o código IMPA
function parseImpaCode(code: string) {
  const cleanedCode = code.replace(/\s+/g, "");
  if (cleanedCode.length !== 6) {
    return null;
  }
  const category = parseInt(cleanedCode.substring(0, 2));
  const type = parseInt(cleanedCode.substring(2, 4));
  const detail = parseInt(cleanedCode.substring(4, 6));
  return { category, type, detail };
}

export type ProductsList = {
  id: string;
  name: string;
  cod_prod: string;
  price: string;
  image: string;
  category: string;
  isFeatured: boolean;
};

export default async function Home({ searchParams }: { searchParams: { cod_prod?: string } }) {
  const allProducts = await getProductList();

  // Formatar os preços
  const formattedProducts = allProducts.map((product) => {
    let priceString = product.price.toFixed(2);
    priceString = priceString.replace(".", ",");
    return {
      ...product,
      price: priceString,
    };
  });

  // Obter os filtros atuais
  const filter = useFilterProductStore.getState().selectedFilter;

  // Obter o cod_prod da query e dividir por vírgulas para múltiplos códigos
  const codProdQuery = searchParams.cod_prod?.trim();
  const codProdArray = codProdQuery ? codProdQuery.split(",").map((code) => code.trim()) : [];

  // Lógica de filtragem atualizada com mensagens
  let filteredProducts: ProductsList[] = [];
  let searchMessages: string[] = []; // Array para armazenar mensagens

  if (codProdArray.length > 0) {
    const filteredProductsMap = new Map<string, ProductsList>();

    codProdArray.forEach((code) => {
      const parsedCode = parseImpaCode(code);
      if (!parsedCode) {
        searchMessages.push(`Código IMPA inválido: "${code}".`);
        return; // Ignora códigos inválidos
      }

      // Encontrar produtos com correspondência exata
      const exactMatches = formattedProducts.filter((product) => product.cod_prod === code);
      if (exactMatches.length > 0) {
        exactMatches.forEach((product) => {
          filteredProductsMap.set(product.id, product);
        });
      } else {
        // Não há correspondência exata, encontrar produtos próximos
        const similarProducts = formattedProducts.filter((product) => {
          const productCode = parseImpaCode(product.cod_prod);
          if (!productCode) return false;
          return productCode.category === parsedCode.category && productCode.type === parsedCode.type;
        });

        if (similarProducts.length > 0) {
          searchMessages.push(`Nenhum produto encontrado para "${code}". Mostrando produtos similares.`);
          // Ordenar os produtos similares pela diferença no detalhe
          similarProducts.sort((a, b) => {
            const aDetail = parseImpaCode(a.cod_prod)!.detail;
            const bDetail = parseImpaCode(b.cod_prod)!.detail;
            const detailDifferenceA = Math.abs(aDetail - parsedCode.detail);
            const detailDifferenceB = Math.abs(bDetail - parsedCode.detail);
            return detailDifferenceA - detailDifferenceB;
          });

          // Adicionar os produtos mais próximos
          similarProducts.slice(0, 3).forEach((product) => {
            filteredProductsMap.set(product.id, product);
          });
        } else {
          searchMessages.push(`Nenhum produto encontrado para "${code}", e não há produtos similares.`);
        }
      }
    });

    filteredProducts = Array.from(filteredProductsMap.values());
  } else {
    // Aplicar o filtro existente
    filteredProducts = formattedProducts
      .filter((product) => {
        return filter === "Produtos" ? product.isFeatured : product.category === filter;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  const session = await auth();

  async function serverActionToUpdateExchangeRate(formData: FormData) {
    "use server";
    const setExchangeRate = useCurrencyStore.getState().setExchangeRate;
    const newDollarValue = parseFloat(formData.get("newDollarValue") as string);
    try {
      await updateCurrency({ dollar: newDollarValue });
      setExchangeRate(newDollarValue);
      revalidatePath("/");
    } catch (error) {
      console.error("Failed to update currency:", error);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-20 items-center gap-4 bg-primary px-4 md:px-6 z-10">
        <Navbar />
      </header>
      <main className="flex flex-col items-center">
        <SheetCategoriesSidebar />

        {/* Formulário de Pesquisa */}

        {/* Botão para Limpar a Pesquisa */}
        {searchParams.cod_prod && (
          <div className="flex justify-center mb-8">
            <ClearSearchButton />
          </div>
        )}

        {/* Exibir mensagens de busca */}
        {searchMessages.length > 0 && (
          <div className="max-w-7xl w-full px-4 mb-8">
            {searchMessages.map((message, index) => (
              <p key={index} className="text-red-500 text-center">{message}</p>
            ))}
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:justify-between max-w-7xl w-full text-center lg:text-left text-2xl lg:text-3xl mt-16">
          <h2 className="text-primary font-semibold">
            {codProdQuery ? `Resultado para "${codProdQuery}"` : filter}
          </h2>
          {session?.user.role === "ADMIN" ? (
            <div className="flex flex-col items-center lg:items-end gap-2 lg:gap-5 mt-5 lg:mt-0">
              <span className="flex items-center gap-1 text-lg">
                <span className="font-bold mx-1">{categories.length}</span>
                <FolderOpen />
                Categorias
              </span>
              <span className="flex items-center gap-1 text-lg">
                <span className="font-bold mx-1">{allProducts.length}</span>
                <Package />
                Produtos
              </span>
              <AddProductButton />
            </div>
          ) : null}
        </div>

        {/* Renderização dos produtos */}
        <div className="flex flex-wrap max-w-[1280px] w-full m-auto gap-10 mt-16 justify-center items-center">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product: ProductsList) => (
              <div
                key={product.id}
                className="max-w-[260px] w-full bg-white shadow-md rounded-lg overflow-hidden my-4 transition-transform transform hover:scale-[1.01]"
              >
                <Image src={product.image} alt={product.name} width={200} height={200} className="w-full h-44 object-cover" />
                <div className="p-4">
                  <div className="text-lg break-words h-[130px] text-primary hover:underline cursor-pointer">
                    <ProductName name={product.name} id={product.id} />
                  </div>
                  <div className="text-[#cf964d] text-lg font-bold mb-4">
                    <PriceCalculed price={product.price} />
                  </div>
                  <div className="flex flex-col gap-5">
                    <AddProductToCartButton userRole={session?.user.role} product={product} />
                    <div className="flex justify-between">
                      <UpdateProductButton userRole={session?.user.role} product={product} />
                      <DeleteProductButton product={product} userRole={session?.user.role} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-lg text-gray-500">Nenhum produto encontrado.</p>
          )}
        </div>
      </main>
    </div>
  );
}
