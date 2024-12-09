"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"

export function BackHomeButton() {
    const router = useRouter()
    return (
        <Button
            onClick={() => router.replace('/')} 
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded font-semibold mb-4 ml-6"
        >
            <ArrowLeft className="w-5 h-5" />
            Home
        </Button>
    )
}
