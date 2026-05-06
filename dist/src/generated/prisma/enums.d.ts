export declare const UserRole: {
    readonly ADMIN: "ADMIN";
    readonly TECH: "TECH";
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export declare const ServiceOrderType: {
    readonly instalacao: "instalacao";
    readonly manutencao: "manutencao";
    readonly vistoria: "vistoria";
    readonly suporte: "suporte";
};
export type ServiceOrderType = (typeof ServiceOrderType)[keyof typeof ServiceOrderType];
export declare const ServiceOrderDeadline: {
    readonly sem_prazo: "sem_prazo";
    readonly D1_dia: "D1_dia";
    readonly D3_dias: "D3_dias";
    readonly D7_dias: "D7_dias";
    readonly D15_dias: "D15_dias";
    readonly D30_dias: "D30_dias";
};
export type ServiceOrderDeadline = (typeof ServiceOrderDeadline)[keyof typeof ServiceOrderDeadline];
export declare const ServiceOrderStatus: {
    readonly OPEN: "OPEN";
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly DONE: "DONE";
    readonly CANCELED: "CANCELED";
};
export type ServiceOrderStatus = (typeof ServiceOrderStatus)[keyof typeof ServiceOrderStatus];
