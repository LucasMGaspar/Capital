import { NextRequest, NextResponse } from 'next/server';
import {prisma } from '@/lib/db';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export async function POST(req: NextRequest) {
  const body = await req.json();

  // O Mercado Pago pode enviar o 'id' do pagamento como body.id ou em query params dependendo da configuração.
  // Verifique a documentação do Mercado Pago sobre IPN para saber quais campos serão enviados.
  const paymentId = body.data?.id || body.id;
  
  if (!paymentId) {
    return NextResponse.json({ message: 'Pagamento sem ID recebido via IPN' }, { status: 400 });
  }

  // Inicializar cliente do Mercado Pago
  const mpClient = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
    options: { timeout: 5000 }
  });

  const paymentClient = new Payment(mpClient);

  // Consultar o status do pagamento
  const paymentResponse = await paymentClient.get({ id: paymentId });

  if (paymentResponse.status === 'approved') {
    const orderId = parseInt(paymentResponse.external_reference as string, 10);
    if (isNaN(orderId)) {
      return NextResponse.json({ message: 'Pedido inválido via IPN' }, { status: 400 });
    }

    // Atualizar pedido para 'paid'
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

    return NextResponse.json({ message: 'Pedido atualizado com sucesso via IPN' });
  }

  return NextResponse.json({ message: 'Pagamento não aprovado via IPN ainda' }, { status: 200 });
}
