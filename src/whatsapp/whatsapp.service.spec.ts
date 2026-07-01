import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';
import { WhatsAppService } from './whatsapp.service';

const mockCreate = jest.fn();

jest.mock('twilio', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    messages: {
      create: mockCreate,
    },
  })),
}));

describe('WhatsAppService', () => {
  const createService = (values: Record<string, string>) => {
    const config = {
      get: jest.fn((key: string) => values[key]),
    };

    return new WhatsAppService(config as unknown as ConfigService);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('skips notifications when the Twilio account SID is invalid', async () => {
    const service = createService({
      TWILIO_ACCOUNT_SID: 'invalid-account-sid',
      TWILIO_AUTH_TOKEN: 'token',
      WHATSAPP_FROM: 'whatsapp:+14155238886',
      WHATSAPP_TO: 'whatsapp:+5500000000000',
    });

    await service.sendServiceOrderStarted({
      address: 'Rua teste, 123',
      customer: 'Cliente teste',
      identifier: '0001',
      latitude: -23.55052,
      longitude: -46.633308,
      serviceOrderId: 'os-1',
      technicianName: 'Tecnico Teste',
    });

    expect(twilio).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('sends notifications when Twilio and WhatsApp variables are valid', async () => {
    mockCreate.mockResolvedValue({ sid: 'SM123' });

    const service = createService({
      TWILIO_ACCOUNT_SID: 'AC00000000000000000000000000000000',
      TWILIO_AUTH_TOKEN: 'token',
      WHATSAPP_FROM: 'whatsapp:+14155238886',
      WHATSAPP_TO: 'whatsapp:+5500000000000',
    });

    await service.sendServiceOrderStarted({
      address: 'Rua teste, 123',
      customer: 'Cliente teste',
      identifier: '0001',
      latitude: -23.55052,
      longitude: -46.633308,
      serviceOrderId: 'os-1',
      technicianName: 'Tecnico Teste',
    });

    expect(twilio).toHaveBeenCalledWith(
      'AC00000000000000000000000000000000',
      'token',
    );
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'whatsapp:+14155238886',
        to: 'whatsapp:+5500000000000',
      }),
    );
  });
});
