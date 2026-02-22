"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceOrderStatus = exports.ServiceOrderDeadline = exports.ServiceOrderType = exports.UserRole = void 0;
exports.UserRole = {
    ADMIN: 'ADMIN',
    TECH: 'TECH'
};
exports.ServiceOrderType = {
    instalacao: 'instalacao',
    manutencao: 'manutencao',
    vistoria: 'vistoria',
    suporte: 'suporte'
};
exports.ServiceOrderDeadline = {
    sem_prazo: 'sem_prazo',
    D1_dia: 'D1_dia',
    D3_dias: 'D3_dias',
    D7_dias: 'D7_dias',
    D15_dias: 'D15_dias',
    D30_dias: 'D30_dias'
};
exports.ServiceOrderStatus = {
    OPEN: 'OPEN',
    IN_PROGRESS: 'IN_PROGRESS',
    DONE: 'DONE',
    CANCELED: 'CANCELED'
};
//# sourceMappingURL=enums.js.map