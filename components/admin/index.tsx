"use client";

import { ProductProps, saveProduct } from "@/actions/product";
import { categories } from "@/lib/categories";
import { useRouter } from "next/navigation";

export default function AdminForm() {
  const router = useRouter();

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const file = formData.get("image");

    fileToBase64(file)
      .then((base64Image) => {
        const priceString = formData.get("price") as string;
        const formattedPrice = parseFloat(priceString.replace(",", "."));
        const stockQuantityString = formData.get("stock_quantity") as string;
        const stockQuantity = parseInt(stockQuantityString, 10);

        if (isNaN(stockQuantity) || stockQuantity < 0) {
          alert("Invalid stock quantity. It must be a positive number.");
          return;
        }

        const product: ProductProps = {
          name: formData.get("name") as string,
          cod_prod: formData.get("cod_prod") as string,
          image: base64Image as string,
          price: formattedPrice,
          category: formData.get("category") as string,
          isFeatured: Boolean(formData.get("isFeatured")),
          stock_quantity: stockQuantity,
          unidade: formData.get("unidade") as "UNIDADE_1" | "UNIDADE_2", // Adiciona unidade
        };

        if (formattedPrice > 0) {
          saveProduct(product);
        } else {
          alert(
            "Invalid price or not in the indicated format, separated by dots: 0.00"
          );
        }
      })
      .catch((error) => {
        console.error("Error converting file to Base64:", error);
      });
  };

  function fileToBase64(file: any) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="flex items-center justify-center bg-primary w-full p-6">
        <h2 className="text-primary-foreground font-bold text-4xl">
          Novo Produto
        </h2>
      </header>
      <form
        className="flex flex-col items-center border-2 w-96 m-auto rounded-sm pb-4 pt-3"
        onSubmit={handleSubmit}
      >
        {/* Campos do formulário */}
        <div className="mb-4 pt-2 w-full px-8">
          <label htmlFor="name" className="block text-md font-medium text-gray-600">
            Nome do Produto
          </label>
          <textarea
            rows={3}
            cols={10}
            maxLength={80}
            name="name"
            id="name"
            className="input input-bordered input-primary w-full max-w-xs border p-2 rounded-sm resize-none"
            placeholder="Digite o produto..."
            required
          />
        </div>
        <div className="w-full pb-5 px-8">
          <label htmlFor="cod_prod" className="block text-md font-medium text-gray-600">
            Código do Produto
          </label>
          <input
            name="cod_prod"
            id="cod_prod"
            className="input input-bordered input-primary w-full max-w-xs border p-2 rounded-sm resize-none"
            placeholder="Código do produto..."
            required
          />
        </div>
        <div className="mb-5 w-full px-8">
          <label htmlFor="price" className="block text-md font-medium text-gray-600">
            Preço R$
          </label>
          <input
            type="text"
            name="price"
            id="price"
            className="input input-bordered input-primary border w-full max-w-xs p-2"
            placeholder="0,00"
            required
          />
        </div>
        <div className="mb-5 w-full px-8">
          <label htmlFor="stock_quantity" className="block text-md font-medium text-gray-600">
            Estoque
          </label>
          <input
            type="number"
            name="stock_quantity"
            id="stock_quantity"
            className="input input-bordered input-primary border w-full max-w-xs p-2"
            placeholder="Quantidade em estoque"
            min="0"
            required
          />
        </div>
        <div className="mb-5 w-full px-8">
          <label htmlFor="unidade" className="block text-md font-medium text-gray-600">
            Unidade
          </label>
          <select
            name="unidade"
            id="unidade"
            className="input input-bordered input-primary border w-full max-w-xs p-2"
            required
          >
            <option value="UNIDADE_1">Unidade 1</option>
            <option value="UNIDADE_2">Unidade 2</option>
          </select>
        </div>
        <div className="mb-5 w-full px-8">
          <label htmlFor="category" className="block text-md font-medium text-gray-600">
            Categoria do Produto
          </label>
          <select
            name="category"
            id="category"
            className="input input-bordered input-primary border w-full max-w-xs p-2"
            required
          >
            {categories.map((category: string, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-5 w-full px-8">
          <label htmlFor="isFeatured" className="text-md font-medium text-gray-600">
            Mark as featured product?
          </label>
          <input
            type="checkbox"
            name="isFeatured"
            id="isFeatured"
            className="input input-bordered input-primary border max-w-xs p-2 ml-3"
          />
        </div>
        <div className="mb-5">
          <label htmlFor="image" className="block text-md font-medium text-gray-600">
            Foto do Produto
          </label>
          <input
            type="file"
            name="image"
            id="image"
            accept="image/*"
            className="input input-bordered input-primary w-full max-w-xs"
            placeholder="Image..."
            required
          />
        </div>
        <div className="flex items-center justify-between py-5 w-full p-8">
          <div
            className="btn btn-primary cursor-pointer border-2 border-primary text-primary bg-primary-foreground font-bold px-10 py-3 rounded-md"
            onClick={() => router.push("/")}
          >
            Voltar
          </div>
          <button className="btn btn-primary border-2 border-primary bg-primary text-primary-foreground font-bold px-10 py-3 rounded-md ">
            Cadastrar
          </button>
        </div>
      </form>
    </div>
  );
}
