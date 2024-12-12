// app/api/payment/ipn/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export async function POST(req: NextRequest) {
  try {
    // Extrair os parâmetros 'topic' e 'id' da URL
    const { searchParams } = req.nextUrl;
    const topic = searchParams.get('topic');
    const paymentId = searchParams.get('id');

    // Log dos parâmetros recebidos para depuração
    console.log("IPN recebido com parâmetros:", { topic, paymentId });

    // Verificar se os parâmetros existem
    if (!topic || !paymentId) {
      console.error("IPN recebido sem 'topic' ou 'id':", { topic, paymentId });
      // Retorna 200 OK mesmo em caso de parâmetros inválidos para evitar reenvios
      return NextResponse.json({ message: 'OK' }, { status: 200 });
    }

    // Inicializar cliente do Mercado Pago
    const mpClient = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
      options: { timeout: 5000 }
    });

    const paymentClient = new Payment(mpClient);

    // Consultar o status do pagamento
    const paymentResponse = await paymentClient.get({ id: paymentId });

    // Log da resposta do Mercado Pago para depuração
    console.log("Resposta do Mercado Pago:", JSON.stringify(paymentResponse, null, 2));

    // Verificar se o pagamento está aprovado
    if (paymentResponse.status === 'approved') {
      const externalReference = paymentResponse.external_reference;
      const orderId = parseInt(externalReference as string, 10);
      
      console.log("external_reference:", externalReference);
      console.log("orderId:", orderId);

      if (isNaN(orderId)) {
        console.error("Pedido inválido via IPN:", externalReference);
        // Retorna 200 OK mesmo em caso de pedido inválido
        return NextResponse.json({ message: 'OK' }, { status: 200 });
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

      console.log(`Pedido ${orderId} atualizado para 'paid' com paymentId ${paymentId}`);

      // Atualizar estoque
      for (const item of order.orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock_quantity: { decrement: item.quantity }
          }
        });
        console.log(`Estoque do produto ${item.productId} decrementado em ${item.quantity}`);
      }
    } else {
      console.log("Pagamento não aprovado ainda:", paymentResponse.status);
    }

    // Retorna 200 OK independentemente do processamento
    return NextResponse.json({ message: 'OK' }, { status: 200 });

  } catch (error: any) {
    // Log de erro para depuração
    console.error("Erro na rota /api/payment/ipn:", error);

    // Sempre retorna 200 OK para evitar reenvios
    return NextResponse.json({ message: 'OK' }, { status: 200 });
  }
}
