"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDefaultNotificationPreferences = buildDefaultNotificationPreferences;
const notifications_1 = require("./notifications");
/**
 * Preferências de notificação **de fábrica** (2026-08-17).
 *
 * Fonte única do que um usuário novo recebe. Consumida pelo backend na criação
 * do usuário (`UsersRepository.create`) e pela migração `2026-08-17-002`, que
 * grava a mesma lista nos canais sem lista dos usuários já existentes.
 *
 * `types` nasce EXPLÍCITO em todo canal — sino/push/som com a lista de fábrica,
 * e-mail/WhatsApp só com `OPT_IN_FACTORY_NOTIFICATION_TYPES` (hoje, o aviso de
 * créditos acabando).
 *
 * `enabled` é ligado em todos os canais. O WhatsApp nascia desligado até
 * 05/10/2026; passou a nascer ligado porque canal desligado barra TUDO, inclusive
 * o aviso de créditos, e a lista dele continua sendo a que decide o que sai —
 * com um tipo só marcado, só esse tipo é enviado.
 */
function buildDefaultNotificationPreferences() {
    return {
        email: { enabled: true, types: (0, notifications_1.getDefaultNotificationTypesForChannel)('email') },
        whatsapp: { enabled: true, types: (0, notifications_1.getDefaultNotificationTypesForChannel)('whatsapp') },
        push: { enabled: true, types: (0, notifications_1.getDefaultNotificationTypesForChannel)('push') },
        inApp: { enabled: true, types: (0, notifications_1.getDefaultNotificationTypesForChannel)('inApp') },
        sound: { enabled: true, types: (0, notifications_1.getDefaultNotificationTypesForChannel)('sound') },
    };
}
