import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message } = this.resolveException(exception);

    this.logger.error(
      `${request.method} ${request.url} ${status}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(typeof message === 'string' ? { message } : message),
    });
  }

  private resolveException(exception: unknown): { status: number; message: string | object } {
    if (exception instanceof HttpException) {
      return {
        status: exception.getStatus(),
        message: exception.getResponse(),
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2025':
          return { status: HttpStatus.NOT_FOUND, message: 'Resource not found' };
        case 'P2002':
          return { status: HttpStatus.CONFLICT, message: 'Resource already exists' };
        case 'P2003':
          return { status: HttpStatus.BAD_REQUEST, message: 'Related resource not found' };
        default:
          return { status: HttpStatus.BAD_REQUEST, message: 'Database operation failed' };
      }
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }
}
