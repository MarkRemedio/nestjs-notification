import { EmailStrategy } from './email.strategy';
import { NotificationType } from '../../enums/notification-type.enum';

describe('EmailStrategy', () => {
  const strategy = new EmailStrategy();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return a success result when the provider call succeeds', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(Math, 'random').mockReturnValue(0.9);

    const result = await strategy.send({
      type: NotificationType.EMAIL,
      recipient: 'user@example.com',
      message: 'Test email message',
    });

    expect(logSpy).toHaveBeenCalledWith(
      'Sending EMAIL to user@example.com',
      expect.objectContaining({
        recipient: 'user@example.com',
        type: NotificationType.EMAIL,
      }),
    );
    expect(result).toEqual({
      success: true,
      provider: NotificationType.EMAIL,
      message: 'EMAIL notification delivered',
    });
  });

  it('should return a failure result when the provider call fails', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    const result = await strategy.send({
      type: NotificationType.EMAIL,
      recipient: 'user@example.com',
      message: 'Test email message',
    });

    expect(result).toEqual({
      success: false,
      provider: NotificationType.EMAIL,
      error: 'Simulated provider failure',
    });
  });
});
