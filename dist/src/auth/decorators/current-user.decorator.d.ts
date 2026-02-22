export type CurrentUserPayload = {
    id: string;
    clerkUserId: string;
    role: 'ADMIN' | 'TECH';
    name?: string | null;
    isActive: boolean;
};
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
