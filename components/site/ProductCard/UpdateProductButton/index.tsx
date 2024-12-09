"use client";

import { getProductList, updateProduct } from "@/actions/product";
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
import { Textarea } from "@/components/ui/textarea";
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
  const [costPrice, setCostPrice] = useState(
    parseFloat(product.costPrice.toString())
  );
  const [profitRate, setProfitRate] = useState(0);

  function handleUpdateProduct(event: any) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const price = formData.get("price") as string;
    const formattedPrice = parseFloat(price.replace(",", ".")); // Converte para número
    const profitRateValue =
      parseFloat(formData.get("profitRate") as string) / 100;
    const formattedPriceWithProfit = parseFloat(
      (formattedPrice * (1 + profitRateValue)).toFixed(2)
    ); // Garante que seja um número

    if (formattedPrice > 0 && profitRateValue > 0) {
      updateProduct(product.id, {
        name: formData.get("name") as string,
        cod_prod: formData.get("cod_prod") as string,
        price: formattedPriceWithProfit, // Agora definitivamente um número
        costPrice: formattedPrice, // Também um número
        profitRate: profitRateValue, // Já é número
        description: formData.get("description") as string,
        isFeatured: Boolean(formData.get("isFeatured")),
        category: formData.get("category") as string,
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
            <Button variant="default">Edit</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit product</DialogTitle>
              <DialogDescription>Update product information.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateProduct}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
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
                    Code
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
                    Category
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
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={product.description}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price R$
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    defaultValue={product.costPrice.toString()}
                    className="col-span-3"
                    onChange={(e) => setCostPrice(parseFloat(e.target.value))}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="profitRate" className="text-right">
                    Profit (%)
                  </Label>
                  <Input
                    id="profitRate"
                    name="profitRate"
                    defaultValue={(
                      parseFloat(product.profitRate.toString()) * 100 -
                      100
                    ).toFixed(0)}
                    className="col-span-3"
                    onChange={(e) =>
                      setProfitRate(parseFloat(e.target.value) / 100)
                    }
                  />
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="isFeatured" className="">
                    Mark as featured product?
                  </Label>
                  <Input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    className="col-span-1 w-4"
                    defaultChecked={product.isFeatured}
                  />
                </div>
                {costPrice > 0 && !isNaN(profitRate) && profitRate > 0 && (
                  <div className="grid mt-3 gap-[2px] items-center font-semibold">
                    <span className="my-2 text-lg w-full text-right">
                      <span className="font-normal block">Total Price:</span> R${" "}
                      {(costPrice * (1 + profitRate)).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
