// CartIcon.tsx

"use client";

import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function CartIcon() {
  const { cart } = useCartStore();
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <Link href="/cart" className="relative">
      <ShoppingCart className="flex w-8 cursor-pointer text-white font-bold relative" />
      {totalItems > 0 && (
        <span className="absolute top-[-4px] right-[-3px] bg-red-400 rounded-full w-4 h-4 flex justify-center items-center text-xs font-bold text-primary-foreground cursor-pointer">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
