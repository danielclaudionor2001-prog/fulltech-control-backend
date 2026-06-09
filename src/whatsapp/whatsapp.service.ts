import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

type StartedServiceOrderNotification = {
  address: string | null;
  customer: string;
  identifier: string | null;
  latitude: number;
  longitude: number;
  serviceOrderId: string;
  technicianName: string | null;
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

  async sendServiceOrderStarted(
    payload: StartedServiceOrderNotification,
  ): Promise<void> {
    if (!this.isConfigured) {
      this.logger.warn(
        'WhatsApp notification skipped because Twilio variables are not configured.',
      );
      return;
    }

    const client = twilio(
      this.config.getOrThrow<string>('TWILIO_ACCOUNT_SID'),
      this.config.getOrThrow<string>('TWILIO_AUTH_TOKEN'),
    );

    const body = [
      'Atendimento iniciado no Fulltech Control.',
      `OS: ${payload.identifier || payload.serviceOrderId}`,
      `Cliente: ${payload.customer}`,
      `Tecnico: ${payload.technicianName || 'Nao informado'}`,
      `Endereco: ${payload.address || 'Nao informado'}`,
      `Mapa: https://www.google.com/maps?q=${payload.latitude},${payload.longitude}`,
    ].join('\n');

    await client.messages.create({
      body,
      from: this.config.getOrThrow<string>('WHATSAPP_FROM'),
      to: this.config.getOrThrow<string>('WHATSAPP_TO'),
    });
  }
}
