import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { UserDepositDto } from '../dto/user-deposit.dto';
import { UserSigninDto } from '../dto/user-signin.dto';
import { UserSignupDto } from '../dto/user-signup.dto';
import { UserController } from '../user.controller';
import { User } from '../user.entity';
import { UserService } from '../user.service';

const mockJwtService = {
  sign: jest.fn(),
};

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            signup: jest.fn(),
            signin: jest.fn(),
            deposit: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userController = module.get<UserController>(UserController);
  });

  describe('Signup', () => {
    it('should create a new user', async () => {
      const userSignupDto: UserSignupDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const createdUser: User = {
        id: 1,
        email: userSignupDto.email,
        password: 'hashed-password',
        walletBalance: 0,
        items: [],
        bids: [],
      };

      jest.spyOn(userService, 'signup').mockResolvedValue(createdUser);

      const result = await userController.Signup(userSignupDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(userSignupDto.email);
    });

    it('should throw HttpException if user already exists', async () => {
      const userSignupDto: UserSignupDto = {
        email: 'existing@example.com',
        password: 'password',
      };

      jest
        .spyOn(userService, 'signup')
        .mockRejectedValue(new HttpException('Email already exists', HttpStatus.CONFLICT));

      await expect(userController.Signup(userSignupDto)).rejects.toThrowError(HttpException);
    });
  });

  describe('Signin', () => {
    it('should sign in a user', async () => {
      const userSigninDto: UserSigninDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const user: User = {
        id: 1,
        email: userSigninDto.email,
        password: 'hashed-password',
        walletBalance: 0,
        items: [],
        bids: [],
      };

      const token = 'mocked-token';

      jest.spyOn(userService, 'signin').mockResolvedValue({ ...user, token });

      const result = await userController.Signin(userSigninDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(userSigninDto.email);
      expect(result.token).toBe(token);
    });

    it('should throw HttpException if credentials are incorrect', async () => {
      const userSigninDto: UserSigninDto = {
        email: 'test@example.com',
        password: 'incorrect-password',
      };

      jest
        .spyOn(userService, 'signin')
        .mockRejectedValue(new HttpException('Incorrect username or password', HttpStatus.UNAUTHORIZED));

      await expect(userController.Signin(userSigninDto)).rejects.toThrowError(HttpException);
    });
  });

  describe('Deposit', () => {
    it('should deposit to the user', async () => {
      const user: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed-password',
        walletBalance: 50,
        items: [],
        bids: [],
      };

      const depositDto: UserDepositDto = { amount: 50 };

      const updatedUser: User = {
        ...user,
        walletBalance: user.walletBalance + depositDto.amount,
      };

      jest.spyOn(userService, 'deposit').mockResolvedValue(updatedUser);

      const userRequest = { user } as any; // Mock the UserRequest object
      const result = await userController.Deposit(userRequest, depositDto);

      expect(result).toBeDefined();
      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
      expect(result.walletBalance).toBe(updatedUser.walletBalance);
    });
  });
});
