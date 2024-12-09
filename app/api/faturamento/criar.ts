// pages/api/faturamento/criar.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from "../../../lib/db";
import mercadopago from 'mercadopago';

 // @ts-ignore
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN || ""
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { cpf, nome, sobrenome, email, valor_final } = req.body;

  if (!cpf || !nome || !sobrenome || !email || !valor_final) {
    return res.status(400).json({ error: "cpf, nome, sobrenome, email e valor_final são obrigatórios" });
  }

  try {
    // Cria o cliente
    const novoCliente = await prisma.cliente.create({
      data: {
        cpf,
        nome,
        sobrenome,
        email
      }
    });

    const referencia = `reference_${novoCliente.id_cliente}_${Date.now()}`;

    // Cria preferência no Mercado Pago
    const preference = {
      items: [{
        title: "Pagamento",
        quantity: 1,
        currency_id: "BRL",
        unit_price: Number(valor_final)
      }],
      payer: {
        name: novoCliente.nome,
        surname: novoCliente.sobrenome,
        email: novoCliente.email,
        identification: {
          type: "CPF",
          number: novoCliente.cpf
        }
      },
      payment_methods: {
        excluded_payment_types: [
          { id: "credit_card" },
          { id: "ticket" },
          { id: "debit_card" },
          { id: "atm" }
        ],
        excluded_payment_methods: []
      },
      external_reference: referencia,
      back_urls: {
        success: "https://nacapitalhonest.com/sucesso",
        pending: "https://nacapitalhonest.com/pending",
        failure: "https://nacapitalhonest.com/failure"
      },
      auto_return: "approved",
      statement_descriptor: "NaCapitalHonest",
      expires: false
    };

     // @ts-ignore

    const response = await mercadopago.preferences.create(preference);

    // Cria fatura no banco
    const novaFatura = await prisma.fatura.create({
      data: {
        valor_final: Number(valor_final),
        status_fatura: 0,
        data_criacao: new Date(),
        id_preferencia_pagamento: response.body.id,
        link_pagamento: response.body.init_point,
        external_reference: referencia,
        cliente: { connect: { id_cliente: novoCliente.id_cliente } }
      }
    });

    return res.status(200).json(novaFatura);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar preferência de pagamento" });
  }
}
