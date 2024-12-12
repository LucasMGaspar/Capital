"use client";

import { ProductProps, saveProduct } from "@/actions/product";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { categories } from "@/lib/categories";
import { Label } from "@radix-ui/react-label";
import { AlertCircle } from "lucide-react";
import React, { useState } from "react";

export default function AddProductButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertDisplayed, setIsAlertDisplayed] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAlertDisplayed(false);
    setStockError(null);
    const formData = new FormData(event.currentTarget);
    const file = formData.get("image");

    // Obter e validar a quantidade em estoque
    const stockValue = formData.get("stock_quantity") as string;
    const stock = parseInt(stockValue, 10);

    if (isNaN(stock) || stock < 0) {
      setStockError("A quantidade em estoque deve ser um número válido e positivo.");
      return;
    }

    fileToBase64(file)
      .then((base64Image) => {
        const price = formData.get("price") as string;
        const formattedPrice = parseFloat(price.replace(",", "."));

        const product: ProductProps = {
          name: formData.get("name") as string,
          cod_prod: formData.get("cod_prod") as string,
          image: base64Image as string, // Usa a imagem convertida para Base64
          price: formattedPrice, // Agora definitivamente um número
          category: formData.get("category") as string,
          isFeatured: Boolean(formData.get("isFeatured")),
          stock_quantity: stock, // Adiciona a quantidade em estoque
        };

        if (formattedPrice > 0) {
          saveProduct(product)
            .then(() => {
              setIsDialogOpen(false); // Fechar o Dialog quando o produto for salvo com sucesso
            })
            .catch((error) => {
              console.error("Erro ao salvar o produto:", error);
              setIsAlertDisplayed(true);
            });
        } else {
          setIsAlertDisplayed(true);
        }
      })
      .catch((error) => {
        console.error("Erro ao converter o arquivo para Base64:", error);
      });
  };

  function fileToBase64(file: any) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Adicionar Produto</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] lg:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Cadastro de Produto</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do produto para adicioná-lo ao estoque.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-3">
            <div className="grid grid-cols-2 items-center">
              <Label htmlFor="cod_prod">Código</Label>
              <Input
                id="cod_prod"
                name="cod_prod"
                type="text"
                placeholder="Código do Produto"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-2 items-center">
              <Label htmlFor="category">Categoria</Label>
              <select
                name="category"
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 col-span-3"
                required
              >
                {categories.map((category: string, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 items-center">
              <Label htmlFor="price">Preço R$</Label>
              <Input
                id="price"
                name="price"
                type="text"
                placeholder="0,00"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-2 items-center">
              <Label htmlFor="stock_quantity">Estoque</Label>
              <Input
                id="stock_quantity"
                name="stock_quantity"
                type="number"
                min="0"
                placeholder="Quantidade em estoque"
                className="col-span-3"
                required
              />
            </div>
          </div>
          <div>
            <div className="grid grid-cols-2 items-center">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Nome do Produto"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-2 mt-3 gap-[2px] items-center">
              <Label htmlFor="image">Imagem</Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                className="col-span-3 bg-slate-100 cursor-pointer"
                required
              />
            </div>
            <div className="flex mt-4 gap-3 w-full items-center">
              <Label htmlFor="isFeatured">Mais Vendidos?</Label>
              <Checkbox
                id="isFeatured"
                name="isFeatured"
                className="col-span-3"
              />
            </div>
          </div>
          {isAlertDisplayed && (
            <Alert className="mt-5" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>
                Houve um problema ao salvar o produto. Verifique os dados e tente novamente.
              </AlertDescription>
            </Alert>
          )}
          {stockError && (
            <Alert className="mt-5" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro de Estoque</AlertTitle>
              <AlertDescription>{stockError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter className="mt-5">
            <Button type="submit" variant="default">
              Salvar Produto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
