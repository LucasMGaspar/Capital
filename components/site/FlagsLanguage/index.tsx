"use client"

import { RotateCcw } from 'lucide-react'
import React from 'react'
import Image from "next/image"
import BrazilFlag from "@/assets/brazilFlag.svg"
import USAFlag from "@/assets/usaFlag.svg"

export default function FlagsLanguage() {
    // const { currentLang, handleChangeLanguage } = useLanguage()

    return (
        <div className="flex justify-center gap-0 items-center mt-10 lg:mt-0">
            <div className="p-1 flex justify-center items-center">
                <RotateCcw className="cursor-pointer text-primary lg:text-primary-foreground" size={15} />
            </div>
            {/* currentLang */}
            {'pt' === 'pt' ? (
                <Image
                    style={{ cursor: 'pointer' }}
                    src={BrazilFlag}
                    width={38}
                    alt=""
                // onClick={handleToggleLanguage}
                />
            ) : (
                <Image
                    style={{ cursor: 'pointer' }}
                    src={USAFlag}
                    width={38}
                    alt=""
                // onClick={handleToggleLanguage}
                />
            )}
        </div>
    )
}
