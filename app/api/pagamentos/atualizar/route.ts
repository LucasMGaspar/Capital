// pages/api/pagamentos/atualizar.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from "../../../../lib/db";
import mercadopago from 'mercadopago';

 // @ts-ignore
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN || ""
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { topic, id } = req.query;

  console.log("Topico:", topic);
  console.log("id:", id);

  if (topic === "payment" && typeof id === 'string') {
    try {
         // @ts-ignore
      const paymentInfo = await mercadopago.payment.get(id);
      const target2 = paymentInfo.response;

      console.log("Detalhes do pagamento:", target2);

      if (target2.status === "approved") {
        let pagamentoExistente = await prisma.pagamento.findUnique({
          where: { payment_id: id }
        });

        if (pagamentoExistente) {
          // Atualiza pagamento
          await prisma.pagamento.update({
            where: { payment_id: id },
            data: {
              payment_status: target2.status,
              payment_method_id: target2.payment_method_id,
              payment_status_detail: target2.status_detail,
              external_reference: target2.external_reference,
              payment_type_id: target2.payment_type_id
            }
          });
        } else {
          // Cria novo pagamento
          await prisma.pagamento.create({
            data: {
              payment_id: id,
              payment_status: target2.status,
              payment_method_id: target2.payment_method_id,
              payment_status_detail: target2.status_detail,
              external_reference: target2.external_reference,
              payment_type_id: target2.payment_type_id,
              fatura: target2.external_reference ? {
                connect: { external_reference: target2.external_reference }
              } : undefined
            }
          });
        }

        if (target2.external_reference) {
          await prisma.fatura.updateMany({
            where: { external_reference: target2.external_reference },
            data: {
              status_fatura: 1,
              data_pagamento: new Date()
            }
          });
        }
      }

      return res.status(200).json({ message: "OK" });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao consultar pagamento" });
    }
  } else {
    return res.status(400).json({ error: "topic ou id inválido" });
  }
}
