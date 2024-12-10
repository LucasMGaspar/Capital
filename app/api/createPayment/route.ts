// app/api/createPayment/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('API Route /api/createPayment foi chamada.');

  try {
    const { valor_final } = await request.json();
    console.log('Valor Final Recebido:', valor_final);

    // Converte "valor_final" para número se for string
    const valorFinalNumber =
      typeof valor_final === 'string'
        ? parseFloat(valor_final.replace(',', '.'))
        : valor_final;

    console.log('Valor Final Convertido:', valorFinalNumber);

    // Validação básica do valor final
    if (isNaN(valorFinalNumber) || valorFinalNumber <= 0) {
      console.error('Valor final inválido:', valorFinalNumber);
      return NextResponse.json(
        { error: 'Valor final inválido.' },
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
          valor_final: valorFinalNumber, // Envia o valor final como número
          // Adicione outros campos conforme a necessidade da API
        }),
      }
    );

    console.log('Resposta da API Externa Status:', apiResponse.status);

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error('Erro da API Externa:', errorData.message || 'Erro ao criar a fatura.');
      throw new Error(errorData.message || 'Erro ao criar a fatura.');
    }

    const data = await apiResponse.json();
    console.log('Dados Recebidos da API Externa:', data);

    // Verifica se a resposta contém o link de pagamento
    if (data.paymentLink) {
      return NextResponse.json({ paymentLink: data.paymentLink }, { status: 200 });
    } else {
      console.error('Link de pagamento não encontrado na resposta.');
      throw new Error('Link de pagamento não encontrado.');
    }
  } catch (error: any) {
    console.error('Erro Interno da API:', error.message || 'Erro interno do servidor.');
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
