import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import mercadopago from "mercadopago";

 // @ts-ignore
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
});

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get("topic");
  const id = searchParams.get("id");

  console.log("Topico:", topic);
  console.log("id:", id);

  if (topic === "payment" && id) {
    try {
       // @ts-ignore
      const paymentInfo = await mercadopago.payment.get(id);
      const target2 = paymentInfo.response;

      console.log("Detalhes do pagamento:", target2);

      if (target2.status === "approved") {
        let pagamentoExistente = await prisma.pagamento.findUnique({
          where: { payment_id: id },
        });

        if (pagamentoExistente) {
          await prisma.pagamento.update({
            where: { payment_id: id },
            data: {
              payment_status: target2.status,
              payment_method_id: target2.payment_method_id,
              payment_status_detail: target2.status_detail,
              external_reference: target2.external_reference,
              payment_type_id: target2.payment_type_id,
            },
          });
        } else {
          await prisma.pagamento.create({
            data: {
              payment_id: id,
              payment_status: target2.status,
              payment_method_id: target2.payment_method_id,
              payment_status_detail: target2.status_detail,
              external_reference: target2.external_reference,
              payment_type_id: target2.payment_type_id,
            },
          });
        }

        if (target2.external_reference) {
          await prisma.fatura.updateMany({
            where: { external_reference: target2.external_reference },
            data: {
              status_fatura: 1,
              data_pagamento: new Date(),
            },
          });
        }
      }

      return NextResponse.json({ message: "OK" }, { status: 200 });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Erro ao consultar pagamento" },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      { error: "topic ou id inválido" },
      { status: 400 }
    );
  }
}
