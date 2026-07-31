import { PushStrategy } from './push.strategy';
import { NotificationType } from '../../enums/notification-type.enum';

describe('PushStrategy', () => {
  const strategy = new PushStrategy();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return a success result when the provider call succeeds', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(Math, 'random').mockReturnValue(0.9);

    const result = await strategy.send({
      type: NotificationType.PUSH,
      recipient: 'user@example.com',
      message: 'Test push message',
    });

    expect(logSpy).toHaveBeenCalledWith(
      'Sending PUSH notification to user@example.com',
      expect.objectContaining({
        recipient: 'user@example.com',
        type: NotificationType.PUSH,
      }),
    );
    expect(result).toEqual({
      success: true,
      provider: NotificationType.PUSH,
      message: 'PUSH notification delivered',
    });
  });

  it('should return a failure result when the provider call fails', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    const result = await strategy.send({
      type: NotificationType.PUSH,
      recipient: 'user@example.com',
      message: 'Test push message',
    });

    expect(result).toEqual({
      success: false,
      provider: NotificationType.PUSH,
      error: 'Simulated provider failure',
    });
  });
});