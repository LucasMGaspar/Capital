// ClientWrapper.tsx
'use client';

import React, { useEffect } from "react";
import useCurrencyStore from "@/store/useCurrencyStore";

interface ClientWrapperProps {
    exchangeRateDefault: number;
    children: React.ReactNode;
}

const ClientWrapper: React.FC<ClientWrapperProps> = ({ exchangeRateDefault, children }) => {
    const { setExchangeRate, exchangeRate } = useCurrencyStore();

    useEffect(() => {
        setExchangeRate(exchangeRateDefault);
    }, [exchangeRate, setExchangeRate]);

    return <>{children}</>;
};

export default ClientWrapper;
