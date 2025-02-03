// app/dashboard/page.tsx
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
  unitPrice: string; // o Prisma pode retornar decimais como string
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
}

export default function Dashboard() {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [salesData, setSalesData] = useState<SalesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchSales = async () => {
    if (!startDate || !endDate) {
      setError('Por favor, informe as datas de início e fim.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await fetch(
        `/api/sales2?startDate=${startDate}&endDate=${endDate}`
      );
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

  // Se os dados de vendas estiverem disponíveis, calcula a distribuição de vendas por categoria
  let pieChartData = null;
  if (salesData) {
    const categoryData = salesData.orders.reduce((acc, order) => {
      order.orderItems.forEach((item) => {
        const category = item.product?.category || 'Sem Categoria';
        const itemTotal = parseFloat(item.unitPrice) * item.quantity;
        acc[category] = (acc[category] || 0) + itemTotal;
      });
      return acc;
    }, {} as Record<string, number>);

    pieChartData = {
      labels: Object.keys(categoryData),
      datasets: [
        {
          label: 'Vendas por Categoria',
          data: Object.values(categoryData),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
          ],
          hoverBackgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
          ],
        },
      ],
    };
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Dashboard de Vendas
        </h1>

        {/* Seção de filtros */}
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={fetchSales}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow transition-colors duration-200"
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
            {/* Cards com métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded">
                <p className="text-gray-600">Total de Pedidos (status paid)</p>
                <p className="text-2xl font-bold text-green-700">
                  {salesData.orders.length}
                </p>
              </div>
              <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-gray-600">Total de Vendas</p>
                <p className="text-2xl font-bold text-blue-700">
                  R$ {parseFloat(salesData.totalSales.toString()).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Gráfico de Pizza: Distribuição de Vendas por Categoria */}
            {pieChartData && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Distribuição de Vendas por Categoria
                </h2>
                <div className="max-w-md mx-auto">
                  <Pie data={pieChartData} />
                </div>
              </div>
            )}

            {/* Tabela de detalhes dos pedidos */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Detalhes dos Pedidos
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-sm font-medium text-blue-500 uppercase tracking-wider">
                        Pedido
                      </th>
                      <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-sm font-medium text-blue-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 border-b-2 border-gray-200 text-right text-sm font-medium text-blue-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {salesData.orders.map((order) => {
                      const orderTotal = order.orderItems.reduce((sum, item) => {
                        return sum + parseFloat(item.unitPrice) * item.quantity;
                      }, 0);
                      return (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                            <div className="text-sm text-gray-800">
                              #{order.id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                            <div className="text-sm text-gray-800">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 text-right">
                            <div className="text-sm text-gray-800">
                              R$ {orderTotal.toFixed(2)}
                            </div>
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
