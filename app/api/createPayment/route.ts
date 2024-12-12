import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export async function POST(req: NextRequest) {
  const { items } = await req.json();
  // items = [{ productId: string, quantity: number }, ...]

  // Buscar os produtos no banco
  const productIds = items.map((i: any) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } }
  });

  // Verificar se todos os produtos foram encontrados e se tem estoque (opcional)
  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) {
      return NextResponse.json({ error: `Produto ${item.productId} não encontrado` }, { status: 400 });
    }
    // (Opcional: Verificar se stock_quantity >= item.quantity)
    // if (product.stock_quantity < item.quantity) {
    //   return NextResponse.json({ error: `Estoque insuficiente para o produto ${product.name}` }, { status: 400 });
    // }
  }

  // Criar o pedido (status pending)
  const order = await prisma.order.create({
    data: {
      status: 'pending',
      orderItems: {
        create: items.map((item: any) => {
          const product = products.find(p => p.id === item.productId)!;
          return {
            productId: product.id,
            quantity: item.quantity,
            unitPrice: product.price
          };
        })
      }
    },
    include: { orderItems: true }
  });

  // Inicializar o cliente do Mercado Pago
  const mpClient = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
    options: { timeout: 5000 }
  });

  const preferenceClient = new Preference(mpClient);

  // Criar preferência somente para PIX
  const preferenceBody = {
    items: order.orderItems.map((orderItem) => {
      const product = products.find(p => p.id === orderItem.productId)!;
      return {
        id: product.id, // Campo id obrigatório
        title: product.name,
        unit_price: Number(product.price), // conversão Decimal para number
        quantity: orderItem.quantity
      };
    }),
    external_reference: String(order.id),
    notification_url: `${process.env.BASE_URL}/api/payment/webhook`,
    payment_methods: {
      default_payment_method_id: "pix",
      excluded_payment_types: [
        { id: "credit_card" },
        { id: "debit_card" },
        { id: "ticket" },
        //{ id: "bank_transfer" },
        { id: "atm" }
      ]
    }
  };

  const preferenceResponse = await preferenceClient.create({ body: preferenceBody });

  // Retorna a URL para redirecionar o usuário ao checkout PIX
  return NextResponse.json({
    orderId: order.id,
    init_point: preferenceResponse.init_point
  });
}
