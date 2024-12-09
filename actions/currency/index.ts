"use server";

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Esquema de validação usando zod, se necessário
const CurrencySchema = z.object({
    dollar: z.number().positive(),
});

export type CurrencyProps = {
    dollar: number;
};

// Função para atualizar a taxa de câmbio
export const updateCurrency = async (currency: CurrencyProps) => {
    try {
        await prisma.currency.updateMany({
            data: {
                dollar: new Prisma.Decimal(currency.dollar),
            },
        });
        revalidatePath("/");
    } catch (error) {
        console.error("Failed to update currency:", error);
        throw new Error("Failed to update currency");
    }
};

// Função para obter a taxa de câmbio atual
export const getCurrentCurrency = async () => {
    try {
        const currency = await prisma.currency.findFirst();
        if (!currency) throw new Error("Currency not found");
        return currency.dollar.toNumber(); // Converte Decimal para number
    } catch (error) {
        console.error("Failed to fetch current currency:", error);
        throw new Error("Failed to fetch current currency");
    }
};
