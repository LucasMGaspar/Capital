"use server";

import DashboardRedirectButton from "@/components/admin/DashboardRedirectButton";
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
import useCurrencyStore from "@/store/useCurrencyStore";
import { FolderOpen, Package } from "lucide-react";
import { revalidatePath } from "next/cache";
import { PriceCalculed } from "@/components/PriceCalculed";
import Image from "next/image";
import { updateCurrency } from "@/actions/currency";
import AddProductToCartButton from "@/components/site/ProductCard/AddToCartButton";
import ClearSearchButton from "@/components/ClearSearchButton";
import Link from "next/link"; // Import para navegação

export type ProductsList = {
  id: string;
  name: string;
  cod_prod: string;
  price: string;
  image: string;
  category: string;
  isFeatured: boolean;
  stock_quantity: number;
  unidade: string;
};

export default async function Home({
  searchParams,
}: {
  searchParams: { cod_prod?: string };
}) {
  const allProducts = await getProductList();

  // Filtrar apenas os produtos da UNIDADE_1 e formatar o preço
  const filteredProducts = allProducts
    .filter((product) => product.unidade === "UNIDADE_1")
    .map((product) => {
      let priceString = product.price.toFixed(2);
      priceString = priceString.replace(".", ",");
      return {
        ...product,
        price: priceString,
      };
    });

  const session = await auth();

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Header */}
      <header className="sticky top-0 flex h-20 items-center gap-4 bg-[#1c345c] px-4 md:px-6 z-10">
        <Navbar />
      </header>

     

      <main className="flex flex-col items-center">
        <SheetCategoriesSidebar />

        <div className="flex flex-col lg:flex-row items-center lg:justify-between max-w-7xl w-full text-center text-2xl lg:text-3xl mt-16">
          <h2 className="text-primary font-semibold">
            Produtos da Unidade Rio Branco
          </h2>


          {/* Se o usuário for ADMIN, mostramos algumas estatísticas e o botão de adicionar produto */}
          {session?.user.role === "ADMIN" && (
            <div className="flex flex-col items-center lg:items-end gap-2 lg:gap-5 mt-5 lg:mt-0">
              <span className="flex items-center gap-1 text-lg">
                <span className="font-bold mx-1">{categories.length}</span>
                <FolderOpen />
                Categorias
              </span>
              <span className="flex items-center gap-1 text-lg">
                <span className="font-bold mx-1">{filteredProducts.length}</span>
                <Package />
                Produtos
              </span>
              <AddProductButton />
              <DashboardRedirectButton />
            </div>
          )}
        </div>

        {/* Cards de Produtos */}
        <div className="flex flex-wrap max-w-[1280px] w-full m-auto gap-10 mt-16 justify-center items-center">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product: ProductsList) => (
              <div
                key={product.id}
                className="max-w-[260px] w-full bg-white shadow-md rounded-lg overflow-hidden my-4 transition-transform transform hover:scale-[1.01]"
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  width={200}
                  height={200}
                  className="w-full h-44 object-cover"
                />
                <div className="p-4">
                  <div className="text-lg break-words h-[130px] text-primary hover:underline cursor-pointer">
                    <ProductName name={product.name} id={product.id} />
                  </div>
                  <div className="text-[#cf964d] text-lg font-bold mb-4 text-center">
                    <PriceCalculed price={product.price} />
                  </div>
                
                  <div className="flex flex-col gap-5">
                    <AddProductToCartButton
                      userRole={session?.user.role}
                      product={product}
                    />
                    <div className="flex justify-between">
                      <UpdateProductButton
                        userRole={session?.user.role}
                        product={product}
                      />
                      <DeleteProductButton
                        product={product}
                        userRole={session?.user.role}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-lg text-gray-500">
              Nenhum produto encontrado na Unidade 1.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
