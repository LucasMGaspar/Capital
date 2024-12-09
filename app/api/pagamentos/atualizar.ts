import type { NextApiRequest, NextApiResponse } from "next";
import { faturas, pagamentos } from "../data";

interface MPPagamento {
  status: string;
  payment_method_id: string;
  status_detail: string;
  external_reference: string;
  payment_type_id: string;
  order?: {
    id: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { topic, id } = req.query as { topic: string; id: string };

    if (topic === "payment" && id) {
      const fetch = (await import('node-fetch')).default;
      const url = `https://api.mercadopago.com/v1/payments/${id}`;

      const mpRes = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
        }
      });

      const pagamentoData = await mpRes.json() as MPPagamento;
      console.log("Dados do Pagamento:", pagamentoData);

      if (pagamentoData.status === "approved") {
        let pagamentoExistente = pagamentos.find(p => p.payment_id === id);

        if (!pagamentoExistente) {
          pagamentoExistente = {
            id_pagamento: pagamentos.length + 1,
            data_cadastro: new Date().toISOString(),
            payment_id: id,
            payment_status: pagamentoData.status,
            merchant_order_id: pagamentoData.order ? pagamentoData.order.id : null,
            payment_method_id: pagamentoData.payment_method_id,
            payment_type_id: pagamentoData.payment_type_id,
            payment_status_detail: pagamentoData.status_detail,
            external_reference: pagamentoData.external_reference,
            status: 1
          };
          pagamentos.push(pagamentoExistente);
        } else {
          pagamentoExistente.payment_status = pagamentoData.status;
          pagamentoExistente.payment_method_id = pagamentoData.payment_method_id;
          pagamentoExistente.payment_status_detail = pagamentoData.status_detail;
          pagamentoExistente.external_reference = pagamentoData.external_reference;
          pagamentoExistente.payment_type_id = pagamentoData.payment_type_id;
        }

        // Atualiza fatura
        const fatura = faturas.find(f => f.external_reference === pagamentoData.external_reference);
        if (fatura) {
          fatura.status_fatura = 1; // pago
          fatura.data_pagamento = new Date().toISOString();
        }

        console.log("Pagamento aprovado e atualizado com sucesso!");
      }

      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ message: "Nada a atualizar" });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao processar pagamento" });
  }
}
