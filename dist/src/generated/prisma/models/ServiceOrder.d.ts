import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ServiceOrderModel = runtime.Types.Result.DefaultSelection<Prisma.$ServiceOrderPayload>;
export type AggregateServiceOrder = {
    _count: ServiceOrderCountAggregateOutputType | null;
    _avg: ServiceOrderAvgAggregateOutputType | null;
    _sum: ServiceOrderSumAggregateOutputType | null;
    _min: ServiceOrderMinAggregateOutputType | null;
    _max: ServiceOrderMaxAggregateOutputType | null;
};
export type ServiceOrderAvgAggregateOutputType = {
    durationMinutes: number | null;
};
export type ServiceOrderSumAggregateOutputType = {
    durationMinutes: number | null;
};
export type ServiceOrderMinAggregateOutputType = {
    id: string | null;
    identifier: string | null;
    osType: $Enums.ServiceOrderType | null;
    deadline: $Enums.ServiceOrderDeadline | null;
    customer: string | null;
    description: string | null;
    durationMinutes: number | null;
    scheduleAt: Date | null;
    scheduleTimeText: string | null;
    collaborator: string | null;
    address: string | null;
    status: $Enums.ServiceOrderStatus | null;
    createdById: string | null;
    assignedToId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ServiceOrderMaxAggregateOutputType = {
    id: string | null;
    identifier: string | null;
    osType: $Enums.ServiceOrderType | null;
    deadline: $Enums.ServiceOrderDeadline | null;
    customer: string | null;
    description: string | null;
    durationMinutes: number | null;
    scheduleAt: Date | null;
    scheduleTimeText: string | null;
    collaborator: string | null;
    address: string | null;
    status: $Enums.ServiceOrderStatus | null;
    createdById: string | null;
    assignedToId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ServiceOrderCountAggregateOutputType = {
    id: number;
    identifier: number;
    osType: number;
    deadline: number;
    customer: number;
    description: number;
    durationMinutes: number;
    scheduleAt: number;
    scheduleTimeText: number;
    collaborator: number;
    address: number;
    status: number;
    createdById: number;
    assignedToId: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type ServiceOrderAvgAggregateInputType = {
    durationMinutes?: true;
};
export type ServiceOrderSumAggregateInputType = {
    durationMinutes?: true;
};
export type ServiceOrderMinAggregateInputType = {
    id?: true;
    identifier?: true;
    osType?: true;
    deadline?: true;
    customer?: true;
    description?: true;
    durationMinutes?: true;
    scheduleAt?: true;
    scheduleTimeText?: true;
    collaborator?: true;
    address?: true;
    status?: true;
    createdById?: true;
    assignedToId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ServiceOrderMaxAggregateInputType = {
    id?: true;
    identifier?: true;
    osType?: true;
    deadline?: true;
    customer?: true;
    description?: true;
    durationMinutes?: true;
    scheduleAt?: true;
    scheduleTimeText?: true;
    collaborator?: true;
    address?: true;
    status?: true;
    createdById?: true;
    assignedToId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ServiceOrderCountAggregateInputType = {
    id?: true;
    identifier?: true;
    osType?: true;
    deadline?: true;
    customer?: true;
    description?: true;
    durationMinutes?: true;
    scheduleAt?: true;
    scheduleTimeText?: true;
    collaborator?: true;
    address?: true;
    status?: true;
    createdById?: true;
    assignedToId?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type ServiceOrderAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ServiceOrderWhereInput;
    orderBy?: Prisma.ServiceOrderOrderByWithRelationInput | Prisma.ServiceOrderOrderByWithRelationInput[];
    cursor?: Prisma.ServiceOrderWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ServiceOrderCountAggregateInputType;
    _avg?: ServiceOrderAvgAggregateInputType;
    _sum?: ServiceOrderSumAggregateInputType;
    _min?: ServiceOrderMinAggregateInputType;
    _max?: ServiceOrderMaxAggregateInputType;
};
export type GetServiceOrderAggregateType<T extends ServiceOrderAggregateArgs> = {
    [P in keyof T & keyof AggregateServiceOrder]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateServiceOrder[P]> : Prisma.GetScalarType<T[P], AggregateServiceOrder[P]>;
};
export type ServiceOrderGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ServiceOrderWhereInput;
    orderBy?: Prisma.ServiceOrderOrderByWithAggregationInput | Prisma.ServiceOrderOrderByWithAggregationInput[];
    by: Prisma.ServiceOrderScalarFieldEnum[] | Prisma.ServiceOrderScalarFieldEnum;
    having?: Prisma.ServiceOrderScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ServiceOrderCountAggregateInputType | true;
    _avg?: ServiceOrderAvgAggregateInputType;
    _sum?: ServiceOrderSumAggregateInputType;
    _min?: ServiceOrderMinAggregateInputType;
    _max?: ServiceOrderMaxAggregateInputType;
};
export type ServiceOrderGroupByOutputType = {
    id: string;
    identifier: string | null;
    osType: $Enums.ServiceOrderType;
    deadline: $Enums.ServiceOrderDeadline | null;
    customer: string;
    description: string;
    durationMinutes: number;
    scheduleAt: Date;
    scheduleTimeText: string | null;
    collaborator: string | null;
    address: string | null;
    status: $Enums.ServiceOrderStatus;
    createdById: string;
    assignedToId: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: ServiceOrderCountAggregateOutputType | null;
    _avg: ServiceOrderAvgAggregateOutputType | null;
    _sum: ServiceOrderSumAggregateOutputType | null;
    _min: ServiceOrderMinAggregateOutputType | null;
    _max: ServiceOrderMaxAggregateOutputType | null;
};
type GetServiceOrderGroupByPayload<T extends ServiceOrderGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ServiceOrderGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ServiceOrderGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ServiceOrderGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ServiceOrderGroupByOutputType[P]>;
}>>;
export type ServiceOrderWhereInput = {
    AND?: Prisma.ServiceOrderWhereInput | Prisma.ServiceOrderWhereInput[];
    OR?: Prisma.ServiceOrderWhereInput[];
    NOT?: Prisma.ServiceOrderWhereInput | Prisma.ServiceOrderWhereInput[];
    id?: Prisma.StringFilter<"ServiceOrder"> | string;
    identifier?: Prisma.StringNullableFilter<"ServiceOrder"> | string | null;
    osType?: Prisma.EnumServiceOrderTypeFilter<"ServiceOrder"> | $Enums.ServiceOrderType;
    deadline?: Prisma.EnumServiceOrderDeadlineNullableFilter<"ServiceOrder"> | $Enums.ServiceOrderDeadline | null;
    customer?: Prisma.StringFilter<"ServiceOrder"> | string;
    description?: Prisma.StringFilter<"ServiceOrder"> | string;
    durationMinutes?: Prisma.IntFilter<"ServiceOrder"> | number;
    scheduleAt?: Prisma.DateTimeFilter<"ServiceOrder"> | Date | string;
    scheduleTimeText?: Prisma.StringNullableFilter<"ServiceOrder"> | string | null;
    collaborator?: Prisma.StringNullableFilter<"ServiceOrder"> | string | null;
    address?: Prisma.StringNullableFilter<"ServiceOrder"> | string | null;
    status?: Prisma.EnumServiceOrderStatusFilter<"ServiceOrder"> | $Enums.ServiceOrderStatus;
    createdById?: Prisma.StringFilter<"ServiceOrder"> | string;
    assignedToId?: Prisma.StringNullableFilter<"ServiceOrder"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"ServiceOrder"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ServiceOrder"> | Date | string;
    createdBy?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    assignedTo?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
};
export type ServiceOrderOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    identifier?: Prisma.SortOrderInput | Prisma.SortOrder;
    osType?: Prisma.SortOrder;
    deadline?: Prisma.SortOrderInput | Prisma.SortOrder;
    customer?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    durationMinutes?: Prisma.SortOrder;
    scheduleAt?: Prisma.SortOrder;
    scheduleTimeText?: Prisma.SortOrderInput | Prisma.SortOrder;
    collaborator?: Prisma.SortOrderInput | Prisma.SortOrder;
    address?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    assignedToId?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    createdBy?: Prisma.UserOrderByWithRelationInput;
    assignedTo?: Prisma.UserOrderByWithRelationInput;
};
export type ServiceOrderWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    identifier?: string;
    AND?: Prisma.ServiceOrderWhereInput | Prisma.ServiceOrderWhereInput[];
    OR?: Prisma.ServiceOrderWhereInput[];
    NOT?: Prisma.ServiceOrderWhereInput | Prisma.ServiceOrderWhereInput[];
    osType?: Prisma.EnumServiceOrderTypeFilter<"ServiceOrder"> | $Enums.ServiceOrderType;
    deadline?: Prisma.EnumServiceOrderDeadlineNullableFilter<"ServiceOrder"> | $Enums.ServiceOrderDeadline | null;
    customer?: Prisma.StringFilter<"ServiceOrder"> | string;
    description?: Prisma.StringFilter<"ServiceOrder"> | string;
    durationMinutes?: Prisma.IntFilter<"ServiceOrder"> | number;
    scheduleAt?: Prisma.DateTimeFilter<"ServiceOrder"> | Date | string;
    scheduleTimeText?: Prisma.StringNullableFilter<"ServiceOrder"> | string | null;
    collaborator?: Prisma.StringNullableFilter<"ServiceOrder"> | string | null;
    address?: Prisma.StringNullableFilter<"ServiceOrder"> | string | null;
    status?: Prisma.EnumServiceOrderStatusFilter<"ServiceOrder"> | $Enums.ServiceOrderStatus;
    createdById?: Prisma.StringFilter<"ServiceOrder"> | string;
    assignedToId?: Prisma.StringNullableFilter<"ServiceOrder"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"ServiceOrder"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ServiceOrder"> | Date | string;
    createdBy?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    assignedTo?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
}, "id" | "identifier">;
export type ServiceOrderOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    identifier?: Prisma.SortOrderInput | Prisma.SortOrder;
    osType?: Prisma.SortOrder;
    deadline?: Prisma.SortOrderInput | Prisma.SortOrder;
    customer?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    durationMinutes?: Prisma.SortOrder;
    scheduleAt?: Prisma.SortOrder;
    scheduleTimeText?: Prisma.SortOrderInput | Prisma.SortOrder;
    collaborator?: Prisma.SortOrderInput | Prisma.SortOrder;
    address?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    assignedToId?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.ServiceOrderCountOrderByAggregateInput;
    _avg?: Prisma.ServiceOrderAvgOrderByAggregateInput;
    _max?: Prisma.ServiceOrderMaxOrderByAggregateInput;
    _min?: Prisma.ServiceOrderMinOrderByAggregateInput;
    _sum?: Prisma.ServiceOrderSumOrderByAggregateInput;
};
export type ServiceOrderScalarWhereWithAggregatesInput = {
    AND?: Prisma.ServiceOrderScalarWhereWithAggregatesInput | Prisma.ServiceOrderScalarWhereWithAggregatesInput[];
    OR?: Prisma.ServiceOrderScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ServiceOrderScalarWhereWithAggregatesInput | Prisma.ServiceOrderScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"ServiceOrder"> | string;
    identifier?: Prisma.StringNullableWithAggregatesFilter<"ServiceOrder"> | string | null;
    osType?: Prisma.EnumServiceOrderTypeWithAggregatesFilter<"ServiceOrder"> | $Enums.ServiceOrderType;
    deadline?: Prisma.EnumServiceOrderDeadlineNullableWithAggregatesFilter<"ServiceOrder"> | $Enums.ServiceOrderDeadline | null;
    customer?: Prisma.StringWithAggregatesFilter<"ServiceOrder"> | string;
    description?: Prisma.StringWithAggregatesFilter<"ServiceOrder"> | string;
    durationMinutes?: Prisma.IntWithAggregatesFilter<"ServiceOrder"> | number;
    scheduleAt?: Prisma.DateTimeWithAggregatesFilter<"ServiceOrder"> | Date | string;
    scheduleTimeText?: Prisma.StringNullableWithAggregatesFilter<"ServiceOrder"> | string | null;
    collaborator?: Prisma.StringNullableWithAggregatesFilter<"ServiceOrder"> | string | null;
    address?: Prisma.StringNullableWithAggregatesFilter<"ServiceOrder"> | string | null;
    status?: Prisma.EnumServiceOrderStatusWithAggregatesFilter<"ServiceOrder"> | $Enums.ServiceOrderStatus;
    createdById?: Prisma.StringWithAggregatesFilter<"ServiceOrder"> | string;
    assignedToId?: Prisma.StringNullableWithAggregatesFilter<"ServiceOrder"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"ServiceOrder"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"ServiceOrder"> | Date | string;
};
export type ServiceOrderCreateInput = {
    id?: string;
    identifier?: string | null;
    osType: $Enums.ServiceOrderType;
    deadline?: $Enums.ServiceOrderDeadline | null;
    customer: string;
    description: string;
    durationMinutes: number;
    scheduleAt: Date | string;
    scheduleTimeText?: string | null;
    collaborator?: string | null;
    address?: string | null;
    status?: $Enums.ServiceOrderStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    createdBy: Prisma.UserCreateNestedOneWithoutCreatedOrdersInput;
    assignedTo?: Prisma.UserCreateNestedOneWithoutAssignedOrdersInput;
};
export type ServiceOrderUncheckedCreateInput = {
    id?: string;
    identifier?: string | null;
    osType: $Enums.ServiceOrderType;
    deadline?: $Enums.ServiceOrderDeadline | null;
    customer: string;
    description: string;
    durationMinutes: number;
    scheduleAt: Date | string;
    scheduleTimeText?: string | null;
    collaborator?: string | null;
    address?: string | null;
    status?: $Enums.ServiceOrderStatus;
    createdById: string;
    assignedToId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ServiceOrderUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    identifier?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    osType?: Prisma.EnumServiceOrderTypeFieldUpdateOperationsInput | $Enums.ServiceOrderType;
    deadline?: Prisma.NullableEnumServiceOrderDeadlineFieldUpdateOperationsInput | $Enums.ServiceOrderDeadline | null;
    customer?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    durationMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    scheduleAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scheduleTimeText?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collaborator?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    address?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumServiceOrderStatusFieldUpdateOperationsInput | $Enums.ServiceOrderStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdBy?: Prisma.UserUpdateOneRequiredWithoutCreatedOrdersNestedInput;
    assignedTo?: Prisma.UserUpdateOneWithoutAssignedOrdersNestedInput;
};
export type ServiceOrderUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    identifier?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    osType?: Prisma.EnumServiceOrderTypeFieldUpdateOperationsInput | $Enums.ServiceOrderType;
    deadline?: Prisma.NullableEnumServiceOrderDeadlineFieldUpdateOperationsInput | $Enums.ServiceOrderDeadline | null;
    customer?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    durationMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    scheduleAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scheduleTimeText?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collaborator?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    address?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumServiceOrderStatusFieldUpdateOperationsInput | $Enums.ServiceOrderStatus;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedToId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ServiceOrderCreateManyInput = {
    id?: string;
    identifier?: string | null;
    osType: $Enums.ServiceOrderType;
    deadline?: $Enums.ServiceOrderDeadline | null;
    customer: string;
    description: string;
    durationMinutes: number;
    scheduleAt: Date | string;
    scheduleTimeText?: string | null;
    collaborator?: string | null;
    address?: string | null;
    status?: $Enums.ServiceOrderStatus;
    createdById: string;
    assignedToId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ServiceOrderUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    identifier?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    osType?: Prisma.EnumServiceOrderTypeFieldUpdateOperationsInput | $Enums.ServiceOrderType;
    deadline?: Prisma.NullableEnumServiceOrderDeadlineFieldUpdateOperationsInput | $Enums.ServiceOrderDeadline | null;
    customer?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    durationMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    scheduleAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scheduleTimeText?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collaborator?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    address?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumServiceOrderStatusFieldUpdateOperationsInput | $Enums.ServiceOrderStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ServiceOrderUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    identifier?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    osType?: Prisma.EnumServiceOrderTypeFieldUpdateOperationsInput | $Enums.ServiceOrderType;
    deadline?: Prisma.NullableEnumServiceOrderDeadlineFieldUpdateOperationsInput | $Enums.ServiceOrderDeadline | null;
    customer?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    durationMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    scheduleAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scheduleTimeText?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collaborator?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    address?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumServiceOrderStatusFieldUpdateOperationsInput | $Enums.ServiceOrderStatus;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    assignedToId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ServiceOrderListRelationFilter = {
    every?: Prisma.ServiceOrderWhereInput;
    some?: Prisma.ServiceOrderWhereInput;
    none?: Prisma.ServiceOrderWhereInput;
};
export type ServiceOrderOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ServiceOrderCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    identifier?: Prisma.SortOrder;
    osType?: Prisma.SortOrder;
    deadline?: Prisma.SortOrder;
    customer?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    durationMinutes?: Prisma.SortOrder;
    scheduleAt?: Prisma.SortOrder;
    scheduleTimeText?: Prisma.SortOrder;
    collaborator?: Prisma.SortOrder;
    address?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    assignedToId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ServiceOrderAvgOrderByAggregateInput = {
    durationMinutes?: Prisma.SortOrder;
};
export type ServiceOrderMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    identifier?: Prisma.SortOrder;
    osType?: Prisma.SortOrder;
    deadline?: Prisma.SortOrder;
    customer?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    durationMinutes?: Prisma.SortOrder;
    scheduleAt?: Prisma.SortOrder;
    scheduleTimeText?: Prisma.SortOrder;
    collaborator?: Prisma.SortOrder;
    address?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    assignedToId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ServiceOrderMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    identifier?: Prisma.SortOrder;
    osType?: Prisma.SortOrder;
    deadline?: Prisma.SortOrder;
    customer?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    durationMinutes?: Prisma.SortOrder;
    scheduleAt?: Prisma.SortOrder;
    scheduleTimeText?: Prisma.SortOrder;
    collaborator?: Prisma.SortOrder;
    address?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    assignedToId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ServiceOrderSumOrderByAggregateInput = {
    durationMinutes?: Prisma.SortOrder;
};
export type ServiceOrderCreateNestedManyWithoutCreatedByInput = {
    create?: Prisma.XOR<Prisma.ServiceOrderCreateWithoutCreatedByInput, Prisma.ServiceOrderUncheckedCreateWithoutCreatedByInput> | Prisma.ServiceOrderCreateWithoutCreatedByInput[] | Prisma.ServiceOrderUncheckedCreateWithoutCreatedByInput[];
    connectOrCreate?: Prisma.ServiceOrderCreateOrConnectWithoutCreatedByInput | Prisma.ServiceOrderCreateOrConnectWithoutCreatedByInput[];
    createMany?: Prisma.ServiceOrderCreateManyCreatedByInputEnvelope;
    connect?: Prisma.ServiceOrderWhereUniqueInput | Prisma.ServiceOrderWhereUniqueInput[];
};
export type ServiceOrderCreateNestedManyWithoutAssignedToInput = {
    create?: Prisma.XOR<Prisma.ServiceOrderCreateWithoutAssignedToInput, Prisma.ServiceOrderUncheckedCreateWithoutAssignedToInput> | Prisma.ServiceOrderCreateWithoutAssignedToInput[] | Prisma.ServiceOrderUncheckedCreateWithoutAssignedToInput[];
    connectOrCreate?: Prisma.ServiceOrderCreateOrConnectWithoutAssignedToInput | Prisma.ServiceOrderCreateOrConnectWithoutAssignedToInput[];
    createMany?: Prisma.ServiceOrderCreateManyAssignedToInputEnvelope;
    connect?: Prisma.ServiceOrderWhereUniqueInput | Prisma.ServiceOrderWhereUniqueInput[];
};
export type ServiceOrderUncheckedCreateNestedManyWithoutCreatedByInput = {
    create?: Prisma.XOR<Prisma.ServiceOrderCreateWithoutCreatedByInput, Prisma.ServiceOrderUncheckedCreateWithoutCreatedByInput> | Prisma.ServiceOrderCreateWithoutCreatedByInput[] | Prisma.ServiceOrderUncheckedCreateWithoutCreatedByInput[];
    connectOrCreate?: Prisma.ServiceOrderCreateOrConnectWithoutCreatedByInput | Prisma.ServiceOrderCreateOrConnectWithoutCreatedByInput[];
    createMany?: Prisma.ServiceOrderCreateManyCreatedByInputEnvelope;
    connect?: Prisma.ServiceOrderWhereUniqueInput | Prisma.ServiceOrderWhereUniqueInput[];
};
export type ServiceOrderUncheckedCreateNestedManyWithoutAssignedToInput = {
    create?: Prisma.XOR<Prisma.ServiceOrderCreateWithoutAssignedToInput, Prisma.ServiceOrderUncheckedCreateWithoutAssignedToInput> | Prisma.ServiceOrderCreateWithoutAssignedToInput[] | Prisma.ServiceOrderUncheckedCreateWithoutAssignedToInput[];
    connectOrCreate?: Prisma.ServiceOrderCreateOrConnectWithoutAssignedToInput | Prisma.ServiceOrderCreateOrConnectWithoutAssignedToInput[];
    createMany?: Prisma.ServiceOrderCreateManyAssignedToInputEnvelope;
    connect?: Prisma.ServiceOrderWhereUniqueInput | Prisma.ServiceOrderWhereUniqueInput[];
};
export type ServiceOrderUpdateManyWithoutCreatedByNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceOrderCreateWithoutCreatedByInput, Prisma.ServiceOrderUncheckedCreateWithoutCreatedByInput> | Prisma.ServiceOrderCreateWithoutCreatedByInput[] | Prisma.ServiceOrderUncheckedCreateWithoutCreatedByInput[];
    connectOrCreate?: Prisma.ServiceOrderCreateOrConnectWithoutCreatedByInput | Prisma.ServiceOrderCreateOrConnectWithoutCreatedByInput[];
    upsert?: Prisma.ServiceOrderUpsertWithWhereUniqueWithoutCreatedByInput | Prisma.ServiceOrderUpsertWithWhereUniqueWithoutCreatedByInput[];
    createMany?: Prisma.ServiceOrderCreateManyCreatedByInputEnvelope;
    set?: Prisma.ServiceOrderWhereUniqueInput | Prisma.ServiceOrderWhereUniqueInput[];
    disconnect?: Prisma.ServiceOrderWhereUniqueInput | Prisma.ServiceOrderWhereUniqueInput[];
    delete?: Prisma.ServiceOrderWhereUniqueInput | Prisma.ServiceOrderWhereUniqueInput[];
    connect?: Prisma.ServiceOrderWhereUniqueInput | Prisma.ServiceOrderWhereUniqueInput[];
    update?: Prisma.ServiceOrderUpdateWithWhereUniqueWithoutCreatedByInput | Prisma.ServiceOrderUpdateWithWhereUniqueWithoutCreatedByInput[];
    updateMany?: Prisma.ServiceOrderUpdateManyWithWhereWithoutCreatedByInput | Prisma.ServiceOrderUpdateManyWithWhereWithoutCreatedByInput[];
    deleteMany?: Prisma.ServiceOrderScalarWhereInput | Prisma.ServiceOrderScalarWhereInput[];
};
export type ServiceOrderUpdateManyWithoutAssignedToNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceOrderCreateWithoutAssignedToInput, Prisma.ServiceOrderUncheckedCreateWithoutAssignedToInput> | Prisma.ServiceOrderCreateWithoutAssignedToInput[] | Prisma.ServiceOrderUncheckedCreateWithoutAssignedToInput[];
    connectOrCreate?: Prisma.ServiceOrderCreateOrConnectWithoutAssignedToInput | Prisma.ServiceOrderCreateOrConnectWithoutAssignedToInput[];
    upsert?: Prisma.ServiceOrderUpsertWithWhereUniqueWithoutAssignedToInput | Prisma.ServiceOrderUpsertWithWhereUniqueWithoutAssignedToInput[];
    createMany?: Prisma.ServiceOrderCreateManyAssignedToInputEnvelope;
    set?: Prisma.ServiceOrderWhereUniqueInput | Prisma.ServiceOrderWhereUniqueInput[];
    disconnect?: Prisma.ServiceOrderWhereUniqueInput | Prisma.ServiceOrderWhereUniqueInput[];
    delete?: Prisma.ServiceOrderWhereUniqueInput | Prisma.ServiceOrderWhereUniqueInput[];
    connect?: Prisma.ServiceOrderWhereUniqueInput | Prisma.ServiceOrderWhereUniqueInput[];
    update?: Prisma.ServiceOrderUpdateWithWhereUniqueWithoutAssignedToInput | Prisma.ServiceOrderUpdateWithWhereUniqueWithoutAssignedToInput[];
    updateMany?: Prisma.ServiceOrderUpdateManyWithWhereWithoutAssignedToInput | Prisma.ServiceOrderUpdateManyWithWhereWithoutAssignedToInput[];
    deleteMany?: Prisma.ServiceOrderScalarWhereInput | Prisma.ServiceOrderScalarWhereInput[];
};
export type ServiceOrderUncheckedUpdateManyWithoutCreatedByNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceOrderCreateWithoutCreatedByInput, Prisma.ServiceOrderUncheckedCreateWithoutCreatedByInput> | Prisma.ServiceOrderCreateWithoutCreatedByInput[] | Prisma.ServiceOrderUncheckedCreateWithoutCreatedByInput[];
    connectOrCreate?: Prisma.ServiceOrderCreateOrConnectWithoutCreatedByInput | Prisma.ServiceOrderCreateOrConnectWithoutCreatedByInput[];
    upsert?: Prisma.ServiceOrderUpsertWithWhereUniqueWithoutCreatedByInput | Prisma.ServiceOrderUpsertWithWhereUniqueWithoutCreatedByInput[];
    createMany?: Prisma.ServiceOrderCreateManyCreatedByInputEnvelope;
    set?: Prisma.ServiceOrderWhereUniqueInput | Prisma.ServiceOrderWhereUniqueInput[];
    disconnect?: Prisma.ServiceOrderWhereUniqueInput | Prisma.ServiceOrderWhereUniqueInput[];
    delete?: Prisma.ServiceOrderWhereUniqueInput | Prisma.ServiceOrderWhereUniqueInput[];
    connect?: Prisma.ServiceOrderWhereUniqueInput | Prisma.ServiceOrderWhereUniqueInput[];
    update?: Prisma.ServiceOrderUpdateWithWhereUniqueWithoutCreatedByInput | Prisma.ServiceOrderUpdateWithWhereUniqueWithoutCreatedByInput[];
    updateMany?: Prisma.ServiceOrderUpdateManyWithWhereWithoutCreatedByInput | Prisma.ServiceOrderUpdateManyWithWhereWithoutCreatedByInput[];
    deleteMany?: Prisma.ServiceOrderScalarWhereInput | Prisma.ServiceOrderScalarWhereInput[];
};
export type ServiceOrderUncheckedUpdateManyWithoutAssignedToNestedInput = {
    create?: Prisma.XOR<Prisma.ServiceOrderCreateWithoutAssignedToInput, Prisma.ServiceOrderUncheckedCreateWithoutAssignedToInput> | Prisma.ServiceOrderCreateWithoutAssignedToInput[] | Prisma.ServiceOrderUncheckedCreateWithoutAssignedToInput[];
    connectOrCreate?: Prisma.ServiceOrderCreateOrConnectWithoutAssignedToInput | Prisma.ServiceOrderCreateOrConnectWithoutAssignedToInput[];
    upsert?: Prisma.ServiceOrderUpsertWithWhereUniqueWithoutAssignedToInput | Prisma.ServiceOrderUpsertWithWhereUniqueWithoutAssignedToInput[];
    createMany?: Prisma.ServiceOrderCreateManyAssignedToInputEnvelope;
    set?: Prisma.ServiceOrderWhereUniqueInput | Prisma.ServiceOrderWhereUniqueInput[];
    disconnect?: Prisma.ServiceOrderWhereUniqueInput | Prisma.ServiceOrderWhereUniqueInput[];
    delete?: Prisma.ServiceOrderWhereUniqueInput | Prisma.ServiceOrderWhereUniqueInput[];
    connect?: Prisma.ServiceOrderWhereUniqueInput | Prisma.ServiceOrderWhereUniqueInput[];
    update?: Prisma.ServiceOrderUpdateWithWhereUniqueWithoutAssignedToInput | Prisma.ServiceOrderUpdateWithWhereUniqueWithoutAssignedToInput[];
    updateMany?: Prisma.ServiceOrderUpdateManyWithWhereWithoutAssignedToInput | Prisma.ServiceOrderUpdateManyWithWhereWithoutAssignedToInput[];
    deleteMany?: Prisma.ServiceOrderScalarWhereInput | Prisma.ServiceOrderScalarWhereInput[];
};
export type EnumServiceOrderTypeFieldUpdateOperationsInput = {
    set?: $Enums.ServiceOrderType;
};
export type NullableEnumServiceOrderDeadlineFieldUpdateOperationsInput = {
    set?: $Enums.ServiceOrderDeadline | null;
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type EnumServiceOrderStatusFieldUpdateOperationsInput = {
    set?: $Enums.ServiceOrderStatus;
};
export type ServiceOrderCreateWithoutCreatedByInput = {
    id?: string;
    identifier?: string | null;
    osType: $Enums.ServiceOrderType;
    deadline?: $Enums.ServiceOrderDeadline | null;
    customer: string;
    description: string;
    durationMinutes: number;
    scheduleAt: Date | string;
    scheduleTimeText?: string | null;
    collaborator?: string | null;
    address?: string | null;
    status?: $Enums.ServiceOrderStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    assignedTo?: Prisma.UserCreateNestedOneWithoutAssignedOrdersInput;
};
export type ServiceOrderUncheckedCreateWithoutCreatedByInput = {
    id?: string;
    identifier?: string | null;
    osType: $Enums.ServiceOrderType;
    deadline?: $Enums.ServiceOrderDeadline | null;
    customer: string;
    description: string;
    durationMinutes: number;
    scheduleAt: Date | string;
    scheduleTimeText?: string | null;
    collaborator?: string | null;
    address?: string | null;
    status?: $Enums.ServiceOrderStatus;
    assignedToId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ServiceOrderCreateOrConnectWithoutCreatedByInput = {
    where: Prisma.ServiceOrderWhereUniqueInput;
    create: Prisma.XOR<Prisma.ServiceOrderCreateWithoutCreatedByInput, Prisma.ServiceOrderUncheckedCreateWithoutCreatedByInput>;
};
export type ServiceOrderCreateManyCreatedByInputEnvelope = {
    data: Prisma.ServiceOrderCreateManyCreatedByInput | Prisma.ServiceOrderCreateManyCreatedByInput[];
    skipDuplicates?: boolean;
};
export type ServiceOrderCreateWithoutAssignedToInput = {
    id?: string;
    identifier?: string | null;
    osType: $Enums.ServiceOrderType;
    deadline?: $Enums.ServiceOrderDeadline | null;
    customer: string;
    description: string;
    durationMinutes: number;
    scheduleAt: Date | string;
    scheduleTimeText?: string | null;
    collaborator?: string | null;
    address?: string | null;
    status?: $Enums.ServiceOrderStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    createdBy: Prisma.UserCreateNestedOneWithoutCreatedOrdersInput;
};
export type ServiceOrderUncheckedCreateWithoutAssignedToInput = {
    id?: string;
    identifier?: string | null;
    osType: $Enums.ServiceOrderType;
    deadline?: $Enums.ServiceOrderDeadline | null;
    customer: string;
    description: string;
    durationMinutes: number;
    scheduleAt: Date | string;
    scheduleTimeText?: string | null;
    collaborator?: string | null;
    address?: string | null;
    status?: $Enums.ServiceOrderStatus;
    createdById: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ServiceOrderCreateOrConnectWithoutAssignedToInput = {
    where: Prisma.ServiceOrderWhereUniqueInput;
    create: Prisma.XOR<Prisma.ServiceOrderCreateWithoutAssignedToInput, Prisma.ServiceOrderUncheckedCreateWithoutAssignedToInput>;
};
export type ServiceOrderCreateManyAssignedToInputEnvelope = {
    data: Prisma.ServiceOrderCreateManyAssignedToInput | Prisma.ServiceOrderCreateManyAssignedToInput[];
    skipDuplicates?: boolean;
};
export type ServiceOrderUpsertWithWhereUniqueWithoutCreatedByInput = {
    where: Prisma.ServiceOrderWhereUniqueInput;
    update: Prisma.XOR<Prisma.ServiceOrderUpdateWithoutCreatedByInput, Prisma.ServiceOrderUncheckedUpdateWithoutCreatedByInput>;
    create: Prisma.XOR<Prisma.ServiceOrderCreateWithoutCreatedByInput, Prisma.ServiceOrderUncheckedCreateWithoutCreatedByInput>;
};
export type ServiceOrderUpdateWithWhereUniqueWithoutCreatedByInput = {
    where: Prisma.ServiceOrderWhereUniqueInput;
    data: Prisma.XOR<Prisma.ServiceOrderUpdateWithoutCreatedByInput, Prisma.ServiceOrderUncheckedUpdateWithoutCreatedByInput>;
};
export type ServiceOrderUpdateManyWithWhereWithoutCreatedByInput = {
    where: Prisma.ServiceOrderScalarWhereInput;
    data: Prisma.XOR<Prisma.ServiceOrderUpdateManyMutationInput, Prisma.ServiceOrderUncheckedUpdateManyWithoutCreatedByInput>;
};
export type ServiceOrderScalarWhereInput = {
    AND?: Prisma.ServiceOrderScalarWhereInput | Prisma.ServiceOrderScalarWhereInput[];
    OR?: Prisma.ServiceOrderScalarWhereInput[];
    NOT?: Prisma.ServiceOrderScalarWhereInput | Prisma.ServiceOrderScalarWhereInput[];
    id?: Prisma.StringFilter<"ServiceOrder"> | string;
    identifier?: Prisma.StringNullableFilter<"ServiceOrder"> | string | null;
    osType?: Prisma.EnumServiceOrderTypeFilter<"ServiceOrder"> | $Enums.ServiceOrderType;
    deadline?: Prisma.EnumServiceOrderDeadlineNullableFilter<"ServiceOrder"> | $Enums.ServiceOrderDeadline | null;
    customer?: Prisma.StringFilter<"ServiceOrder"> | string;
    description?: Prisma.StringFilter<"ServiceOrder"> | string;
    durationMinutes?: Prisma.IntFilter<"ServiceOrder"> | number;
    scheduleAt?: Prisma.DateTimeFilter<"ServiceOrder"> | Date | string;
    scheduleTimeText?: Prisma.StringNullableFilter<"ServiceOrder"> | string | null;
    collaborator?: Prisma.StringNullableFilter<"ServiceOrder"> | string | null;
    address?: Prisma.StringNullableFilter<"ServiceOrder"> | string | null;
    status?: Prisma.EnumServiceOrderStatusFilter<"ServiceOrder"> | $Enums.ServiceOrderStatus;
    createdById?: Prisma.StringFilter<"ServiceOrder"> | string;
    assignedToId?: Prisma.StringNullableFilter<"ServiceOrder"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"ServiceOrder"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ServiceOrder"> | Date | string;
};
export type ServiceOrderUpsertWithWhereUniqueWithoutAssignedToInput = {
    where: Prisma.ServiceOrderWhereUniqueInput;
    update: Prisma.XOR<Prisma.ServiceOrderUpdateWithoutAssignedToInput, Prisma.ServiceOrderUncheckedUpdateWithoutAssignedToInput>;
    create: Prisma.XOR<Prisma.ServiceOrderCreateWithoutAssignedToInput, Prisma.ServiceOrderUncheckedCreateWithoutAssignedToInput>;
};
export type ServiceOrderUpdateWithWhereUniqueWithoutAssignedToInput = {
    where: Prisma.ServiceOrderWhereUniqueInput;
    data: Prisma.XOR<Prisma.ServiceOrderUpdateWithoutAssignedToInput, Prisma.ServiceOrderUncheckedUpdateWithoutAssignedToInput>;
};
export type ServiceOrderUpdateManyWithWhereWithoutAssignedToInput = {
    where: Prisma.ServiceOrderScalarWhereInput;
    data: Prisma.XOR<Prisma.ServiceOrderUpdateManyMutationInput, Prisma.ServiceOrderUncheckedUpdateManyWithoutAssignedToInput>;
};
export type ServiceOrderCreateManyCreatedByInput = {
    id?: string;
    identifier?: string | null;
    osType: $Enums.ServiceOrderType;
    deadline?: $Enums.ServiceOrderDeadline | null;
    customer: string;
    description: string;
    durationMinutes: number;
    scheduleAt: Date | string;
    scheduleTimeText?: string | null;
    collaborator?: string | null;
    address?: string | null;
    status?: $Enums.ServiceOrderStatus;
    assignedToId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ServiceOrderCreateManyAssignedToInput = {
    id?: string;
    identifier?: string | null;
    osType: $Enums.ServiceOrderType;
    deadline?: $Enums.ServiceOrderDeadline | null;
    customer: string;
    description: string;
    durationMinutes: number;
    scheduleAt: Date | string;
    scheduleTimeText?: string | null;
    collaborator?: string | null;
    address?: string | null;
    status?: $Enums.ServiceOrderStatus;
    createdById: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ServiceOrderUpdateWithoutCreatedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    identifier?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    osType?: Prisma.EnumServiceOrderTypeFieldUpdateOperationsInput | $Enums.ServiceOrderType;
    deadline?: Prisma.NullableEnumServiceOrderDeadlineFieldUpdateOperationsInput | $Enums.ServiceOrderDeadline | null;
    customer?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    durationMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    scheduleAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scheduleTimeText?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collaborator?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    address?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumServiceOrderStatusFieldUpdateOperationsInput | $Enums.ServiceOrderStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    assignedTo?: Prisma.UserUpdateOneWithoutAssignedOrdersNestedInput;
};
export type ServiceOrderUncheckedUpdateWithoutCreatedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    identifier?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    osType?: Prisma.EnumServiceOrderTypeFieldUpdateOperationsInput | $Enums.ServiceOrderType;
    deadline?: Prisma.NullableEnumServiceOrderDeadlineFieldUpdateOperationsInput | $Enums.ServiceOrderDeadline | null;
    customer?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    durationMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    scheduleAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scheduleTimeText?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collaborator?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    address?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumServiceOrderStatusFieldUpdateOperationsInput | $Enums.ServiceOrderStatus;
    assignedToId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ServiceOrderUncheckedUpdateManyWithoutCreatedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    identifier?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    osType?: Prisma.EnumServiceOrderTypeFieldUpdateOperationsInput | $Enums.ServiceOrderType;
    deadline?: Prisma.NullableEnumServiceOrderDeadlineFieldUpdateOperationsInput | $Enums.ServiceOrderDeadline | null;
    customer?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    durationMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    scheduleAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scheduleTimeText?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collaborator?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    address?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumServiceOrderStatusFieldUpdateOperationsInput | $Enums.ServiceOrderStatus;
    assignedToId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ServiceOrderUpdateWithoutAssignedToInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    identifier?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    osType?: Prisma.EnumServiceOrderTypeFieldUpdateOperationsInput | $Enums.ServiceOrderType;
    deadline?: Prisma.NullableEnumServiceOrderDeadlineFieldUpdateOperationsInput | $Enums.ServiceOrderDeadline | null;
    customer?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    durationMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    scheduleAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scheduleTimeText?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collaborator?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    address?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumServiceOrderStatusFieldUpdateOperationsInput | $Enums.ServiceOrderStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdBy?: Prisma.UserUpdateOneRequiredWithoutCreatedOrdersNestedInput;
};
export type ServiceOrderUncheckedUpdateWithoutAssignedToInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    identifier?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    osType?: Prisma.EnumServiceOrderTypeFieldUpdateOperationsInput | $Enums.ServiceOrderType;
    deadline?: Prisma.NullableEnumServiceOrderDeadlineFieldUpdateOperationsInput | $Enums.ServiceOrderDeadline | null;
    customer?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    durationMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    scheduleAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scheduleTimeText?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collaborator?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    address?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumServiceOrderStatusFieldUpdateOperationsInput | $Enums.ServiceOrderStatus;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ServiceOrderUncheckedUpdateManyWithoutAssignedToInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    identifier?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    osType?: Prisma.EnumServiceOrderTypeFieldUpdateOperationsInput | $Enums.ServiceOrderType;
    deadline?: Prisma.NullableEnumServiceOrderDeadlineFieldUpdateOperationsInput | $Enums.ServiceOrderDeadline | null;
    customer?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    durationMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    scheduleAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scheduleTimeText?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    collaborator?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    address?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumServiceOrderStatusFieldUpdateOperationsInput | $Enums.ServiceOrderStatus;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ServiceOrderSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    identifier?: boolean;
    osType?: boolean;
    deadline?: boolean;
    customer?: boolean;
    description?: boolean;
    durationMinutes?: boolean;
    scheduleAt?: boolean;
    scheduleTimeText?: boolean;
    collaborator?: boolean;
    address?: boolean;
    status?: boolean;
    createdById?: boolean;
    assignedToId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    createdBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    assignedTo?: boolean | Prisma.ServiceOrder$assignedToArgs<ExtArgs>;
}, ExtArgs["result"]["serviceOrder"]>;
export type ServiceOrderSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    identifier?: boolean;
    osType?: boolean;
    deadline?: boolean;
    customer?: boolean;
    description?: boolean;
    durationMinutes?: boolean;
    scheduleAt?: boolean;
    scheduleTimeText?: boolean;
    collaborator?: boolean;
    address?: boolean;
    status?: boolean;
    createdById?: boolean;
    assignedToId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    createdBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    assignedTo?: boolean | Prisma.ServiceOrder$assignedToArgs<ExtArgs>;
}, ExtArgs["result"]["serviceOrder"]>;
export type ServiceOrderSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    identifier?: boolean;
    osType?: boolean;
    deadline?: boolean;
    customer?: boolean;
    description?: boolean;
    durationMinutes?: boolean;
    scheduleAt?: boolean;
    scheduleTimeText?: boolean;
    collaborator?: boolean;
    address?: boolean;
    status?: boolean;
    createdById?: boolean;
    assignedToId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    createdBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    assignedTo?: boolean | Prisma.ServiceOrder$assignedToArgs<ExtArgs>;
}, ExtArgs["result"]["serviceOrder"]>;
export type ServiceOrderSelectScalar = {
    id?: boolean;
    identifier?: boolean;
    osType?: boolean;
    deadline?: boolean;
    customer?: boolean;
    description?: boolean;
    durationMinutes?: boolean;
    scheduleAt?: boolean;
    scheduleTimeText?: boolean;
    collaborator?: boolean;
    address?: boolean;
    status?: boolean;
    createdById?: boolean;
    assignedToId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type ServiceOrderOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "identifier" | "osType" | "deadline" | "customer" | "description" | "durationMinutes" | "scheduleAt" | "scheduleTimeText" | "collaborator" | "address" | "status" | "createdById" | "assignedToId" | "createdAt" | "updatedAt", ExtArgs["result"]["serviceOrder"]>;
export type ServiceOrderInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    createdBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    assignedTo?: boolean | Prisma.ServiceOrder$assignedToArgs<ExtArgs>;
};
export type ServiceOrderIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    createdBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    assignedTo?: boolean | Prisma.ServiceOrder$assignedToArgs<ExtArgs>;
};
export type ServiceOrderIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    createdBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    assignedTo?: boolean | Prisma.ServiceOrder$assignedToArgs<ExtArgs>;
};
export type $ServiceOrderPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ServiceOrder";
    objects: {
        createdBy: Prisma.$UserPayload<ExtArgs>;
        assignedTo: Prisma.$UserPayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        identifier: string | null;
        osType: $Enums.ServiceOrderType;
        deadline: $Enums.ServiceOrderDeadline | null;
        customer: string;
        description: string;
        durationMinutes: number;
        scheduleAt: Date;
        scheduleTimeText: string | null;
        collaborator: string | null;
        address: string | null;
        status: $Enums.ServiceOrderStatus;
        createdById: string;
        assignedToId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["serviceOrder"]>;
    composites: {};
};
export type ServiceOrderGetPayload<S extends boolean | null | undefined | ServiceOrderDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ServiceOrderPayload, S>;
export type ServiceOrderCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ServiceOrderFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ServiceOrderCountAggregateInputType | true;
};
export interface ServiceOrderDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ServiceOrder'];
        meta: {
            name: 'ServiceOrder';
        };
    };
    findUnique<T extends ServiceOrderFindUniqueArgs>(args: Prisma.SelectSubset<T, ServiceOrderFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ServiceOrderClient<runtime.Types.Result.GetResult<Prisma.$ServiceOrderPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ServiceOrderFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ServiceOrderFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ServiceOrderClient<runtime.Types.Result.GetResult<Prisma.$ServiceOrderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ServiceOrderFindFirstArgs>(args?: Prisma.SelectSubset<T, ServiceOrderFindFirstArgs<ExtArgs>>): Prisma.Prisma__ServiceOrderClient<runtime.Types.Result.GetResult<Prisma.$ServiceOrderPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ServiceOrderFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ServiceOrderFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ServiceOrderClient<runtime.Types.Result.GetResult<Prisma.$ServiceOrderPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ServiceOrderFindManyArgs>(args?: Prisma.SelectSubset<T, ServiceOrderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ServiceOrderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ServiceOrderCreateArgs>(args: Prisma.SelectSubset<T, ServiceOrderCreateArgs<ExtArgs>>): Prisma.Prisma__ServiceOrderClient<runtime.Types.Result.GetResult<Prisma.$ServiceOrderPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ServiceOrderCreateManyArgs>(args?: Prisma.SelectSubset<T, ServiceOrderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ServiceOrderCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ServiceOrderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ServiceOrderPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ServiceOrderDeleteArgs>(args: Prisma.SelectSubset<T, ServiceOrderDeleteArgs<ExtArgs>>): Prisma.Prisma__ServiceOrderClient<runtime.Types.Result.GetResult<Prisma.$ServiceOrderPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ServiceOrderUpdateArgs>(args: Prisma.SelectSubset<T, ServiceOrderUpdateArgs<ExtArgs>>): Prisma.Prisma__ServiceOrderClient<runtime.Types.Result.GetResult<Prisma.$ServiceOrderPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ServiceOrderDeleteManyArgs>(args?: Prisma.SelectSubset<T, ServiceOrderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ServiceOrderUpdateManyArgs>(args: Prisma.SelectSubset<T, ServiceOrderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ServiceOrderUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ServiceOrderUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ServiceOrderPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ServiceOrderUpsertArgs>(args: Prisma.SelectSubset<T, ServiceOrderUpsertArgs<ExtArgs>>): Prisma.Prisma__ServiceOrderClient<runtime.Types.Result.GetResult<Prisma.$ServiceOrderPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ServiceOrderCountArgs>(args?: Prisma.Subset<T, ServiceOrderCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ServiceOrderCountAggregateOutputType> : number>;
    aggregate<T extends ServiceOrderAggregateArgs>(args: Prisma.Subset<T, ServiceOrderAggregateArgs>): Prisma.PrismaPromise<GetServiceOrderAggregateType<T>>;
    groupBy<T extends ServiceOrderGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ServiceOrderGroupByArgs['orderBy'];
    } : {
        orderBy?: ServiceOrderGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ServiceOrderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetServiceOrderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ServiceOrderFieldRefs;
}
export interface Prisma__ServiceOrderClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    createdBy<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    assignedTo<T extends Prisma.ServiceOrder$assignedToArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ServiceOrder$assignedToArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ServiceOrderFieldRefs {
    readonly id: Prisma.FieldRef<"ServiceOrder", 'String'>;
    readonly identifier: Prisma.FieldRef<"ServiceOrder", 'String'>;
    readonly osType: Prisma.FieldRef<"ServiceOrder", 'ServiceOrderType'>;
    readonly deadline: Prisma.FieldRef<"ServiceOrder", 'ServiceOrderDeadline'>;
    readonly customer: Prisma.FieldRef<"ServiceOrder", 'String'>;
    readonly description: Prisma.FieldRef<"ServiceOrder", 'String'>;
    readonly durationMinutes: Prisma.FieldRef<"ServiceOrder", 'Int'>;
    readonly scheduleAt: Prisma.FieldRef<"ServiceOrder", 'DateTime'>;
    readonly scheduleTimeText: Prisma.FieldRef<"ServiceOrder", 'String'>;
    readonly collaborator: Prisma.FieldRef<"ServiceOrder", 'String'>;
    readonly address: Prisma.FieldRef<"ServiceOrder", 'String'>;
    readonly status: Prisma.FieldRef<"ServiceOrder", 'ServiceOrderStatus'>;
    readonly createdById: Prisma.FieldRef<"ServiceOrder", 'String'>;
    readonly assignedToId: Prisma.FieldRef<"ServiceOrder", 'String'>;
    readonly createdAt: Prisma.FieldRef<"ServiceOrder", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"ServiceOrder", 'DateTime'>;
}
export type ServiceOrderFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceOrderSelect<ExtArgs> | null;
    omit?: Prisma.ServiceOrderOmit<ExtArgs> | null;
    include?: Prisma.ServiceOrderInclude<ExtArgs> | null;
    where: Prisma.ServiceOrderWhereUniqueInput;
};
export type ServiceOrderFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceOrderSelect<ExtArgs> | null;
    omit?: Prisma.ServiceOrderOmit<ExtArgs> | null;
    include?: Prisma.ServiceOrderInclude<ExtArgs> | null;
    where: Prisma.ServiceOrderWhereUniqueInput;
};
export type ServiceOrderFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceOrderSelect<ExtArgs> | null;
    omit?: Prisma.ServiceOrderOmit<ExtArgs> | null;
    include?: Prisma.ServiceOrderInclude<ExtArgs> | null;
    where?: Prisma.ServiceOrderWhereInput;
    orderBy?: Prisma.ServiceOrderOrderByWithRelationInput | Prisma.ServiceOrderOrderByWithRelationInput[];
    cursor?: Prisma.ServiceOrderWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ServiceOrderScalarFieldEnum | Prisma.ServiceOrderScalarFieldEnum[];
};
export type ServiceOrderFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceOrderSelect<ExtArgs> | null;
    omit?: Prisma.ServiceOrderOmit<ExtArgs> | null;
    include?: Prisma.ServiceOrderInclude<ExtArgs> | null;
    where?: Prisma.ServiceOrderWhereInput;
    orderBy?: Prisma.ServiceOrderOrderByWithRelationInput | Prisma.ServiceOrderOrderByWithRelationInput[];
    cursor?: Prisma.ServiceOrderWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ServiceOrderScalarFieldEnum | Prisma.ServiceOrderScalarFieldEnum[];
};
export type ServiceOrderFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceOrderSelect<ExtArgs> | null;
    omit?: Prisma.ServiceOrderOmit<ExtArgs> | null;
    include?: Prisma.ServiceOrderInclude<ExtArgs> | null;
    where?: Prisma.ServiceOrderWhereInput;
    orderBy?: Prisma.ServiceOrderOrderByWithRelationInput | Prisma.ServiceOrderOrderByWithRelationInput[];
    cursor?: Prisma.ServiceOrderWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ServiceOrderScalarFieldEnum | Prisma.ServiceOrderScalarFieldEnum[];
};
export type ServiceOrderCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceOrderSelect<ExtArgs> | null;
    omit?: Prisma.ServiceOrderOmit<ExtArgs> | null;
    include?: Prisma.ServiceOrderInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ServiceOrderCreateInput, Prisma.ServiceOrderUncheckedCreateInput>;
};
export type ServiceOrderCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ServiceOrderCreateManyInput | Prisma.ServiceOrderCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ServiceOrderCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceOrderSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ServiceOrderOmit<ExtArgs> | null;
    data: Prisma.ServiceOrderCreateManyInput | Prisma.ServiceOrderCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ServiceOrderIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ServiceOrderUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceOrderSelect<ExtArgs> | null;
    omit?: Prisma.ServiceOrderOmit<ExtArgs> | null;
    include?: Prisma.ServiceOrderInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ServiceOrderUpdateInput, Prisma.ServiceOrderUncheckedUpdateInput>;
    where: Prisma.ServiceOrderWhereUniqueInput;
};
export type ServiceOrderUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ServiceOrderUpdateManyMutationInput, Prisma.ServiceOrderUncheckedUpdateManyInput>;
    where?: Prisma.ServiceOrderWhereInput;
    limit?: number;
};
export type ServiceOrderUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceOrderSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ServiceOrderOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ServiceOrderUpdateManyMutationInput, Prisma.ServiceOrderUncheckedUpdateManyInput>;
    where?: Prisma.ServiceOrderWhereInput;
    limit?: number;
    include?: Prisma.ServiceOrderIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ServiceOrderUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceOrderSelect<ExtArgs> | null;
    omit?: Prisma.ServiceOrderOmit<ExtArgs> | null;
    include?: Prisma.ServiceOrderInclude<ExtArgs> | null;
    where: Prisma.ServiceOrderWhereUniqueInput;
    create: Prisma.XOR<Prisma.ServiceOrderCreateInput, Prisma.ServiceOrderUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ServiceOrderUpdateInput, Prisma.ServiceOrderUncheckedUpdateInput>;
};
export type ServiceOrderDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceOrderSelect<ExtArgs> | null;
    omit?: Prisma.ServiceOrderOmit<ExtArgs> | null;
    include?: Prisma.ServiceOrderInclude<ExtArgs> | null;
    where: Prisma.ServiceOrderWhereUniqueInput;
};
export type ServiceOrderDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ServiceOrderWhereInput;
    limit?: number;
};
export type ServiceOrder$assignedToArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
};
export type ServiceOrderDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ServiceOrderSelect<ExtArgs> | null;
    omit?: Prisma.ServiceOrderOmit<ExtArgs> | null;
    include?: Prisma.ServiceOrderInclude<ExtArgs> | null;
};
export {};
