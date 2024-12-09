// ModalGeneratePO.tsx

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface ModalGeneratePOProps {
  buttonLabel: string;
  actionType: "purchase" | "quote";
  modalTitle?: string;
  totalValue: number; // Adicionado aqui
}

export default function ModalGeneratePO({
  buttonLabel,
  actionType,
  modalTitle,
  totalValue,
}: ModalGeneratePOProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Campos do cliente
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verifica se todos os dados estão preenchidos
    if (!nome || !sobrenome || !email || !cpf) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/faturamento/criar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf,
          nome,
          sobrenome,
          email,
          valor_final: totalValue,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar fatura: ${response.statusText}`);
      }

      const fatura = await response.json();
      if (fatura.link_pagamento) {
        // Redireciona para a página de pagamento
        window.location.href = fatura.link_pagamento;
      } else {
        alert("Não foi possível obter o link de pagamento. Tente novamente.");
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error("Erro:", error);
      alert("Falha ao gerar o link de pagamento. Por favor, tente novamente.");
      setIsSubmitting(false);
    }
  };

  const determinedModalTitle =
    modalTitle || (actionType === "quote" ? "Orçamento" : "Ordem de Compra");

  const submitButtonLabel =
    actionType === "quote" ? "Gerar Orçamento" : "Finalizar Compra";

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <button className="mt-4 w-full bg-primary text-white py-2 rounded hover:bg-primary/95 font-bold">
          {buttonLabel}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] lg:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{determinedModalTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 py-2">
            <div className="grid grid-cols-2 gap-[2px] items-center">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                name="nome"
                type="text"
                onChange={(e) => setNome(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-[2px] items-center">
              <Label htmlFor="sobrenome">Sobrenome</Label>
              <Input
                id="sobrenome"
                name="sobrenome"
                type="text"
                onChange={(e) => setSobrenome(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-[2px] items-center">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-[2px] items-center">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                name="cpf"
                type="text"
                onChange={(e) => setCpf(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
          </div>

          <p className="py-2">
            <strong>Total: R$ {totalValue.toFixed(2)}</strong>
          </p>

          <DialogFooter className="mt-5">
            <Button
              disabled={isSubmitting}
              className="disabled:cursor-not-allowed disabled:bg-primary/70"
              type="submit"
              variant="default"
            >
              {isSubmitting ? "Processando..." : submitButtonLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
