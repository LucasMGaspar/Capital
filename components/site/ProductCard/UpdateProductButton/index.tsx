"use client";

import { updateProduct } from "@/actions/product";
import { ProductsList } from "@/app/(site)/page";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { categories } from "@/lib/categories";
import { useState } from "react";

type UpdateProductButtonProps = {
  userRole: string;
  product: ProductsList;
};

export default function UpdateProductButton({
  userRole,
  product,
}: UpdateProductButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  function fileToBase64(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  async function handleUpdateProduct(event: any) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const priceString = formData.get("price") as string;
    const formattedPrice = parseFloat(priceString.replace(",", "."));
    const stockQuantityString = formData.get("stock_quantity") as string;
    const stockQuantity = parseInt(stockQuantityString, 10);
    const uploadedImage = formData.get("image") as File;

    let imageData = product.image; // Reutiliza a imagem existente, caso nenhuma nova seja enviada

    // Validação do estoque
    if (isNaN(stockQuantity) || stockQuantity < 0) {
      alert("A quantidade em estoque deve ser um número válido e positivo.");
      return;
    }

    // Se o usuário enviar uma nova imagem, convertemos para Base64
    if (uploadedImage && uploadedImage.size > 0) {
      try {
        const base64Image = await fileToBase64(uploadedImage);
        imageData = base64Image as string;
      } catch (error) {
        console.error("Erro ao converter imagem para Base64:", error);
      }
    }

    if (formattedPrice > 0) {
      await updateProduct(product.id, {
        name: formData.get("name") as string,
        cod_prod: formData.get("cod_prod") as string,
        price: formattedPrice,
        isFeatured: Boolean(formData.get("isFeatured")),
        category: formData.get("category") as string,
        stock_quantity: stockQuantity,
        unidade: formData.get("unidade") as "UNIDADE_1" | "UNIDADE_2", // Inclui unidade
        image: imageData,
      });
    }

    setIsOpen(false);
  }

  const sortedCategories = [...categories];
  const currentIndex = sortedCategories.indexOf(product.category);
  if (currentIndex !== -1) {
    sortedCategories.splice(currentIndex, 1);
    sortedCategories.unshift(product.category);
  }

  return (
    <>
      {userRole === "ADMIN" && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="default">Editar</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar produto</DialogTitle>
              <DialogDescription>
                Atualize as informações do produto.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateProduct}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    maxLength={80}
                    defaultValue={product.name}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cod_prod" className="text-right">
                    Código
                  </Label>
                  <Input
                    id="cod_prod"
                    name="cod_prod"
                    defaultValue={product.cod_prod}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Categoria
                  </Label>
                  <select
                    name="category"
                    id="category"
                    className="input input-bordered input-primary border w-60 p-2"
                    required
                  >
                    {sortedCategories.map((category: string, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Preço R$
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    defaultValue={product.price.toString()}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock_quantity" className="text-right">
                    Estoque
                  </Label>
                  <Input
                    id="stock_quantity"
                    name="stock_quantity"
                    type="number"
                    defaultValue={product.stock_quantity.toString()}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unidade" className="text-right">
                    Unidade
                  </Label>
                  <select
                    id="unidade"
                    name="unidade"
                    className="input input-bordered border w-60 p-2"
                    required
                    defaultValue={product.unidade} // Define valor padrão
                  >
                    <option value="UNIDADE_1">Unidade 1</option>
                    <option value="UNIDADE_2">Unidade 2</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="isFeatured">Destacar produto?</Label>
                  <Input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    className="w-4"
                    defaultChecked={product.isFeatured}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image" className="text-right">
                    Imagem
                  </Label>
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
