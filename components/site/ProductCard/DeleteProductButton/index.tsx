"use client"

import { deleteProduct } from "@/actions/product";
import { ProductsList } from "@/app/(site)/page";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

type DeleteProductButtonProps = {
    product: ProductsList;
    userRole: string;
}

export default function DeleteProductButton({ product, userRole }: DeleteProductButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    function handleDeleteProduct(event: any) {
        event.preventDefault();
        deleteProduct(product.id);
        setIsOpen(false);
    }

    return (
        <>
            {userRole === 'ADMIN' &&
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="destructive">Delete</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Are you sure you want to delete?</DialogTitle>
                            <br />
                            <DialogDescription>
                                Product code: <strong>{product.cod_prod}</strong>
                            </DialogDescription>
                            <DialogDescription>
                                Product's name: <strong>{product.name}</strong>
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleDeleteProduct}>
                            <DialogFooter>
                                <Button variant={"destructive"} type="submit">Delete</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            }
        </>
    );
}
