// /app/api/generate-po/route.ts

import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import nodemailer from "nodemailer";
import fs from 'fs';
import path from 'path';
import dotenv from "dotenv";

dotenv.config();

interface Item {
  description: string;
  value: string;
  qty: number;
  image: string;
}

interface ReqData {
  vessel: string;
  rfq: string;
  place: string;
  eta: string;
  etb: string;
  ets: string;
  requester: string;
  contact: string;
  items: Item[];
  portvalue: string;
  portpromo: string;
  value: number;
  days: string;
}

interface APIRequestBody {
  reqData: ReqData;
  actionType: "purchase" | "quote";
}

export async function POST(req: NextRequest) {
  try {
    const { reqData, actionType }: APIRequestBody = await req.json();

    // Validação básica
    if (!reqData || !actionType) {
      return NextResponse.json(
        { error: "Dados inválidos fornecidos." },
        { status: 400 }
      );
    }

    // Extrair informações do porto
    let shippingCost = 0;
    let shippingDays = "";
    if (reqData.portvalue) {
      const portValueParts = reqData.portvalue.split("|");
      if (portValueParts.length > 1) {
        shippingCost = parseFloat(portValueParts[1].replace("R$", "").trim());
        shippingDays = portValueParts[2].trim();
      }
    }

    // Ler o logotipo e converter para Base64
    const logoPath = path.join(process.cwd(), 'public', 'logo.png'); // Ajuste o caminho conforme necessário
    const logoData = fs.readFileSync(logoPath).toString('base64');
    const logoBase64 = `data:image/png;base64,${logoData}`;

    // Função para gerar o HTML com os dados fornecidos
    const generateHTML = (variables: ReqData, actionType: "purchase" | "quote") => {
      let subTotal = 0;

      // Gerar as linhas dos itens
      let itemRows = "";
      variables.items.forEach((item, index) => {
        const cleanPrice = item.value.replace("R$", "").replace(/\s/g, "").replace(",", ".");
        const unitValue = parseFloat(cleanPrice);
        const totalValue = unitValue * item.qty;
        subTotal += totalValue;
        itemRows += `
          <tr>
            <td>${index + 1}</td>
            <td>${item.description}</td>
            <td>R$ ${unitValue.toFixed(2)}</td>
            <td>${item.qty}</td>
            <td>R$ ${totalValue.toFixed(2)}</td>
          </tr>
        `;
      });

      // Aplica frete grátis se subtotal >= 1000
      if (subTotal >= 1000) {
        shippingCost = 0;
      }

      const totalValue = subTotal + shippingCost;

      // Definir o título com base no actionType
      const title = actionType === "quote" ? "ORÇAMENTO" : "ORDEM DE COMPRA";

      // Conteúdo HTML com a estrutura desejada
      let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            font-family: Arial, sans-serif;
          }
          body {
            margin: 0;
            padding: 0;
            color: #333;
          }
          .container {
            width: 100%;
            padding: 20px;
            box-sizing: border-box;
            border: 2px solid #000;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 15px;
            border-bottom: 2px solid #000;
          }
          .header img {
            max-width: 150px;
          }
          .header-info {
            text-align: right;
            font-size: 12px;
          }
          .header-info h2 {
            margin: 0;
          }
          h1 {
            color: #333;
            margin: 20px 0;
            text-align: center;
            text-decoration: underline;
          }
          .details {
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
            font-size: 14px;
          }
          .details-table {
            width: 100%;
            margin-bottom: 20px;
          }
          .details-table th, .details-table td {
            padding: 5px;
            border: 1px solid #333;
            text-align: left;
            font-size: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            padding: 8px;
            border: 1px solid #333;
            text-align: center;
            font-size: 12px;
          }
          th {
            background-color: #f0f0f0;
          }
          .total {
            font-weight: bold;
          }
          .remarks {
            margin-top: 20px;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoBase64}" alt="Logotipo da Empresa">
            <div class="header-info">
              <h2>NAVSUPPLY FORNECEDOR DE NAVIOS EIRELI</h2>
              <p>www.navsupply.com.br | brazil@navsupply.com.br</p>
              <p>+55 (27) 99948-5066 | +55 (27) 99952-2799 | +55 (27) 3019-3681</p>
              <p>Ship Chandler that you can trust</p>
              <p>Provisions | Deck | Engine | BA Charts & Publications | Safety Equipments</p>
            </div>
          </div>

          <h1>${title}</h1>

          <div class="details">
            <table class="details-table">
              <tr>
                <th>Vessel:</th>
                <td colspan="3">${variables.vessel}</td>
                <th>Requester:</th>
                <td>${variables.requester}</td>
              </tr>
              <tr>
                <th>RFQ:</th>
                <td>${variables.rfq}</td>
                <th>Contact:</th>
                <td>${variables.contact}</td>
                <th>Place:</th>
                <td>${variables.place}</td>
              </tr>
              <tr>
                <th>ETA:</th>
                <td>${variables.eta}</td>
                <th>ETB:</th>
                <td>${variables.etb}</td>
                <th>ETS:</th>
                <td>${variables.ets}</td>
              </tr>
              <tr>
                <th>Port:</th>
                <td colspan="3">${variables.portvalue.split('|')[0]}</td>
                <th>Shipping Cost:</th>
                <td>R$ ${shippingCost.toFixed(2)}</td>
              </tr>
              <tr>
                <th>Total Value:</th>
                <td colspan="5">R$ ${totalValue.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Description</th>
                <th>Unit Value (BRL)</th>
                <th>Qty</th>
                <th>Total Value (BRL)</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" class="total">Subtotal</td>
                <td class="total">R$ ${subTotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="4" class="total">Frete</td>
                <td class="total">R$ ${shippingCost.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="4" class="total">Total</td>
                <td class="total">R$ ${totalValue.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div class="remarks">
            <p><strong>GENERAL REMARKS:</strong></p>
            <p>After receipt of the purchase order, these products will be purchased specifically for your vessel, therefore we cannot accept their return.</p>
            <p>Delivery time: up to ${shippingDays} workdays after confirmation.</p>
            <p>Proposal valid for CREDIT payment.</p>
            <p>The above value does not consider barge/boat hire costs if necessary.</p>
            <p>Proposal valid for 7 days.</p>
          </div>
        </div>
      </body>
      </html>
      `;

      return htmlContent;
    };

    // Gerar o HTML e o PDF
    const htmlContent = generateHTML(reqData, actionType);
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Definir tamanho da página e margens personalizadas
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "10mm", right: "10mm" },
    });
    await browser.close();

    // Configurar o Nodemailer para enviar o email com o PDF
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "store@navsupply.com.br", // substitua pelo seu email
        pass: "dage zqga fdsi koze", 
      },
    });

    const emailSubject = actionType === "quote" 
      ? "Seu Orçamento foi gerado com sucesso" 
      : "Sua Ordem de Compra foi gerada com sucesso";

    const attachmentFilename = actionType === "quote" 
      ? "Orçamento.pdf" 
      : "OrdemDeCompra.pdf";

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: reqData.contact, // Email do usuário
      cc: process.env.EMAIL_USER,
      subject: emailSubject,
      html: actionType === "quote" 
        ? `<p>Olá,</p><p>Seu Orçamento foi gerado com sucesso. Você pode baixá-lo no anexo abaixo.</p>` 
        : `<p>Olá,</p><p>Sua Ordem de Compra foi gerada com sucesso. Você pode baixá-la no anexo abaixo.</p>`,
      attachments: [
        {
          filename: attachmentFilename,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    // Responder com o PDF diretamente como buffer
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${attachmentFilename}`,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar o PDF:", error);
    return NextResponse.json(
      { error: "Erro ao gerar o PDF" },
      { status: 500 }
    );
  }
}
