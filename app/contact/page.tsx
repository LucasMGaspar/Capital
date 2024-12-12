import Navbar from "@/components/site/navbar";
import Link from "next/link";

export default async function Contact() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-20 items-center gap-4 bg-[#1c345c] px-4 md:px-6 z-10">
        <Navbar />
      </header>
      <div className="flex flex-col justify-center items-center w-full mt-20 m-auto text-center px-4">
        <h2 className="text-3xl font-bold text-primary mb-8">
          
        </h2>
        <p className="text-lg mb-12">
        Continuar comprando?
        </p>
        <Link href="/" passHref>
          <button className="px-6 py-3 bg-[#cf964d] text-white rounded-md hover:bg-[#b7803c] transition-colors">
            Voltar para a página principal
          </button>
        </Link>
      </div>
    </div>
  );
}
