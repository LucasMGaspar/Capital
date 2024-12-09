// LogoutButton.tsx

"use client";

import { signOut } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";
import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

const LogoutButton = ({ children }: Props) => {
  const { resetCart } = useCartStore();

  return (
    <div
      onClick={async () => {
        resetCart(); // Limpa o carrinho
        await signOut();
      }}
    >
      {children}
    </div>
  );
};

export default LogoutButton;
