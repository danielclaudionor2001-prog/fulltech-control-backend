import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

type ServiceOrderNotification = {
  address: string | null;
  completionDescription?: string | null;
  createdByName?: string | null;
  customer: string;
  customerEmail?: string | null;
  customerPhones?: string[];
  defectAdjusted?: boolean | null;
  defectSolution?: string | null;
  description: string;
  equipmentStatus?: string | null;
  identifier: string | null;
  osType: string;
  responsibleName?: string | null;
  scheduleAt: Date | string;
  serviceOrderId: string;
  status?: string | null;
};

type StartedServiceOrderNotification = {
  address: string | null;
  customer: string;
  identifier: string | null;
  latitude: number;
  longitude: number;
  serviceOrderId: string;
  technicianName: string | null;
};

const SERVICE_ORDER_TYPE_LABELS: Record<string, string> = {
  atendimento_chamado: 'Atendimento de chamado',
  instalacao: 'Instalacao',
  manutencao: 'Manutencao',
  manutencao_mensal: 'Manutencao mensal',
  servicos_interacao: 'Servicos/Instalacoes',
  suporte: 'Suporte',
  vistoria: 'Vistoria',
};

const SERVICE_ORDER_STATUS_LABELS: Record<string, string> = {
  CANCELED: 'Cancelada',
  DONE: 'Finalizado',
  IN_PROGRESS: 'Em andamento',
  OPEN: 'Pendente',
  WITH_PENDING: 'Com pendencia',
};

const DEFECT_SOLUTION_LABELS: Record<string, string> = {
  adjustment: 'Ajuste',
  repair: 'Programar reparo',
  replacement: 'Substituicao de pecas/componentes',
};

const EQUIPMENT_STATUS_LABELS: Record<string, string> = {
  running: 'Elevador funcionando',
  stopped: 'Elevador parado',
};

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(private readonly config: ConfigService) {}

  private get isConfigured() {
    return Boolean(
      this.config.get<string>('TWILIO_ACCOUNT_SID') &&
      this.config.get<string>('TWILIO_AUTH_TOKEN') &&
      this.config.get<string>('WHATSAPP_FROM') &&
      this.config.get<string>('WHATSAPP_TO'),
    );
  }

  async sendServiceOrderCreated(
    payload: ServiceOrderNotification,
  ): Promise<void> {
    await this.sendMessage('SERVICE_ORDER_CREATED', [
      '🔔 OS Criada',
      ...this.buildServiceOrderLines(payload),
    ]);
  }

  async sendServiceOrderStarted(
    payload: StartedServiceOrderNotification,
  ): Promise<void> {
    await this.sendMessage('SERVICE_ORDER_STARTED', [
      'Atendimento iniciado no Fulltech Control.',
      `OS: ${payload.identifier || payload.serviceOrderId}`,
      `Cliente: ${payload.customer}`,
      `Tecnico: ${payload.technicianName || 'Nao informado'}`,
      `Endereco: ${payload.address || 'Nao informado'}`,
      `Mapa: https://www.google.com/maps?q=${payload.latitude},${payload.longitude}`,
    ]);
  }

  async sendServiceOrderFinished(
    payload: ServiceOrderNotification,
  ): Promise<void> {
    await this.sendMessage('SERVICE_ORDER_FINISHED', [
      '✅ OS Finalizada',
      `Responsavel: ${this.normalize(payload.responsibleName)}`,
      ...this.buildServiceOrderLines(payload),
      `Conclusao: ${this.normalize(payload.completionDescription)}`,
      `Defeito ajustado: ${
        payload.defectAdjusted === null || payload.defectAdjusted === undefined
          ? 'Nao informado'
          : payload.defectAdjusted
            ? 'Sim'
            : 'Nao'
      }`,
      `Solucao do defeito: ${this.labelFromMap(
        payload.defectSolution,
        DEFECT_SOLUTION_LABELS,
      )}`,
      `Status do elevador: ${this.labelFromMap(
        payload.equipmentStatus,
        EQUIPMENT_STATUS_LABELS,
      )}`,
    ]);
  }

  private async sendMessage(eventName: string, lines: string[]) {
    if (!this.isConfigured) {
      this.logger.warn(
        `WhatsApp notification ${eventName} skipped because Twilio variables are not configured.`,
      );
      return;
    }

    this.logger.log(`Sending WhatsApp notification ${eventName}.`);

    const client = twilio(
      this.config.getOrThrow<string>('TWILIO_ACCOUNT_SID'),
      this.config.getOrThrow<string>('TWILIO_AUTH_TOKEN'),
    );

    const message = await client.messages.create({
      body: lines.join('\n'),
      from: this.config.getOrThrow<string>('WHATSAPP_FROM'),
      to: this.config.getOrThrow<string>('WHATSAPP_TO'),
    });

    this.logger.log(
      `WhatsApp notification ${eventName} sent successfully. SID: ${message.sid}`,
    );
  }

  private buildServiceOrderLines(payload: ServiceOrderNotification) {
    return [
      `OS: ${payload.identifier || payload.serviceOrderId}`,
      `Tipo: ${this.labelFromMap(payload.osType, SERVICE_ORDER_TYPE_LABELS)}`,
      `Status: ${this.labelFromMap(
        payload.status,
        SERVICE_ORDER_STATUS_LABELS,
      )}`,
      `Cliente: ${payload.customer}`,
      `Telefone: ${this.formatPhones(payload.customerPhones)}`,
      `E-mail: ${this.normalize(payload.customerEmail)}`,
      `Endereco: ${this.normalize(payload.address)}`,
      `Agendamento: ${this.formatDateTime(payload.scheduleAt)}`,
      `Responsavel: ${this.normalize(payload.responsibleName)}`,
      `Criado por: ${this.normalize(payload.createdByName)}`,
      `Descricao: ${payload.description}`,
    ];
  }

  private formatDateTime(value: Date | string) {
    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Nao informado';
    }

    return parsedDate.toLocaleString('pt-BR', {
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  private formatPhones(phones?: string[]) {
    const normalizedPhones = (phones ?? [])
      .map((phone) => phone.trim())
      .filter(Boolean);

    return normalizedPhones.length > 0
      ? normalizedPhones.join(', ')
      : 'Nao informado';
  }

  private labelFromMap(
    value: string | null | undefined,
    labels: Record<string, string>,
  ) {
    if (!value) {
      return 'Nao informado';
    }

    return labels[value] ?? value;
  }

  private normalize(value?: string | null) {
    return value?.trim() || 'Nao informado';
  }
}
