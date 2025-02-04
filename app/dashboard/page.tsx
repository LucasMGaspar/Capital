'use client';

import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Registra os elementos necessários do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

interface Product {
  id: string;
  cod_prod: string;
  name: string;
  price: string;
  image: string;
  category: string;
  isFeatured: boolean;
  stock_quantity: number;
  unidade: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: number;
  orderId: number;
  productId: string;
  quantity: number;
  unitPrice: string; // Pode vir como string
  product: Product;
}

interface Order {
  id: number;
  status: string;
  paymentId: string | null;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

interface SalesResponse {
  orders: Order[];
  totalSales: number;
  totalProductQuantity?: number;
  productStock?: number | null;
}

export default function Dashboard() {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [salesData, setSalesData] = useState<SalesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Lista dos produtos para o filtro (considerando apenas os produtos que usam UNIDADE_1)
  const productOptions = [
    'Amstel Long Neck',
    'Chá Baer-Mate',
    'Clash´D',
    'Eisenbahn Long Neck',
    'Heineken Long Neck',
    'Ipa Long Neck',
    'Mamba Watter C/Gás',
    'Mamba Watter S/Gás',
    'Praya Long Neck',
    'Suco Mitto',
  ];

  const fetchSales = async () => {
    if (!startDate || !endDate) {
      setError('Por favor, informe as datas de início e fim.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Monta a URL da API com os parâmetros
      let queryUrl = `/api/sales?startDate=${startDate}&endDate=${endDate}`;
      if (selectedProduct) {
        queryUrl += `&product=${encodeURIComponent(selectedProduct)}`;
      }
      const response = await fetch(queryUrl);
      const data: SalesResponse | { error: string } = await response.json();
      if (response.ok) {
        setSalesData(data as SalesResponse);
      } else {
        setError((data as { error: string }).error || 'Erro ao buscar dados.');
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao buscar dados.');
    } finally {
      setLoading(false);
    }
  };

  // Usa os dados retornados pela API (eles já estão filtrados por UNIDADE_1 e, se aplicado, por produto)
  let orders: Order[] = [];
  let totalOrders = 0;
  let totalSales = 0;
  let pieChartData = null;

  if (salesData) {
    orders = salesData.orders;
    totalOrders = orders.length;
    totalSales = orders.reduce((sum, order) => {
      return sum + order.orderItems.reduce((sub, item) => sub + parseFloat(item.unitPrice) * item.quantity, 0);
    }, 0);

    // Calcula a distribuição das vendas por produto (agrupa pelo nome do produto)
    const productData = orders.reduce((acc, order) => {
      order.orderItems.forEach((item) => {
        const productName = item.product.name;
        const itemTotal = parseFloat(item.unitPrice) * item.quantity;
        acc[productName] = (acc[productName] || 0) + itemTotal;
      });
      return acc;
    }, {} as Record<string, number>);

    pieChartData = {
      labels: Object.keys(productData),
      datasets: [
        {
          label: 'Vendas por Produto',
          data: Object.values(productData),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
          hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        },
      ],
    };
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard de Vendas</h1>

        {/* Seção de Filtros */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-4">
            <div className="mb-4 sm:mb-0">
              <label htmlFor="startDate" className="block text-gray-600 mb-1">
                Data Inicial:
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="mb-4 sm:mb-0">
              <label htmlFor="endDate" className="block text-gray-600 mb-1">
                Data Final:
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="mb-4 sm:mb-0">
              <label htmlFor="product" className="block text-gray-600 mb-1">
                Filtrar por Produto:
              </label>
              <select
                id="product"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Todos</option>
                {productOptions.map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={fetchSales}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow"
              >
                Buscar Vendas
              </button>
            </div>
          </div>
          {error && <p className="mt-4 text-red-500">{error}</p>}
        </div>

        {loading && <p className="text-gray-600">Carregando...</p>}

        {salesData && (
          <>
            {/* Cards com Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded">
                <p className="text-gray-600">Total de Pedidos (status paid)</p>
                <p className="text-2xl font-bold text-green-700">{totalOrders}</p>
              </div>
              <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-gray-600">Total de Vendas</p>
                <p className="text-2xl font-bold text-blue-700">R$ {totalSales.toFixed(2)}</p>
              </div>
              {selectedProduct && salesData.totalProductQuantity !== undefined && (
                <div className="bg-purple-100 border-l-4 border-purple-500 p-4 rounded">
                  <p className="text-gray-600">
                    Quantidade vendida de <strong>{selectedProduct}</strong>
                  </p>
                  <p className="text-2xl font-bold text-purple-700">{salesData.totalProductQuantity}</p>
                </div>
              )}
              {selectedProduct && salesData.productStock !== undefined && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
                  <p className="text-gray-600">
                    Estoque de <strong>{selectedProduct}</strong>
                  </p>
                  <p className="text-2xl font-bold text-yellow-700">{salesData.productStock}</p>
                </div>
              )}
            </div>

            {/* Gráfico de Pizza: Distribuição de Vendas por Produto */}
            {pieChartData && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Distribuição de Vendas por Produto
                </h2>
                <div className="max-w-md mx-auto">
                  <Pie data={pieChartData} />
                </div>
              </div>
            )}

            {/* Tabela de Detalhes dos Pedidos */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Detalhes dos Pedidos
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 border-b text-left text-sm font-medium text-blue-500 uppercase">
                        Pedido
                      </th>
                      <th className="px-6 py-3 border-b text-left text-sm font-medium text-blue-500 uppercase">
                        Data
                      </th>
                      <th className="px-6 py-3 border-b text-left text-sm font-medium text-blue-500 uppercase">
                        Produtos
                      </th>
                      <th className="px-6 py-3 border-b text-right text-sm font-medium text-blue-500 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const orderTotal = order.orderItems.reduce(
                        (sum, item) => sum + parseFloat(item.unitPrice) * item.quantity,
                        0
                      );
                      return (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 border-b">#{order.id}</td>
                          <td className="px-6 py-4 border-b">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 border-b">
                            {order.orderItems.map((item) => (
                              <div key={item.id} className="text-sm text-gray-800">
                                {item.product.name} (x{item.quantity})
                              </div>
                            ))}
                          </td>
                          <td className="px-6 py-4 border-b text-right">
                            R$ {orderTotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
