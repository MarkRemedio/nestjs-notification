import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCommonResponse } from '../dto/error.dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.log('Exception caught by AllExceptionsFilter:', exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : 500;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    const error : ErrorCommonResponse = {
        statusCode: status,
        timestamp: new Date(),
        path: request.url,
        message: typeof message === 'string' ? message : (message as any).message || 'Internal server error',
    };

    response.status(status).json(error);
  }
}