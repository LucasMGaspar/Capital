"use client"

import { useRouter } from "next/navigation";

type ProductNameType = {
    id: string;
    name: string;
}

export function ProductName({ name, id }: ProductNameType) {
    const router = useRouter();
  return (
    <span onClick={() => router.replace(`/product/${id}`)}>{name}</span>
  )
}
