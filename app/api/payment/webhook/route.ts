// app/api/payment/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export async function POST(req: NextRequest) {
  try {
    // Extrair os parâmetros 'topic' e 'id' da URL
    const { searchParams } = req.nextUrl;
    const topic = searchParams.get('topic');
    const paymentId = searchParams.get('id');

    // Verificar se os parâmetros existem
    if (!topic || !paymentId) {
      console.error("Webhook recebido sem 'topic' ou 'id':", { topic, paymentId });
      return NextResponse.json({ message: 'Parâmetros inválidos recebidos via webhook' }, { status: 400 });
    }

    // Inicializar cliente do Mercado Pago
    const mpClient = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
      options: { timeout: 5000 }
    });

    const paymentClient = new Payment(mpClient);

    // Consultar o status do pagamento
    const paymentResponse = await paymentClient.get({ id: paymentId });

    // Log para depuração
    console.log("Resposta do Mercado Pago:", JSON.stringify(paymentResponse, null, 2));

    // Verificar se o pagamento está aprovado
    if (paymentResponse.status === 'approved') {
      const externalReference = paymentResponse.external_reference;
      const orderId = parseInt(externalReference as string, 10);
      
      if (isNaN(orderId)) {
        console.error("Pedido inválido via webhook:", externalReference);
        return NextResponse.json({ message: 'Pedido inválido via webhook' }, { status: 400 });
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

      console.log(`Pedido ${orderId} atualizado para 'paid' com paymentId ${paymentId}`);

      return NextResponse.json({ message: 'Pedido atualizado com sucesso via webhook' }, { status: 200 });
    }

    console.log("Pagamento não aprovado ainda:", paymentResponse.status);
    return NextResponse.json({ message: 'Pagamento não aprovado ainda via webhook' }, { status: 200 });
  } catch (error: any) {
    console.error("Erro na rota /api/payment/webhook:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
