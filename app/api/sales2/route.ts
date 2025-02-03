// app/api/sales/unidade2/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: 'Parâmetros startDate e endDate são obrigatórios' },
      { status: 400 }
    );
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  // Ajusta a data final para incluir todo o dia (até 23:59:59)
  end.setHours(23, 59, 59, 999);

  try {
    // Busca os pedidos com status "paid" no período informado, incluindo os itens do pedido com o produto relacionado.
    const orders = await prisma.order.findMany({
      where: {
        status: 'paid',
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Para cada pedido, filtra os itens que possuem produtos com UNIDADE_2.
    const filteredOrders = orders.map((order) => ({
      ...order,
      orderItems: order.orderItems.filter(
        (item) => item.product.unidade === 'UNIDADE_2'
      ),
    }));

    // Calcula o total das vendas somando apenas os itens filtrados.
    const totalSales = filteredOrders.reduce((acc, order) => {
      const orderTotal = order.orderItems.reduce((sum, item) => {
        return sum + parseFloat(item.unitPrice.toString()) * item.quantity;
      }, 0);
      return acc + orderTotal;
    }, 0);

    return NextResponse.json({ orders: filteredOrders, totalSales });
  } catch (error) {
    console.error('Erro ao buscar vendas UNIDADE_2:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
