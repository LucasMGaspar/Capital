"use server";

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// Enum Unidade
const UnidadeEnum = z.enum(["UNIDADE_1", "UNIDADE_2"]);

// Atualizando o ProductSchema para incluir unidade
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
  unidade: UnidadeEnum, // Adicionando unidade
});

export type ProductProps = {
  name: string;
  cod_prod: string;
  price: number;
  image: string;
  category: string;
  isFeatured: boolean;
  stock_quantity: number;
  unidade: "UNIDADE_1" | "UNIDADE_2";
};

type UpdatedProducts = {
  name: string;
  cod_prod: string;
  price: number;
  isFeatured: boolean;
  category: string;
  image: string;
  stock_quantity: number;
  unidade: "UNIDADE_1" | "UNIDADE_2";
};

// Função para criar um novo produto
export const saveProduct = async (product: ProductProps) => {
  try {
    await prisma.product.create({
      data: {
        name: product.name,
        cod_prod: product.cod_prod,
        price: new Prisma.Decimal(product.price),
        image: product.image,
        isFeatured: product.isFeatured,
        category: product.category,
        stock_quantity: product.stock_quantity,
        unidade: product.unidade,
      },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Erro ao criar o produto:", error);
    throw new Error("Falha ao criar o novo produto.");
  }
};

// Função para obter todos os produtos
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
        stock_quantity: true,
        unidade: true,
      },
      orderBy: { name: "asc" },
    });
    return products;
  } catch (error) {
    console.error("Erro ao buscar a lista de produtos:", error);
    throw new Error("Falha ao buscar os dados dos produtos.");
  }
};

// Função para buscar um produto por ID
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
        stock_quantity: true,
        unidade: true,
      },
    });

    if (!product) {
      throw new Error(`Produto com ID ${id} não encontrado.`);
    }

    return product;
  } catch (error) {
    console.error("Erro ao buscar o produto por ID:", error);
    throw new Error("Falha ao buscar os dados do produto.");
  }
};

// Função para atualizar um produto existente
export const updateProduct = async (id: string, product: UpdatedProducts) => {
  try {
    await prisma.product.update({
      where: { id },
      data: {
        name: product.name,
        cod_prod: product.cod_prod,
        price: new Prisma.Decimal(product.price),
        image: product.image,
        isFeatured: product.isFeatured,
        category: product.category,
        stock_quantity: product.stock_quantity,
        unidade: product.unidade,
      },
    });
    revalidatePath("/");
    redirect("/");
  } catch (error) {
    console.error("Erro ao atualizar o produto:", error);
    throw new Error("Falha ao atualizar o produto.");
  }
};

// Função para deletar um produto
export const deleteProduct = async (id: string) => {
  try {
    await prisma.product.delete({
      where: { id },
    });
    console.log(`Produto com ID ${id} deletado com sucesso.`);
    revalidatePath("/");
  } catch (error) {
    console.error("Erro ao deletar o produto:", error);
    throw new Error("Falha ao deletar o produto.");
  }
};
