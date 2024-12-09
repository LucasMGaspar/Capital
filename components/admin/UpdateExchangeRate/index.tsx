"use client"

import useCurrencyStore from "@/store/useCurrencyStore";

export function UpdateExchangeRateInput() {
    const { exchangeRate } = useCurrencyStore()
    return (
        <input
            id="newDollarValue"
            name="newDollarValue"
            type="number"
            step="0.01"
            className="border rounded px-2 py-1"
            placeholder={exchangeRate.toFixed(2).toString()}
            required
        />
    )
}
