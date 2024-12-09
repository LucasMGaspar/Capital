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
import { Textarea } from "@/components/ui/textarea";
import { categories } from "@/lib/categories";
import { Label } from "@radix-ui/react-label";
import { AlertCircle } from "lucide-react";
import React, { useState } from "react";

export default function AddProductButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertDisplayed, setIsAlertDisplayed] = useState(false);
  const [costPrice, setCostPrice] = useState(0);
  const [profitRate, setProfitRate] = useState(0);

  const handleSubmit = (event: any) => {
    event.preventDefault();
    setIsAlertDisplayed(false);
    const formData = new FormData(event.target);
    const file = formData.get("image");

    fileToBase64(file)
      .then((base64Image) => {
        const price = formData.get("price") as string;
        const formattedPrice = parseFloat(price.replace(",", ".")); // Converte para número

        const profitRate =
          parseFloat(formData.get("profitRate") as string) || 0; // Converte para número
        const formattedPriceWithProfit = parseFloat(
          (formattedPrice * (1 + profitRate / 100)).toFixed(2)
        ); // Calcula e converte para número

        const product: ProductProps = {
          name: formData.get("name") as string,
          cod_prod: formData.get("cod_prod") as string,
          image: base64Image as string, // Usa a imagem convertida para Base64
          price: formattedPriceWithProfit, // Agora definitivamente um número
          costPrice: formattedPrice, // Agora definitivamente um número
          description: formData.get("description") as string,
          category: formData.get("category") as string,
          isFeatured: Boolean(formData.get("isFeatured")),
          profitRate: profitRate, // Já é número
        };

        if (formattedPrice > 0 && profitRate > 0) {
          saveProduct(product).then(() => {
            setIsDialogOpen(false); // Fechar o Dialog quando o produto for salvo com sucesso
          });
          setCostPrice(0);
          setProfitRate(0);
        } else {
          setIsAlertDisplayed(true);
        }
      })
      .catch((error) => {
        console.error("Error converting file to Base64:", error);
        // Aqui você pode lidar com o erro, como mostrar uma mensagem ao usuário
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
        <Button variant="default">Add Product</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] lg:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Product Info</DialogTitle>
          <DialogDescription>
            Fill in the new product details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-3">
            <div className="grid grid-cols-2 items-center">
              <Label htmlFor="cod_prod">Code</Label>
              <Input
                id="cod_prod"
                name="cod_prod"
                type="text"
                placeholder=""
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-2 items-center">
              <Label htmlFor="profitRate">Profit (%)</Label>
              <Input
                id="profitRate"
                name="profitRate"
                type="number"
                placeholder="20%"
                className="col-span-3"
                onChange={(e) => setProfitRate(parseFloat(e.target.value))}
                required
              />
            </div>
            <div className="grid grid-cols-2 items-center">
              <Label htmlFor="category">Category</Label>
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
              <Label htmlFor="price">Price R$</Label>
              <Input
                id="price"
                name="price"
                type="text"
                placeholder="0,00"
                className="col-span-3"
                onChange={(e) => setCostPrice(parseFloat(e.target.value))}
                required
              />
            </div>
          </div>
          <div>
            <div className="grid grid-cols-2 items-center">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                type="text"
                placeholder=""
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-2 items-center">
              <Label htmlFor="name">Name</Label>
              <Textarea
                id="name"
                name="name"
                placeholder=""
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-2 mt-3 gap-[2px] items-center">
              <Label htmlFor="image">Image</Label>
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
              <Label htmlFor="isFeatured">Mark as featured product?</Label>
              <Checkbox
                id="isFeatured"
                name="isFeatured"
                className="col-span-3"
              />
            </div>
            {costPrice > 0 && !isNaN(profitRate) && profitRate > 0 && (
              <div className="grid mt-3 gap-[2px] items-center font-semibold">
                <span className="my-2 text-lg w-full text-right">
                  <span className="font-normal block">Total Price:</span> R${" "}
                  {(costPrice * (1 + profitRate / 100)).toFixed(2)}
                </span>
              </div>
            )}
          </div>
          {isAlertDisplayed && (
            <Alert className="mt-5" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Price or profit provided is invalid.
              </AlertDescription>
            </Alert>
          )}
          <DialogFooter className="mt-5">
            <Button type="submit" variant="default">
              Save Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
