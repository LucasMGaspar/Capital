"use server";

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const ProductSchema = z.object({
  name: z.string().min(3),
  cod_prod: z.string(),
  price: z.string().transform((value) => parseFloat(value)), // Transformando string em número
  costPrice: z.string().transform((value) => parseFloat(value)), // Adicionando costPrice com conversão
  profitRate: z.string().transform((value) => parseFloat(value)), // Adicionando profitRate com conversão
  image: z.string(),
});

export type ProductProps = {
  name: string;
  cod_prod: string;
  price: number; // Alterando para number
  costPrice: number; // Alterando para number
  image: string;
  description: string;
  category: string;
  isFeatured: boolean;
  profitRate: number;
};

type UpdatedProducts = {
  name: string;
  cod_prod: string;
  description: string;
  price: number;
  costPrice: number;
  isFeatured: boolean;
  category: string;
  profitRate: number;
};

export const saveProduct = async (product: ProductProps) => {
  if (product.name.length > 80) {
    console.log("Product name too long.");
    return;
  }

  try {
    await prisma.product.create({
      data: {
        name: product.name,
        cod_prod: product.cod_prod,
        price: new Prisma.Decimal(product.price),
        costPrice: new Prisma.Decimal(product.costPrice),
        image: product.image,
        description: product.description,
        isFeatured: product.isFeatured,
        profitRate: product.profitRate,
        category: product.category,
      },
    });
  } catch (error) {
    return { message: "Failed to create new product" };
  }

  revalidatePath("/");
};

export const getProductList = async () => {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        cod_prod: true,
        price: true,
        costPrice: true,
        image: true,
        description: true,
        category: true,
        isFeatured: true,
        profitRate: true,
        createdAt: false,
        updatedAt: false,
      },
      orderBy: {
        name: "asc",
      },
    });
    return products;
  } catch (error) {
    throw new Error("Failed to fetch products data");
  }
};

export const getProductById = async (id: string) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });
    return product;
  } catch (error) {
    throw new Error("Failed to fetch contact data");
  }
};

export const updateProduct = async (
  id: string,
  {
    name,
    costPrice,
    cod_prod,
    description,
    isFeatured,
    category,
    price,
    profitRate,
  }: UpdatedProducts
) => {
  if (name.length > 80) {
    console.log("Product name too long.");
    return;
  }

  try {
    await prisma.product.update({
      data: {
        name: name,
        price: new Prisma.Decimal(price),
        costPrice: new Prisma.Decimal(costPrice),
        cod_prod: cod_prod,
        description: description,
        isFeatured: isFeatured,
        category: category,
        profitRate: profitRate,
      },
      where: { id },
    });
  } catch (error) {
    return { message: "Failed to update product" };
  }

  revalidatePath("/");
  redirect("/");
};

export const deleteProduct = async (id: string) => {
  try {
    await prisma.product.delete({
      where: { id },
    });
  } catch (error) {
    return { message: "Failed to delete product" };
  }

  revalidatePath("/");
};
