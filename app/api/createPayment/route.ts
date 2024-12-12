import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '@/lib/db';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Nenhum item enviado" }, { status: 400 });
    }

    const productIds = items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    // Checar se todos os produtos foram encontrados
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return NextResponse.json({ error: `Produto ${item.productId} não encontrado` }, { status: 400 });
      }
    }

    // Criar pedido no banco
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

    const mpClient = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
      options: { timeout: 5000 }
    });

    const preferenceClient = new Preference(mpClient);

    const preferenceBody = {
      items: order.orderItems.map((orderItem) => {
        const product = products.find(p => p.id === orderItem.productId)!;
        return {
          id: product.id,
          title: product.name,
          unit_price: Number(product.price),
          quantity: orderItem.quantity
        };
      }),
      external_reference: String(order.id),
      notification_url: `${process.env.BASE_URL}/api/payment/ipn`,
      payment_methods: {
        default_payment_method_id: "pix",
        excluded_payment_types: [
          { id: "credit_card" },
          { id: "debit_card" },
          { id: "ticket" },
          { id: "atm" }
          // Não removemos bank_transfer para permitir PIX
        ]
      },
      payer: {
        name: "Lucas",
        surname: "Gaspar",
        email: "lucasmanoel.g.g@gmail.com",
        identification: {
          type: "CPF",
          number: "13975394617"
        },
      }
    };

    const preferenceResponse = await preferenceClient.create({ body: preferenceBody });

    return NextResponse.json({
      orderId: order.id,
      init_point: preferenceResponse.init_point
    });
  } catch (error: any) {
    console.error("Erro na rota /api/orders:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
