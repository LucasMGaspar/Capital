"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { PriceCalculed as PriceCalculedComponent } from "@/components/PriceCalculed";
import { ProductName } from "@/components/productNameClient";
import ContinueBuyingButton from "@/components/cart/ContinueBuyingButton";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import shopCartImage from "@/assets/shop-cart.png";

export default function CartClient() {
  const { cart, decreaseQuantity, addProductIntoCart, removeFromCart } = useCartStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ordenando o carrinho alfabeticamente pelo nome
  const parsedCart = [...cart].sort((a, b) => a.name.localeCompare(b.name));

  // Calculando o valor total do carrinho
  const calculateTotal = () => {
    const total = parsedCart.reduce((acc, product) => {
      const cleanPrice = product.price
        .replace("R$", "")
        .replace(/\s/g, "")
        .replace(",", ".");
      const priceNumber = parseFloat(cleanPrice);
      return acc + priceNumber * product.quantity;
    }, 0);
    return Math.round(total * 100) / 100; // Arredondar para 2 casas decimais
  };

  const totalValue = calculateTotal();

  // Função para lidar com o botão "COMPRAR"
  const handlePurchase = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/createPayment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          valor_final: totalValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao processar a compra.");
      }

      const data = await response.json();

      if (data.paymentLink) {
        // Redirecionar para o link de pagamento
        window.location.href = data.paymentLink;
      } else {
        throw new Error("Link de pagamento não encontrado.");
      }
    } catch (err: any) {
      setError(err.message || "Erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 w-full max-w-[1250px] m-auto flex flex-col md:flex-row">
      {parsedCart.length > 0 ? (
        <div className="w-full md:w-2/3">
          {parsedCart.map((product) => (
            <div
              key={product.id}
              className="flex flex-col justify-center items-center sm:flex-row mb-4 p-4 bg-white shadow-sm border border-zinc-100 rounded-lg"
            >
              <img
                className="h-40 sm:w-28 sm:h-28 object-cover"
                src={product.image}
                alt={product.name}
              />
              <div className="ml-4 flex justify-between w-full gap-3">
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-bold flex flex-wrap mt-3 cursor-pointer hover:underline">
                    <ProductName name={product.name} id={product.id} />
                  </h2>
                  <p className="bg-[#cf964d] text-primary-foreground w-fit px-2 py-[2px] rounded-lg cursor-default text-sm">
                    {product.category}
                  </p>
                  <p className="text-xl font-semibold text-primary">
                    <PriceCalculedComponent price={product.price} />
                  </p>
                </div>
                <div className="flex items-center mt-2 mr-3">
                  <div className="ml-auto flex flex-col justify-center items-end gap-4">
                    <div className="flex items-center border border-gray-300 rounded">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(product)}
                        disabled={product.quantity <= 1}
                        className="px-3 py-1 bg-gray-100 rounded-l hover:bg-gray-200 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="px-3 py-1">{product.quantity}</span>
                      <button
                        type="button"
                        onClick={() => addProductIntoCart(product)}
                        className="px-3 py-1 bg-gray-100 rounded-r hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(product)}
                      className="text-sm text-red-500 hover:text-red-700 transition duration-300 px-3 py-1 m-auto"
                    >
                      <Trash2 />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2 items-center justify-center min-h-[60vh] w-full">
          <Image src={shopCartImage} alt="Carrinho vazio" />
          <p className="text-center p-4 rounded-lg">Nenhum produto no carrinho.</p>
        </div>
      )}
      {parsedCart.length > 0 && (
        <div className="w-full mb-4 md:w-1/3 p-4 bg-white shadow-sm border border-zinc-100 rounded-lg ml-0 md:ml-5">
          <h2 className="text-lg font-bold mb-4 text-primary">Resumo</h2>
          {parsedCart.map((product) => (
            <div
              key={product.id}
              className="flex w-full justify-between mb-5 text-zinc-500"
            >
              <span>{product.name}</span>
              <span className="ml-3 text-zinc-500 font-semibold">
                {product.quantity} × <PriceCalculedComponent price={product.price} />
              </span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-xl mt-4">
            <span>Total:</span>
            <span>R$ {totalValue.toFixed(2)}</span>
          </div>
          <div className="flex flex-col gap-4 mt-4">
            <button
              onClick={handlePurchase}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Processando..." : "COMPRAR"}
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <ContinueBuyingButton />
          </div>
        </div>
      )}
    </div>
  );
}
