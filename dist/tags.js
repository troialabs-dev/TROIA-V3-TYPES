"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidTagColor = exports.pickTagColor = exports.TAG_COLOR_PALETTE = exports.normalizeTagName = exports.TAG_ENTITY_COLLECTIONS = void 0;
/** Collections correspondentes, na ordem em que a cascata e a contagem as percorrem. */
exports.TAG_ENTITY_COLLECTIONS = Object.freeze({
    contact: 'contacts',
    ticket: 'tickets',
    customer: 'customers',
    conversation: 'conversations',
});
// ============================================================================
// Normalização — a MESMA função no backend, no frontend e na migração
// ============================================================================
/**
 * Chave canônica de uma tag: dobra acento, colapsa espaço, remove pontas,
 * minúscula.
 *
 * `"  Não   Respondeu "` → `"nao respondeu"`
 *
 * **Por que dobrar acento.** Era um ponto de decisão até a medição em
 * produção responder: `"Valéria"`(117) vs `"Valeria"`(4) vs `"Váleria"`(1),
 * `"Brasília/DF"` vs `"Brasilia/DF"`, `"Goiânia/GO"` vs `"Goiania/GO"`,
 * `"Vista Atlântico"` vs `"Vista Atlantico"` vs `"VISTA ATLANTICO"`,
 * `"Condomínio"` vs `"condominio"`. Sem dobrar, esses pares sobreviveriam
 * como tags distintas — que é exatamente o defeito que o catálogo existe
 * para acabar.
 *
 * O acento nunca se perde na tela: quem exibe é `name`, não esta chave.
 *
 * **Devolve `''` para entrada sem letra nem dígito** (`"   "`, `"···"`,
 * `"---"`, só emoji). Uma tag existe para ser buscada e comparada, e uma
 * string sem nenhuma palavra não tem chave que a represente. Isso importa
 * para além da estética: `''` entraria no índice único parcial (que filtra
 * por `normalizedName: { $type: 'string' }`) e a SEGUNDA tag degenerada
 * colidiria com a primeira — erro de duplicidade num nome que o usuário nem
 * reconhece. Com `''` aqui, o Zod recusa na entrada e o registrar descarta em
 * silêncio, cada um no seu papel.
 */
const normalizeTagName = (raw) => {
    const normalized = String(raw)
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
    return /[\p{L}\p{N}]/u.test(normalized) ? normalized : '';
};
exports.normalizeTagName = normalizeTagName;
// ============================================================================
// Cores
// ============================================================================
/**
 * Paleta do seletor de cor e do sorteio determinístico.
 *
 * São os mesmos dez tons que o drawer "Gerenciar Tags" já usava via classes
 * Tailwind (`*-100`/`*-700`), agora em hex do tom 700. Manter a paleta e o
 * hash idênticos é o que faz ninguém ver as cores trocarem de lugar no dia em
 * que o catálogo entrou.
 */
exports.TAG_COLOR_PALETTE = Object.freeze([
    '#7E22CE', // purple-700
    '#1D4ED8', // blue-700
    '#15803D', // green-700
    '#A16207', // yellow-700
    '#B91C1C', // red-700
    '#BE185D', // pink-700
    '#4338CA', // indigo-700
    '#0E7490', // cyan-700
    '#C2410C', // orange-700
    '#0F766E', // teal-700
]);
/**
 * Cor determinística a partir do nome — usada quando ninguém escolheu uma.
 *
 * Hash portado VERBATIM do `getTagColor` do antigo `TagsDialog.tsx`
 * (`hash = charCodeAt(i) + ((hash << 5) - hash)`, depois `Math.abs(hash) %
 * length`), com a paleta na mesma ordem. É isso que preserva a cor de cada
 * tag já existente ao migrar.
 */
const pickTagColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % exports.TAG_COLOR_PALETTE.length;
    return exports.TAG_COLOR_PALETTE[index];
};
exports.pickTagColor = pickTagColor;
/** `true` para `#RRGGBB`. O Zod do backend usa a mesma regra. */
const isValidTagColor = (value) => /^#[0-9a-fA-F]{6}$/.test(value);
exports.isValidTagColor = isValidTagColor;
