"use client"

import { formatCurrency } from "../../lib/currency";
import useCurrencyStore from "@/store/useCurrencyStore";

type PriceCalculedType = {
    price: string;
    quantity?: number;
}

export function PriceCalculed({ price }: PriceCalculedType) {
    const { currency, exchangeRate } = useCurrencyStore()
    return (
        <span>{formatCurrency(price, exchangeRate, currency)}</span>
    )
}
