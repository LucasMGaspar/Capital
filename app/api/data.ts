export interface Fatura {
    id_fatura: number;
    data_criacao: string;
    data_pagamento: string | null;
    valor_final: number;
    status_fatura: number;
    id_preferencia_pagamento: string;
    link_pagamento: string;
    external_reference: string;
  }
  
  export interface Pagamento {
    id_pagamento: number;
    data_cadastro: string;
    payment_id: string;
    payment_status: string;
    payment_method_id: string;
    payment_type_id: string;
    payment_status_detail: string;
    external_reference: string;
    status: number;
    merchant_order_id: string | null; // Adicionamos essa propriedade
  }
  
  export const faturas: Fatura[] = [];
  export const pagamentos: Pagamento[] = [];
  