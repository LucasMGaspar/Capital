import { NextRequest, NextResponse } from 'next/server';
import {prisma } from '@/lib/db';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export async function POST(req: NextRequest) {
  const body = await req.json();

  // O Mercado Pago envia um objeto, e body.data.id contém o ID do pagamento
  const paymentId = body.data?.id;
  if (!paymentId) {
    return NextResponse.json({ message: 'Pagamento sem ID' }, { status: 400 });
  }

  // Inicializar o cliente do Mercado Pago
  const mpClient = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
    options: { timeout: 5000 }
  });

  const paymentClient = new Payment(mpClient);
  const paymentResponse = await paymentClient.get({ id: paymentId });

  // Verificar se o pagamento está aprovado
  if (paymentResponse.status === 'approved') {
    const orderId = parseInt(paymentResponse.external_reference as string, 10);
    if (isNaN(orderId)) {
      return NextResponse.json({ message: 'Pedido inválido' }, { status: 400 });
    }

    // Atualizar pedido para "paid"
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'paid',
        paymentId: String(paymentId)
      },
      include: { orderItems: true }
    });

    // Atualizar estoque
    for (const item of order.orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock_quantity: { decrement: item.quantity }
        }
      });
    }

    return NextResponse.json({ message: 'Pedido atualizado com sucesso' });
  }

  return NextResponse.json({ message: 'Pagamento não aprovado ainda' }, { status: 200 });
}
