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

  function handleUpdateProduct(event: any) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const price = formData.get("price") as string;
    const formattedPrice = parseFloat(price.replace(",", ".")); // Converte para número

    const uploadedImage = formData.get("image") as File;
    let imageUrl = product.image; // Reutiliza a imagem existente, caso nenhuma nova seja enviada

    // Se o usuário enviar uma nova imagem
    if (uploadedImage && uploadedImage.size > 0) {
      imageUrl = URL.createObjectURL(uploadedImage); // Simulação: em produção, faça upload para um servidor
    }

    if (formattedPrice > 0) {
      updateProduct(product.id, {
        name: formData.get("name") as string,
        cod_prod: formData.get("cod_prod") as string,
        price: formattedPrice, // Agora definitivamente um número
        isFeatured: Boolean(formData.get("isFeatured")),
        category: formData.get("category") as string,
        image: imageUrl, // Incluindo a imagem no objeto
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
              <DialogDescription>Atualize as informações do produto.</DialogDescription>
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
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="isFeatured" className="">
                    Destacar produto?
                  </Label>
                  <Input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    className="col-span-1 w-4"
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
