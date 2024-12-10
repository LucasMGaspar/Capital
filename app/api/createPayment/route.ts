// app/api/createPayment/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { valor_final } = await request.json();

    // Validação do valor_final
    if (typeof valor_final !== 'number' || valor_final <= 0) {
      return NextResponse.json(
        { error: 'O valor final deve ser um número maior que 0.' },
        { status: 400 }
      );
    }

    // Configurando a requisição para a API externa
    const response = await fetch(
      'https://roatrip.tur.br/api/v1/public/faturamentonacapital/criar',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valor_final, // Enviando o valor_final recebido do cliente
        }),
      }
    );

    // Verificando se a requisição para a API foi bem-sucedida
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Erro ao criar fatura.' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Verificando se o link de pagamento foi retornado
    if (data.link_pagamento) {
      return NextResponse.json({ paymentLink: data.link_pagamento });
    } else {
      return NextResponse.json(
        { error: 'Link de pagamento não encontrado na resposta.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
