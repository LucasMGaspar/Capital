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
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";

interface Item {
  description: string;
  value: string;
  qty: number;
  image: string;
}

interface FormData {
  vessel: string;
  rfq: string;
  place: string;
  eta: string;
  etb: string;
  ets: string;
  requester: string;
  contact: string;
  items: Item[];
  portvalue: string;
  portpromo: string;
  value: number;
  days: string;
}

interface ModalGeneratePOProps {
  buttonLabel: string;
  actionType: "purchase" | "quote";
  modalTitle?: string; // Opcional, para personalizar o título
}

export default function ModalGeneratePO({
  buttonLabel,
  actionType,
  modalTitle,
}: ModalGeneratePOProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { cart } = useCartStore(); // Obtém os itens do carrinho
  const [formData, setFormData] = useState<FormData>({
    vessel: "",
    rfq: "",
    place: "",
    eta: "",
    etb: "",
    ets: "",
    requester: "",
    contact: "",
    items: [], // Será preenchido com os itens do carrinho
    portvalue: "",
    portpromo: "",
    value: 0, // Valor total do carrinho
    days: "",
  });

  // Calcula o subtotal do carrinho
  const calculateCartSubtotal = () => {
    return cart.reduce((total, product) => {
      const cleanPrice = product.price
        .replace("R$", "")
        .replace(/\s/g, "")
        .replace(",", ".");
      const priceNumber = parseFloat(cleanPrice);
      return total + priceNumber * product.quantity;
    }, 0);
  };

  // Atualiza o valor total do formulário quando o carrinho ou portvalue mudar
  useEffect(() => {
    const subtotal = calculateCartSubtotal();
    let shippingCost = 0;
    if (formData.portvalue) {
      const portValueParts = formData.portvalue.split("|");
      if (portValueParts.length > 1) {
        shippingCost = parseFloat(portValueParts[1].replace("R$", "").trim());
      }
    }

    // Aplica frete grátis se subtotal >= 1000
    if (subtotal >= 1000) {
      shippingCost = 0;
    }

    const totalValue = subtotal + shippingCost;
    setFormData((prevFormData) => ({
      ...prevFormData,
      value: totalValue,
      items: cart.map((product) => ({
        description: product.name,
        value: product.price,
        qty: product.quantity,
        image: product.image,
      })),
    }));
  }, [cart, formData.portvalue]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/generate-po", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reqData: formData, actionType }),
      });

      // Verifique se a resposta é OK
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // Recebe o PDF como um blob binário
      const blob = await res.blob();

      // Cria uma URL para o blob e força o download do PDF
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        actionType === "quote" ? "Orçamento.pdf" : "OrdemDeCompra.pdf"; // Nome do arquivo
      document.body.appendChild(a);
      a.click();
      a.remove();

      setIsSubmitting(false);
      setIsDialogOpen(false); // Fecha o diálogo após gerar o pedido
    } catch (error) {
      console.error("Error:", error);
      alert(
        actionType === "quote"
          ? "Falha ao gerar o Orçamento. Por favor, tente novamente mais tarde."
          : "Falha ao gerar a Ordem de Compra. Por favor, tente novamente mais tarde."
      );
      setIsSubmitting(false);
    }
  };

  // Determina o título do modal com base no actionType, se modalTitle não for fornecido
  const determinedModalTitle =
    modalTitle || (actionType === "quote" ? "Orçamento" : "Ordem de Compra");

  // Determina o rótulo do botão de submissão com base no actionType
  const submitButtonLabel =
    actionType === "quote" ? "Gerar PDF do Orçamento" : "Gerar Ordem de Compra";

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
            <div className="flex gap-4">
              <div className="grid grid-cols-2 gap-[2px] items-center w-full">
                <Label htmlFor="vessel">Nome</Label>
                <Input
                  id="vessel"
                  name="vessel"
                  type="text"
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-[2px] items-center">
                <Label htmlFor="place">Bandeira</Label>
                <Input
                  id="place"
                  name="place"
                  type="text"
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-[2px] items-center">
              <Label htmlFor="rfq">Navio</Label>
              <Input
                id="rfq"
                name="rfq"
                type="text"
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-[2px] items-center">
              <Label htmlFor="portvalue">Porto</Label>
              <select
                id="portvalue"
                name="portvalue"
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 col-span-3"
                required
              >
                <option value="">Selecione um porto</option>
                <optgroup label="Frete Grátis em compras acima de R$1000,00">
                  <option value="PORTOCEL|R$100|1 dias">
                    PORTOCEL | R$100 | 1 dias
                  </option>
                  <option value="PRAIAMOLE|R$100|1 dias">
                    PRAIA MOLE | R$100 | 1 dias
                  </option>
                  <option value="TUBARAO|R$100|1 dias">
                    TUBARÃO | R$100 | 1 dias
                  </option>
                  <option value="VITORIA|R$100|1 dias">
                    VITÓRIA | R$100 | 1 dias
                  </option>
                  <option value="PONTAUBU|R$100|1 dias">
                    PONTA UBÚ | R$100 | 1 dias
                  </option>
                  <option value="PONTAACU|R$200|2 dias">
                    PONTA AÇU | R$200 | 2 dias
                  </option>
                  <option value="MACAE|R$200|2 dias">
                    MACAÉ | R$200 | 2 dias
                  </option>
                  <option value="RIODEJANEIRO|R$100|1 dias">
                    RIO DE JANEIRO | R$100 | 1 dias
                  </option>
                  <option value="SUDESTE|R$100|1 dias">
                    SUDESTE | R$100 | 1 dias
                  </option>
                  <option value="ITAGUAI|R$100|1 dias">
                    ITAGUAÍ | R$100 | 1 dias
                  </option>
                  <option value="ANGRA|R$100|1 dias">
                    ANGRA DOS REIS | R$100 | 1 dias
                  </option>
                </optgroup>
                <optgroup label="Padrão">
                  <option value="SAOSEBASTIAO|R$500|3 dias">
                    SÃO SEBASTIÃO | R$500 | 3 dias
                  </option>
                  <option value="SANTOS|R$500|3 dias">
                    SANTOS | R$500 | 3 dias
                  </option>
                  <option value="PARANAGUA|R$500|3 dias">
                    PARANAGUÁ | R$500 | 3 dias
                  </option>
                  <option value="SAOFRANCISCO|R$500|4 dias">
                    SÃO FRANCISCO DO SUL | R$500 | 4 dias
                  </option>
                  <option value="NAVEGANTES|R$500|4 dias">
                    NAVEGANTES | R$500 | 4 dias
                  </option>
                  <option value="SALVADOR|R$700|4 dias">
                    SALVADOR | R$700 | 4 dias
                  </option>
                  <option value="ARATU|R$700|4 dias">
                    ARATU | R$700 | 4 dias
                  </option>
                  <option value="SUAPE|R$1000|6 dias">
                    SUAPE | R$1000 | 6 dias
                  </option>
                  <option value="PECEM|R$1000|7 dias">
                    PECÉM | R$1000 | 7 dias
                  </option>
                  <option value="ITAQUI|R$1200|7 dias">
                    ITAQUI | R$1200 | 7 dias
                  </option>
                  <option value="PONTAMADEIRA|R$1200|7 dias">
                    PONTA DA MADEIRA | R$1200 | 7 dias
                  </option>
                  <option value="VILADOCONDE|R$1200|7 dias">
                    VILA DO CONDE | R$1200 | 7 dias
                  </option>
                </optgroup>
              </select>
            </div>
          </div>
          <p className="flex py-2">
            <strong className="mr-1">Valor do Frete:</strong>
            <span>
              R${" "}
              {formData.portvalue && formData.portvalue.includes("|")
                ? formData.portvalue.split("|")[1].replace("R$", "").trim()
                : "0"}
            </span>
            <strong className="ml-3 mr-1">Prazo de Entrega:</strong>
            <span>
              {formData.portvalue && formData.portvalue.includes("|")
                ? formData.portvalue.split("|")[2].trim()
                : ""}
            </span>
          </p>
          <p className="py-2">
            Frete grátis acima de R$1000,00: PORTOCEL, PRAIA MOLE, TUBARÃO, VITÓRIA,
            PONTA UBÚ, PONTA AÇU, MACAÉ, RIO DE JANEIRO, ITAGUAÍ, ANGRA DOS REIS
          </p>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="grid grid-cols-2 gap-[2px] items-center">
              <Label htmlFor="contact">Email</Label>
              <Input
                id="contact"
                name="contact"
                type="email"
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-[2px] items-center">
              <Label htmlFor="etb">ETB</Label>
              <Input
                id="etb"
                name="etb"
                type="date"
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <p className="py-2">
            <strong>Total: R$ {formData.value.toFixed(2)}</strong>
          </p>
          <DialogFooter className="mt-5">
            <Button
              disabled={isSubmitting}
              className="disabled:cursor-not-allowed disabled:bg-primary/70"
              type="submit"
              variant="default"
            >
              {isSubmitting ? "Gerando..." : submitButtonLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
