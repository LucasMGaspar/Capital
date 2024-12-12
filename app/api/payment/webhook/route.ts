// app/api/payment/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Extrair o corpo da requisição como JSON
    const body = await req.json();

    // Identificador único para o endpoint webhook
    const endpointIdentifier = 'Webhook Endpoint';

    // Logar os dados recebidos com o identificador
    console.log(`${endpointIdentifier} recebido dados:`, JSON.stringify(body, null, 2));

    // Responder com 200 OK para confirmar o recebimento
    return NextResponse.json({ message: 'OK' }, { status: 200 });
  } catch (error: any) {
    // Identificador único para erros no endpoint webhook
    const endpointIdentifier = 'Webhook Endpoint';

    // Logar o erro com o identificador
    console.error(`${endpointIdentifier} encontrou um erro:`, error);

    // Sempre retorna 200 OK para evitar reenvios do webhook
    return NextResponse.json({ message: 'OK' }, { status: 200 });
  }
}
