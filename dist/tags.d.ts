import type { ActiveStatus } from './common';
/**
 * Catálogo de tags do tenant — collection `tags`.
 *
 * ## Por que existe
 *
 * Até 22/09/2026 não havia catálogo: a lista de tags "disponíveis" era um
 * `distinct('tags')` na collection `contacts`. Consequências medidas em
 * produção no dia da mudança (47 tenants, 1.259 tags):
 *
 * - **Não dava para cadastrar uma tag sem marcar um contato.** O gestor que
 *   quisesse preparar o vocabulário antes de operar não tinha caminho.
 * - **O agente de IA ficava SEM a ferramenta `add_tags`** em tenant sem
 *   nenhuma tag: `buildAddTagsInputSchema` devolvia `null` e
 *   `selectAvailableTools` removia a tool. Empresa nova = agente que não
 *   marca ninguém, sem nada que o gestor pudesse fazer a respeito.
 * - **85 tags (6,7%) existiam em duas ou três grafias ao mesmo tempo** —
 *   `"Casa"`/`"casa"`, `"Valéria"`/`"Valeria"`/`"Váleria"`,
 *   `"Rio de Janeiro/RJ"` em quatro variações. Três escritores com regras
 *   diferentes: o agente forçava minúscula, o workflow e a tela só faziam
 *   `trim()`. O dropdown mostrava as duas e o filtro `$in` achava só uma.
 *
 * ## O relacionamento é pela PALAVRA
 *
 * Não existe `tagId` em lugar nenhum: `contacts.tags`, `tickets.tags`,
 * `customers.tags` e `conversations.tags` continuam sendo `string[]`, e é o
 * `name` desta collection que os liga ao catálogo. Foi decisão consciente —
 * evita migrar quatro collections, preserva os índices multikey existentes
 * (`idx_contacts_tenant_tags`, `leads_tags_idx`) e mantém todo filtro `$in`
 * funcionando sem uma linha de mudança.
 *
 * O preço disso é que **quem escreve tem que canonizar**: aplicar uma tag
 * passa por `ITagsRegistrar.ensureTags`, que devolve a forma canônica do
 * catálogo e é ESSA que a entidade grava. Sem isso o auto-cadastro só
 * empurraria o problema de grafia para frente.
 */
export interface Tag {
    _id?: string;
    appId: string;
    companyId: string;
    /** Forma de exibição, como foi cadastrada: `"Cliente VIP"`. É o valor gravado nas entidades. */
    name: string;
    /**
     * Chave de unicidade — `normalizeTagName(name)`. Nunca exibida.
     *
     * O índice único parcial `(appId, companyId, normalizedName)` usa
     * `partialFilterExpression: { normalizedName: { $type: 'string' }, deletedAt: null }`.
     * O `deletedAt: null` casa tanto o campo AUSENTE quanto o nulo, e o soft
     * delete do projeto nunca grava `null` — então tag excluída sai do índice e
     * o nome fica livre para recadastro. Mesmo molde de `units`/`unit-users`.
     */
    normalizedName: string;
    /** Cor sólida em hex (`#8B5CF6`). O chip deriva o fundo com alpha. */
    color: string;
    description?: string;
    /**
     * `manual` = alguém cadastrou na tela. `auto` = nasceu de uma escrita
     * (workflow, API, importação) que citou uma palavra inédita.
     *
     * Existe para a tela de gestão oferecer o filtro "cadastradas
     * automaticamente" — sem ele o auto-cadastro vira uma lista que só cresce e
     * ninguém revisa. O agente de IA NÃO produz `auto`: ele segue restrito às
     * tags que já existem (decisão do dono em 22/09/2026).
     */
    origin: TagOrigin;
    status: ActiveStatus;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}
export type TagOrigin = 'manual' | 'auto';
export interface TagResponse extends Omit<Tag, '_id' | 'normalizedName'> {
    id: string;
    /**
     * Quantas entidades usam a tag hoje. Só vem preenchido em
     * `GET /api/tags?withUsage=true` (tela de gestão) — é um agregado sobre
     * quatro collections e não se paga no dropdown.
     *
     * Deliberadamente NÃO é contador denormalizado no documento: contador que
     * se atualiza por `$inc` deriva silenciosamente, e aqui ele só serve para
     * a pessoa decidir se pode excluir a tag.
     */
    usageCount?: number;
}
/** Payload mínimo do dropdown — o que toda tela precisa para desenhar um chip. */
export interface TagOption {
    id: string;
    name: string;
    color: string;
}
export interface CreateTagRequest {
    name: string;
    /** Hex `#RRGGBB`. Omitido → cor determinística por `pickTagColor(name)`. */
    color?: string;
    description?: string;
}
/** `null` em `description` = LIMPAR (vira `$unset`); chave ausente = "não mexer". */
export interface UpdateTagRequest {
    /**
     * Renomear faz CASCATA nas quatro collections que guardam a palavra.
     * É a operação cara do módulo — por isso ela vive só aqui, e não em nenhum
     * caminho automático.
     */
    name?: string;
    color?: string;
    description?: string | null;
    status?: ActiveStatus;
}
export type TagSortField = 'name' | 'usageCount' | 'createdAt' | 'updatedAt';
export interface TagQuery {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: TagSortField;
    sortOrder?: 'asc' | 'desc';
    /** Só na tela de gestão — agrega o uso nas quatro collections. */
    withUsage?: boolean;
    filters?: {
        status?: ActiveStatus;
        origin?: TagOrigin;
    };
}
/** Entidades que compartilham o catálogo. `databases` (produto/imóvel/artigo) fica de fora. */
export type TagEntityKind = 'contact' | 'ticket' | 'customer' | 'conversation';
/** Collections correspondentes, na ordem em que a cascata e a contagem as percorrem. */
export declare const TAG_ENTITY_COLLECTIONS: Readonly<Record<TagEntityKind, string>>;
/** Resultado de uma renomeação com cascata — o que a tela mostra de volta. */
export interface TagRenameResult {
    tag: TagResponse;
    /** Documentos tocados por entidade. Zero em todas = a tag existia só no catálogo. */
    updated: Record<TagEntityKind, number>;
}
/** O que `DELETE /api/tags/:id?purge=true` devolve. */
export interface TagDeleteResult {
    deleted: true;
    /** Só preenchido com `purge=true`; sem purga a palavra continua nas entidades. */
    purged?: Record<TagEntityKind, number>;
}
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
export declare const normalizeTagName: (raw: string) => string;
/**
 * Paleta do seletor de cor e do sorteio determinístico.
 *
 * São os mesmos dez tons que o drawer "Gerenciar Tags" já usava via classes
 * Tailwind (`*-100`/`*-700`), agora em hex do tom 700. Manter a paleta e o
 * hash idênticos é o que faz ninguém ver as cores trocarem de lugar no dia em
 * que o catálogo entrou.
 */
export declare const TAG_COLOR_PALETTE: readonly string[];
/**
 * Cor determinística a partir do nome — usada quando ninguém escolheu uma.
 *
 * Hash portado VERBATIM do `getTagColor` do antigo `TagsDialog.tsx`
 * (`hash = charCodeAt(i) + ((hash << 5) - hash)`, depois `Math.abs(hash) %
 * length`), com a paleta na mesma ordem. É isso que preserva a cor de cada
 * tag já existente ao migrar.
 */
export declare const pickTagColor: (name: string) => string;
/** `true` para `#RRGGBB`. O Zod do backend usa a mesma regra. */
export declare const isValidTagColor: (value: string) => boolean;
