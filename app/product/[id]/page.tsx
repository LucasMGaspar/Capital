import { getProductById } from '@/actions/product';
import Navbar from '@/components/site/navbar';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import { BackHomeButton } from '@/components/backHomeButton';
import { PriceCalculed } from '@/components/PriceCalculed';

interface Product {
    id: string;
    name: string;
    cod_prod: string;
    price: string | number;
    image: string;
    category: string;
    description: string;
}

export default async function ProductPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const product = await getProductById(id);

    if (!product) {
        notFound();
    }

    return (
        <div className='flex min-h-screen w-full flex-col'>
            <header className="sticky top-0 flex h-20 items-center gap-4 bg-primary px-4 md:px-6 z-10">
                <Navbar />
            </header>
            <main className="flex flex-col items-center justify-center flex-grow p-4 md:p-8 bg-gray-100">
                <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-2xl w-full">
                    <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
                    <div className="p-6">

                        <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
                        <p className="bg-[#cf964d] text-primary-foreground w-fit px-2 py-[2px] mb-4 mt-4 rounded-lg cursor-default text-sm">{product.category}</p>
                        <p className="text-gray-900 text-lg font-semibold mb-4">
                            <PriceCalculed price={product.price.toString()} />
                        </p>
                        
                        <p className='text-gray-500 mt-4'><span className='font-semibold text-gray-600'>IMPA: </span>{product.cod_prod}</p>
                    </div>
                    <BackHomeButton />
                </div>
            </main>
        </div>
    );
}
