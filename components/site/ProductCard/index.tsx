import { ProductsList } from "@/app/(site)/page";
import { auth } from "@/auth";
import Image from "next/image";
import AddProductToCartButton from "./AddToCartButton";
import DeleteProductButton from "./DeleteProductButton";
import UpdateProductButton from "./UpdateProductButton";
import useCurrencyStore from "@/store/useCurrencyStore";

type ListProductButtonProps = {
    product: ProductsList;
}

export default async function ProductCard({ product }: ListProductButtonProps) {
    const exchangeRate = useCurrencyStore.getState().exchangeRate;
    const session = await auth(); // Obtém a sessão para pegar o userId e userRole

    const userId = session?.user.id; // Pega o userId da sessão
    const userRole = session?.user.role; // Pega o userRole da sessão

    return (
        <div className="max-w-[260px] w-full bg-white shadow-md rounded-lg overflow-hidden my-4 transition-transform transform hover:scale-[1.01]">
            <Image src={product.image} alt={product.name} width={200} height={20} className="w-full h-44 object-cover" />
            <div className="p-4">
                <div className="text-lg break-words h-[130px] text-primary">{product.name}</div>
                <div className="text-[#cf964d] text-lg font-bold mb-4">R$ {product.price} * {exchangeRate}</div>
                <div className="flex justify-between">
                    <UpdateProductButton userRole={userRole} product={product} />
                    <DeleteProductButton product={product} userRole={userRole} />
                    {userId && userRole && ( // Renderiza o botão de adicionar ao carrinho apenas se userId e userRole existirem
                        <AddProductToCartButton product={product} userRole={userRole} />
                    )}
                </div>
            </div>
        </div>
    );
}
