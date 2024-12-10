// app/api/createPayment/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { totalValue } = await request.json();

    // Validação básica do valor total
    if (typeof totalValue !== 'number' || totalValue <= 0) {
      return NextResponse.json(
        { error: 'Valor total inválido.' },
        { status: 400 }
      );
    }

    // Chamada à API externa para criar a fatura
    const apiResponse = await fetch(
      'https://roatrip.tur.br/api/v1/public/faturamentonacapital/criar',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Adicione quaisquer outros headers necessários aqui, como autenticação
        },
        body: JSON.stringify({
          totalValue, // Envia o valor total recebido do frontend
          // Adicione outros campos conforme a necessidade da API
        }),
      }
    );

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(errorData.message || 'Erro ao criar a fatura.');
    }

    const data = await apiResponse.json();

    // Verifica se a resposta contém o link de pagamento
    if (data.paymentLink) {
      return NextResponse.json({ paymentLink: data.paymentLink }, { status: 200 });
    } else {
      throw new Error('Link de pagamento não encontrado.');
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
