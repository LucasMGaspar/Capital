"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_KEY_CONTACT);

type EmailProps = {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export const sendEmail = async (data: EmailProps) => {
    await resend.emails.send({
        to: "store@navsupply.com.br",
        from:"NAVSUPPLY E-COMMERCE <onboarding@navecommerce.com.br>",
        subject: data.subject,
        html: `<div style="display: grid; justify-content: center; align-items: center; border: 4px solid #cf964d; background: #19254A; padding: 20px 50px; position: relative;">
         <h1 style="color: #cf964d; margin-bottom: 15px;">NavSupply E-commerce Contact</h1>
         <h3 style="color: #cf964d;">Name</h3>
         <p style="color: #EFEFEF;">${data.name}</p>
         <h3 style="color: #cf964d;">Email</h3>
         <p style="color: #EFEFEF;"><a href="mailto:${data.email}" style="text-decoration: none; color: #EFEFEF;">${data.email}</a></p>
         <h3 style="color: #cf964d;">Subject</h3>
         <p style="color: #EFEFEF; font-weight: 600;">${data.subject}</p>
         <h3 style="color: #cf964d;">Message</h3>
         <p style="color: #EFEFEF;">${data.message}</p>
       </div>`
    })
}
