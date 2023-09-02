import { NextFunction, Request, Response } from 'express';
import { User } from 'user/user.entity';

import { HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { isAuthenticated, UserRequest } from './app.middleware';
import { UserService } from './user/user.service';

describe('isAuthenticated Middleware', () => {
  let middleware: isAuthenticated;
  let mockJwtService: JwtService;
  let mockUserService: UserService;
  let mockRequest: Request;
  let mockResponse: Response;
  let mockNextFunction: NextFunction;

  beforeEach(() => {
    mockJwtService = {
      verify: jest.fn(),
    } as unknown as JwtService;

    mockUserService = {
      findByEmail: jest.fn(),
    } as unknown as UserService;

    mockRequest = {
      headers: {},
    } as unknown as Request;

    mockResponse = {} as unknown as Response;

    mockNextFunction = jest.fn();

    middleware = new isAuthenticated(mockJwtService, mockUserService);
  });

  it('should set user on request object if a valid token is provided', async () => {
    const mockUser = { id: 1, email: 'test@example.com' } as User;

    mockRequest.headers.authorization = 'Bearer valid-token';
    (mockJwtService.verify as jest.Mock).mockResolvedValue({
      email: mockUser.email,
    });
    (mockUserService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

    await middleware.use(
      mockRequest as UserRequest,
      mockResponse,
      mockNextFunction,
    );

    expect(mockUserService.findByEmail).toHaveBeenCalledWith(mockUser.email);
    expect(mockNextFunction).toHaveBeenCalled();
  });

  it('should throw UNAUTHORIZED if the token is valid but user not found', async () => {
    mockRequest.headers.authorization = 'Bearer valid-token';
    (mockJwtService.verify as jest.Mock).mockResolvedValue({
      email: 'nonexistent@example.com',
    });
    (mockUserService.findByEmail as jest.Mock).mockResolvedValue(null);

    await expect(() =>
      middleware.use(
        mockRequest as UserRequest,
        mockResponse,
        mockNextFunction,
      ),
    ).rejects.toThrowError(HttpException);
    expect(mockNextFunction).not.toHaveBeenCalled();
  });

  it('should throw NOT_FOUND if no token is found in the request', async () => {
    await expect(() =>
      middleware.use(
        mockRequest as UserRequest,
        mockResponse,
        mockNextFunction,
      ),
    ).rejects.toThrowError(HttpException);
    expect(mockNextFunction).not.toHaveBeenCalled();
  });

  it('should throw UNAUTHORIZED if an invalid token is provided', async () => {
    mockRequest.headers.authorization = 'Bearer invalid-token';
    (mockJwtService.verify as jest.Mock).mockResolvedValue(
      new Error('Invalid token'),
    );

    await expect(() =>
      middleware.use(
        mockRequest as UserRequest,
        mockResponse,
        mockNextFunction,
      ),
    ).rejects.toThrowError(HttpException);
    expect(mockNextFunction).not.toHaveBeenCalled();
  });
});
