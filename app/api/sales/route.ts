// app/api/sales/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const productFilter = searchParams.get('product'); // filtro opcional por nome do produto

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
    // Busca os pedidos com status "paid" no período informado,
    // incluindo os itens do pedido com os dados do produto.
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

    // Para cada pedido, filtra os itens que possuem produtos com UNIDADE_1.
    // Se houver filtro de produto, aplica também (comparando o nome do produto).
    const filteredOrders = orders.map((order) => ({
      ...order,
      orderItems: order.orderItems.filter((item) => {
        const matchesUnidade = item.product.unidade === 'UNIDADE_1';
        const matchesProduct = productFilter ? item.product.name === productFilter : true;
        return matchesUnidade && matchesProduct;
      }),
    }));

    // Remove os pedidos que, após a filtragem, ficaram sem itens
    const nonEmptyOrders = filteredOrders.filter(order => order.orderItems.length > 0);

    // Calcula o total das vendas somando os itens filtrados
    const totalSales = nonEmptyOrders.reduce((acc, order) => {
      const orderTotal = order.orderItems.reduce((sum, item) => {
        return sum + parseFloat(item.unitPrice.toString()) * item.quantity;
      }, 0);
      return acc + orderTotal;
    }, 0);

    // Se houver filtro de produto, calcula a quantidade total vendida desse produto
    let totalProductQuantity: number | undefined = undefined;
    if (productFilter) {
      totalProductQuantity = nonEmptyOrders.reduce((acc, order) => {
        return acc + order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
      }, 0);
    }

    // Se houver filtro de produto, busca na tabela Product a quantidade em estoque do produto filtrado
    let productStock: number | null = null;
    if (productFilter) {
      const productData = await prisma.product.findFirst({
        where: {
          name: productFilter,
          unidade: 'UNIDADE_1',
        },
      });
      if (productData) {
        productStock = productData.stock_quantity;
      }
    }

    return NextResponse.json({ 
      orders: nonEmptyOrders, 
      totalSales, 
      totalProductQuantity, 
      productStock 
    });
  } catch (error) {
    console.error('Erro ao buscar vendas UNIDADE_1:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
