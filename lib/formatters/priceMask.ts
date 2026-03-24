/**
 * Utilitário para máscara de preço BRL em tempo real.
 * Transforma "1234" em "12,34" e "123456" em "1.234,56".
 */
export const formatBRLMask = (value: string): string => {
    // Remove tudo que não é número
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";

    // Converte para centavos (últimos 2 dígitos são decimais)
    const amount = (parseInt(digits, 10) / 100).toFixed(2);
    
    // Formata como BRL (sem o prefixo R$ para facilitar a edição interna do input)
    return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(amount));
};

/**
 * Converte a string formatada em BRL de volta para número.
 */
export const parseBRLToNumber = (value: string): number => {
    if (!value) return 0;
    // Remove separadores de milhar (.) e troca vírgula por ponto
    const normalized = value.replace(/\./g, "").replace(",", ".");
    return parseFloat(normalized) || 0;
};
