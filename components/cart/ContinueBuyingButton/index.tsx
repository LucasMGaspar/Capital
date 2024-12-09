"use client"

import { useRouter } from "next/navigation"

export default function ContinueBuyingButton() {
    const router = useRouter()
    return (
        <button onClick={() => router.push('/')} className="mt-4 w-full text-primary hover:underline font-bold">
            CONTINUAR COMPRANDO
        </button>
    )
}
