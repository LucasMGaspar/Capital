// CartClient.tsx

"use client";

import { useCartStore } from "@/store/cartStore";
import { PriceCalculed as PriceCalculedComponent } from "@/components/PriceCalculed";
import { ProductName } from "@/components/productNameClient";
import ContinueBuyingButton from "@/components/cart/ContinueBuyingButton";
import ModalGeneratePO from "@/components/cart/ModalGeneratePO";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import shopCartImage from "@/assets/shop-cart.png";

export default function CartClient() {
  const { cart, decreaseQuantity, addProductIntoCart, removeFromCart } = useCartStore();

  const parsedCart = cart.sort((a, b) => a.name.localeCompare(b.name));

  const calculateTotal = () => {
    const total = parsedCart.reduce((total, product) => {
      const cleanPrice = product.price
        .replace("R$", "")
        .replace(/\s/g, "")
        .replace(",", ".");
      const priceNumber = parseFloat(cleanPrice);
      return total + priceNumber * product.quantity;
    }, 0);
    return Math.round(total * 100) / 100; // Arredonda para duas casas decimais
  };

  const totalValue = calculateTotal();

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
                  <p className="text-xl font-semibold text-primary ">
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
          <Image src={shopCartImage} alt="" />
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
            <span>
              R$ {totalValue.toFixed(2)}
            </span>
          </div>
          <div className="flex flex-col gap-4 mt-4">
            {/* Botão COMPRAR */}
            <ModalGeneratePO
              buttonLabel="COMPRAR"
              actionType="purchase"
              modalTitle="Ordem de Compra"
              totalValue={totalValue}
            />

            {/* Botão CONTINUAR COMPRANDO */}
            <ContinueBuyingButton />
          </div>
        </div>
      )}
    </div>
  );
}
