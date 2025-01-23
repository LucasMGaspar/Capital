// AddProductToCartButton.tsx

"use client";

import { ProductsList } from "@/app/rio-branco/page";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";

type AddToCartProductButtonProps = {
  userRole: string;
  product: ProductsList;
};

export default function AddProductToCartButton({ userRole, product }: AddToCartProductButtonProps) {
  const { addProductIntoCart } = useCartStore();
  const [quantity, setQuantity] = useState<number>(1);

  function handleAddProductIntoCart(event: React.MouseEvent) {
    event.preventDefault();
    if (quantity > 0) {
      addProductIntoCart({ ...product, quantity });
      setQuantity(1);
    }
  }

  function incrementQuantity() {
    setQuantity((prev) => prev + 1);
  }

  function decrementQuantity() {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  }

  return (
    <>
      {userRole !== "ADMIN" && (
        <div className="w-full flex flex-col gap-2">
          <Button
            className="w-full flex gap-3 justify-center items-center text-sm font-bold bg-primary"
            onClick={handleAddProductIntoCart}
          >
            <ShoppingCart size={20} />
            ADICIONAR AO CARRINHO
          </Button>
          <div className="flex items-center gap-3 justify-center">
            <Button
              className="w-8 h-8 flex justify-center items-center bg-primary text-sm p-0"
              onClick={decrementQuantity}
            >
              -
            </Button>
            <span className="font-bold text-sm">{quantity}</span>
            <Button
              className="w-8 h-8 flex justify-center items-center bg-primary text-sm p-0"
              onClick={incrementQuantity}
            >
              +
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
