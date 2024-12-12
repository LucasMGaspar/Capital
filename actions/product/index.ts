// "@/actions/product.ts"

"use server";

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// Atualizando o ProductSchema para incluir stock_quantity
const ProductSchema = z.object({
  name: z.string().min(3, "O nome do produto deve ter pelo menos 3 caracteres."),
  cod_prod: z.string().nonempty("O código do produto é obrigatório."),
  price: z.string()
    .nonempty("O preço é obrigatório.")
    .transform((value) => {
      const parsed = parseFloat(value.replace(",", "."));
      if (isNaN(parsed)) {
        throw new Error("Preço inválido.");
      }
      return parsed;
    }),
  image: z.string().url("A imagem deve ser uma URL válida."),
  category: z.string().nonempty("A categoria é obrigatória."),
  isFeatured: z.boolean(),
  stock_quantity: z.string()
    .nonempty("A quantidade em estoque é obrigatória.")
    .transform((value) => {
      const parsed = parseInt(value, 10);
      if (isNaN(parsed) || parsed < 0) {
        throw new Error("A quantidade em estoque deve ser um número inteiro não negativo.");
      }
      return parsed;
    }),
});

export type ProductProps = {
  name: string;
  cod_prod: string;
  price: number; // Alterando para number
  image: string;
  category: string;
  isFeatured: boolean;
  stock_quantity: number; // Nova propriedade adicionada
};

type UpdatedProducts = {
  name: string;
  cod_prod: string;
  price: number;
  isFeatured: boolean;
  category: string;
  image: string;
  stock_quantity: number; // Nova propriedade adicionada
};

export const saveProduct = async (product: ProductProps) => {
  // Validação adicional para o nome do produto
  if (product.name.length > 80) {
    console.log("Nome do produto muito longo.");
    return { message: "Nome do produto muito longo." };
  }

  try {
    await prisma.product.create({
      data: {
        name: product.name,
        cod_prod: product.cod_prod,
        price: new Prisma.Decimal(product.price),
        image: product.image,
        isFeatured: product.isFeatured,
        category: product.category,
        stock_quantity: product.stock_quantity, // Incluindo stock_quantity
      },
    });
  } catch (error) {
    console.error("Erro ao criar o produto:", error);
    return { message: "Falha ao criar o novo produto." };
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
        image: true,
        category: true,
        isFeatured: true,
        stock_quantity: true, // Incluindo stock_quantity
      },
      orderBy: {
        name: "asc",
      },
    });
    return products;
  } catch (error) {
    console.error("Erro ao buscar a lista de produtos:", error);
    throw new Error("Falha ao buscar os dados dos produtos.");
  }
};

export const getProductById = async (id: string) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        cod_prod: true,
        price: true,
        image: true,
        category: true,
        isFeatured: true,
        stock_quantity: true, // Incluindo stock_quantity
      },
    });
    return product;
  } catch (error) {
    console.error("Erro ao buscar o produto por ID:", error);
    throw new Error("Falha ao buscar os dados do produto.");
  }
};

export const updateProduct = async (
  id: string,
  {
    name,
    cod_prod,
    isFeatured,
    category,
    price,
    image,
    stock_quantity, // Incluindo stock_quantity
  }: UpdatedProducts
) => {
  // Validação adicional para o nome do produto
  if (name.length > 80) {
    console.log("Nome do produto muito longo.");
    return { message: "Nome do produto muito longo." };
  }

  try {
    await prisma.product.update({
      data: {
        name: name,
        price: new Prisma.Decimal(price),
        cod_prod: cod_prod,
        isFeatured: isFeatured,
        category: category,
        image: image,
        stock_quantity: stock_quantity, // Incluindo stock_quantity
      },
      where: { id },
    });
  } catch (error) {
    console.error("Erro ao atualizar o produto:", error);
    return { message: "Falha ao atualizar o produto." };
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
    console.error("Erro ao deletar o produto:", error);
    return { message: "Falha ao deletar o produto." };
  }

  revalidatePath("/");
};
