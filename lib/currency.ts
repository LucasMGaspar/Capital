export type Currency = 'BRL' | 'USD';

/**
 * Converte uma string numérica com vírgulas para um número e multiplica pelo exchangeRate.
 * Em seguida, formata o valor para a moeda especificada.
 *
 * @param valueStr O valor como string a ser convertido e formatado.
 * @param exchangeRate A taxa de câmbio para conversão.
 * @param currency A moeda para a qual o valor deve ser formatado (BRL ou USD).
 * @returns Uma string formatada como a moeda especificada.
 */
export function formatCurrency(valueStr: string, exchangeRate: number, currency: Currency): string {
    // Remove pontos e substitui vírgulas por pontos para conversão correta
    const cleanedValueStr = valueStr.replace('.', '').replace(',', '.');
    const value = parseFloat(cleanedValueStr);

    if (isNaN(value)) {
        throw new Error('Valor inválido fornecido.');
    }

    let convertedValue = value;
    // Aplica a taxa de câmbio para conversão de BRL para USD
    if (currency === 'USD') {
        convertedValue = value / exchangeRate;
    }

    // Configurações de formatação de moeda
    let options: Intl.NumberFormatOptions;
    let locale: string;

    switch (currency) {
        case 'BRL':
            locale = 'pt-BR';
            options = {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            };
            break;
        case 'USD':
            locale = 'en-US';
            options = {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            };
            break;
        default:
            throw new Error('Moeda não suportada');
    }

    // Formata o valor convertido para a moeda especificada
    return new Intl.NumberFormat(locale, options).format(convertedValue);
}
