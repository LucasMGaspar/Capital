"use server"

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { categories } from "@/lib/categories";
import { useFilterProductStore } from "@/store/filterProductStore";
import { ArrowBigRight } from "lucide-react";
import { revalidatePath } from "next/cache";

export async function SheetCategoriesSidebar() {
    async function handleSubmit(formData: FormData) {
        "use server"
        const changeFilter = useFilterProductStore.getState().changeFilteredProduct
        if (!!formData.get("category")) {
            changeFilter(formData.get("category") as string);
            revalidatePath('/');
        }
    }

    return (
        <Sheet>
            <SheetTrigger className="fixed z-50 left-0 mt-48" asChild>
                
            </SheetTrigger>
            <SheetContent>
                <SheetHeader className="p-6 flex justify-center items-center">
                    
                </SheetHeader>
                <SheetClose asChild>
                    <form action={handleSubmit} className="flex flex-col mt-5">
                        <input type="hidden" name="category" value="FEATURED PRODUCTS" />
                        
                    </form>
                </SheetClose>
                {categories.map((category, index) => (
                    <SheetClose asChild key={index}>
                        <form action={handleSubmit}>
                            <input type="hidden" name="category" value={category} />
                            <Button
                                type="submit"
                                key={index}
                                variant="outline"
                                className={`w-full p-5 text-left border-l-0 border-r-0 ${index !== categories.length - 1 ? "border-b-0" : ""
                                    }`}
                            >
                                {category}
                            </Button>
                        </form>
                    </SheetClose>
                ))}
            </SheetContent>
        </Sheet>
    );
}