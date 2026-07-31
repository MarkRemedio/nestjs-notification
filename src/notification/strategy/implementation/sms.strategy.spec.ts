import { SmsStrategy } from './sms.strategy';
import { NotificationType } from '../../enums/notification-type.enum';

describe('SmsStrategy', () => {
  const strategy = new SmsStrategy();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return a success result when the provider call succeeds', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(Math, 'random').mockReturnValue(0.9);

    const result = await strategy.send({
      type: NotificationType.SMS,
      recipient: 'user@example.com',
      message: 'Test SMS message',
    });

    expect(logSpy).toHaveBeenCalledWith(
      'Sending SMS to user@example.com',
      expect.objectContaining({
        recipient: 'user@example.com',
        type: NotificationType.SMS,
      }),
    );
    expect(result).toEqual({
      success: true,
      provider: NotificationType.SMS,
      message: 'SMS notification delivered',
    });
  });

  it('should return a failure result when the provider call fails', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    const result = await strategy.send({
      type: NotificationType.SMS,
      recipient: 'user@example.com',
      message: 'Test SMS message',
    });

    expect(result).toEqual({
      success: false,
      provider: NotificationType.SMS,
      error: 'Simulated provider failure',
    });
  });
});
