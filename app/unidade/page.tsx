"use client"; // Caso esteja usando o app router do Next.js (pasta /app)

import Navbar from "@/components/site/navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SelecaoUnidadePage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Header */}
      <header className="sticky top-0 flex h-20 items-center gap-4 bg-[#1c345c] px-4 md:px-6 z-10">
        <Navbar />
      </header>

      {/* Botões centralizados logo abaixo do Header */}
      <div className="flex justify-center items-center gap-4 mt-6">
        {/* 1º Botão: Redireciona para a mesma página (Home) */}
        <Link href="/" passHref>
          <Button variant="default">Unidade Rio Branco</Button>
        </Link>

        {/* 2º Botão: Redireciona para /unidade2 */}
        <Link href="/unidade2" passHref>
          <Button variant="default">Unidade Joaquim Lirio</Button>
        </Link>
      </div>
    </div>
  );
}
