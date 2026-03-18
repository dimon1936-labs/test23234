import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GlobalExceptionFilter } from './http-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: any;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockRequest = { method: 'GET', url: '/api/tasks' };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };
  });

  it('should handle HttpException', () => {
    const exception = new NotFoundException('Task not found');
    filter.catch(exception, mockHost as any);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        path: '/api/tasks',
      }),
    );
  });

  it('should handle Prisma P2025 (not found)', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('Not found', {
      code: 'P2025',
      clientVersion: '5.0.0',
    });
    filter.catch(exception, mockHost as any);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Resource not found' }),
    );
  });

  it('should handle Prisma P2002 (unique constraint)', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('Unique', {
      code: 'P2002',
      clientVersion: '5.0.0',
    });
    filter.catch(exception, mockHost as any);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Resource already exists' }),
    );
  });

  it('should handle Prisma P2003 (foreign key constraint)', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('FK', {
      code: 'P2003',
      clientVersion: '5.0.0',
    });
    filter.catch(exception, mockHost as any);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Related resource not found' }),
    );
  });

  it('should handle unknown Prisma errors as BAD_REQUEST', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('Unknown', {
      code: 'P2999',
      clientVersion: '5.0.0',
    });
    filter.catch(exception, mockHost as any);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should handle generic errors as 500', () => {
    filter.catch(new Error('Unexpected'), mockHost as any);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Internal server error' }),
    );
  });

  it('should include timestamp in response', () => {
    filter.catch(new Error('test'), mockHost as any);

    const response = mockResponse.json.mock.calls[0][0];
    expect(response.timestamp).toBeDefined();
    expect(new Date(response.timestamp).getTime()).not.toBeNaN();
  });
});
