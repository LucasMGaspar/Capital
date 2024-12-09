"use client"

import useCurrencyStore from "@/store/useCurrencyStore";

export default function ConvertCurrency() {
    const { currency, setCurrency } = useCurrencyStore();

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
            }}
        >
            <select
                className="ml-5 px-2 py-[6px] rounded-md cursor-pointer text-white bg-blue-900 hover:bg-blue-800"
                value={currency}
                onChange={(e) => {
                    setCurrency(e.target.value as any);
                    // Submete o formulário de forma programática
                    e.target.form!.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                }}
            >
                {currency === 'USD' ? (
                    <>
                        <option className="bg-white text-black" value="USD">$ USD</option>
                        <option className="bg-white text-black" value="BRL">R$ BRL</option>
                    </>
                ) : (
                    <>
                        <option className="bg-white text-black" value="BRL">R$ BRL</option>
                        <option className="bg-white text-black" value="USD">$ USD</option>
                    </>
                )}
            </select>
        </form>


    )
}
