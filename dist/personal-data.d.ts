/**
 * Conferência de dados pessoais digitados pelo próprio cliente (página pública
 * da captura por QR). Fica no pacote de tipos para a página e o servidor
 * aplicarem a MESMA regra — o que a página aceita, o servidor aceita.
 */
/** Só os dígitos do CPF. */
export declare function cpfDigits(value: string): string;
/**
 * Máscara progressiva `000.000.000-00` — serve tanto para o campo enquanto o
 * cliente digita quanto para o valor final gravado. Corta no 11º dígito.
 */
export declare function formatCpf(value: string): string;
/**
 * CPF existente: 11 dígitos, os dois verificadores batem (módulo 11) e não é
 * uma sequência repetida (`111.111.111-11` passa na conta, mas não existe).
 */
export declare function isValidCpf(value: string): boolean;
/**
 * Data de nascimento `AAAA-MM-DD` que existe no calendário (recusa 30/02),
 * de 1900 em diante e que não está no futuro. `today` só existe para teste.
 */
export declare function isValidBirthDate(value: string, today?: Date): boolean;
