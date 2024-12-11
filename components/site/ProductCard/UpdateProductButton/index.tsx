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
import { useState, useEffect } from "react";

type UpdateProductButtonProps = {
  userRole: string;
  product: ProductsList;
};

export default function UpdateProductButton({
  userRole,
  product,
}: UpdateProductButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (product.image) {
      setImagePreview(product.image);
    }
  }, [product.image]);

  function handleUpdateProduct(event: any) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const price = formData.get("price") as string;
    const formattedPrice = parseFloat(price.replace(",", ".")); // Converte para número

    if (formattedPrice > 0) {
      const updatedData: any = {
        name: formData.get("name") as string,
        cod_prod: formData.get("cod_prod") as string,
        price: formattedPrice, // Agora definitivamente um número
        isFeatured: Boolean(formData.get("isFeatured")),
        category: formData.get("category") as string,
      };

      const imageFile = formData.get("image") as File;
      if (imageFile && imageFile.size > 0) {
        updatedData.image = imageFile;
      }

      updateProduct(product.id, updatedData);
    }
    setIsOpen(false);
  }

  const sortedCategories = [...categories];
  const currentIndex = sortedCategories.indexOf(product.category);
  if (currentIndex !== -1) {
    sortedCategories.splice(currentIndex, 1);
    sortedCategories.unshift(product.category);
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
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
            <form onSubmit={handleUpdateProduct} encType="multipart/form-data">
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
                    defaultValue={product.category}
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
                    type="number"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="isFeatured" className="">
                    Marcar como produto destaque?
                  </Label>
                  <Input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    className="col-span-1 w-4"
                    defaultChecked={product.isFeatured}
                  />
                </div>
                {/* Novo campo para upload de imagem */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image" className="text-right">
                    Imagem
                  </Label>
                  <div className="col-span-3">
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Pré-visualização da imagem"
                        className="mb-2 h-32 w-32 object-cover rounded"
                      />
                    )}
                    <Input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
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
