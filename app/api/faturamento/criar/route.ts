import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import mercadopago from "mercadopago";

 // @ts-ignore
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { cpf, nome, sobrenome, email, valor_final } = body;

    if (!cpf || !nome || !sobrenome || !email || !valor_final) {
      return NextResponse.json(
        { error: "cpf, nome, sobrenome, email e valor_final são obrigatórios" },
        { status: 400 }
      );
    }

    // Cria o cliente no banco de dados
    const novoCliente = await prisma.cliente.create({
      data: {
        cpf,
        nome,
        sobrenome,
        email,
      },
    });

    const referencia = `reference_${novoCliente.id_cliente}_${Date.now()}`;

    // Cria preferência no Mercado Pago
    const preference = {
      items: [
        {
          title: "Pagamento",
          quantity: 1,
          currency_id: "BRL",
          unit_price: Number(valor_final),
        },
      ],
      payer: {
        name: novoCliente.nome,
        surname: novoCliente.sobrenome,
        email: novoCliente.email,
        identification: {
          type: "CPF",
          number: novoCliente.cpf,
        },
      },
      payment_methods: {
        excluded_payment_types: [
          { id: "credit_card" },
          { id: "ticket" },
          { id: "debit_card" },
          { id: "atm" },
        ],
        excluded_payment_methods: [],
      },
      external_reference: referencia,
      back_urls: {
        success: "https://nacapitalhonest.com/sucesso",
        pending: "https://nacapitalhonest.com/pending",
        failure: "https://nacapitalhonest.com/failure",
      },
      auto_return: "approved",
      statement_descriptor: "NaCapitalHonest",
      expires: false,
    };

     // @ts-ignore

    const response = await mercadopago.preferences.create(preference);

    // Cria fatura no banco de dados
    const novaFatura = await prisma.fatura.create({
      data: {
        valor_final: Number(valor_final),
        status_fatura: 0,
        data_criacao: new Date(),
        id_preferencia_pagamento: response.body.id,
        link_pagamento: response.body.init_point,
        external_reference: referencia,
      },
    });

    return NextResponse.json(novaFatura, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar preferência de pagamento" },
      { status: 500 }
    );
  }
}
