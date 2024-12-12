// cart/page.tsx

"use server";

import Navbar from "@/components/site/navbar";
import CartClient from "@/components/cart/CartClient";

export default async function Cart() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-20 items-center gap-4 bg-[#1c345c] px-4 md:px-6 z-10">
        <Navbar />
      </header>
      <CartClient />
    </div>
  );
}
