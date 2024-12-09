// LoginButton.tsx

"use client";

import { signIn } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";
import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

const LoginButton = ({ children }: Props) => {
  const { resetCart } = useCartStore();

  return (
    <div
      onClick={async () => {
        resetCart(); // Limpa o carrinho ao fazer login, se desejado
        await signIn();
      }}
    >
      {children}
    </div>
  );
};

export default LoginButton;
