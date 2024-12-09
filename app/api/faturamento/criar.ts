import { NextApiRequest, NextApiResponse } from "next";

const mercadopago = require("mercadopago");

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN as string
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { valor_final } = req.body as { valor_final: number };

    if (!valor_final) {
      return res.status(400).json({ error: "valor_final é obrigatório" });
    }

    const referencia = `reference-${Date.now()}`;
    const dominio = "seusite.com"; 
    const urlRetorno = `https://${dominio}/pos-pagamento`;

    const preference = {
      items: [
        {
          id: "produto",
          title: "Compra direta",
          quantity: 1,
          currency_id: "BRL",
          unit_price: Number(valor_final)
        }
      ],
      external_reference: referencia,
      back_urls: {
        success: urlRetorno,
        failure: urlRetorno,
        pending: urlRetorno
      },
      auto_return: "approved",
      expires: false,
      payment_methods: {
        excluded_payment_types: [
          { id: "credit_card" },
          { id: "debit_card" },
          { id: "ticket" },
          { id: "bank_transfer" },
          { id: "account_money" }
        ],
        default_payment_method_id: "pix"
      },
      statement_descriptor: "Minha Loja"
    };

    // @ts-ignore - Ignora caso o TS reclame por falta de tipagem
    const responseMP = await mercadopago.preferences.create(preference);
    const link_pagamento = responseMP.body.init_point as string;
    const id_preferencia_pagamento = responseMP.body.id as string;

    // Exemplo simples de fatura em memória
    const novaFatura = {
      id_fatura: Date.now(),
      data_criacao: new Date().toISOString(),
      data_pagamento: null,
      valor_final,
      status_fatura: 0,
      id_preferencia_pagamento,
      link_pagamento,
      external_reference: referencia
    };

    return res.status(200).json(novaFatura);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar fatura" });
  }
}
