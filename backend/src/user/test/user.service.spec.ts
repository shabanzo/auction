import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';

import { HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { User } from '../user.entity';
import { UserService } from '../user.service';

const mockUserRepository = {
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

const userDto = {
  email: 'test@example.com',
  password: 'password',
};

const user = {
  id: 1,
  email: userDto.email,
  password: 'hashed-password',
};

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('signup', () => {
    it('should create a new user and return user data', async () => {
      const salt = 'mocked-salt';
      const hashedPassword = 'hashed-password';
      const newUser = {
        ...user,
        walletBalance: 0,
      };

      mockUserRepository.findOneBy.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue(salt);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockResolvedValue(newUser);

      const result = await userService.signup(userDto);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: userDto.email,
      });
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(userDto.password, salt);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: userDto.email,
        password: hashedPassword,
        walletBalance: 0,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual({
        id: newUser.id,
        email: newUser.email,
        walletBalance: newUser.walletBalance,
      });
    });

    it('should throw HttpException if email already exists', async () => {
      mockUserRepository.findOneBy.mockResolvedValue({ email: userDto.email });

      await expect(userService.signup(userDto)).rejects.toThrowError(
        HttpException,
      );
    });
  });

  describe('signin', () => {
    it('should sign in and return a user token', async () => {
      const token = 'mocked-token';

      mockUserRepository.findOneBy.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(token);

      const result = await userService.signin(userDto);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: userDto.email,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        userDto.password,
        user.password,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: userDto.email,
      });
      expect(result).toEqual({
        email: userDto.email,
        token,
      });
    });

    it('should throw HttpException if credentials are incorrect', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(userService.signin(userDto)).rejects.toThrowError(
        HttpException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should find and return a user by email', async () => {
      const foundedUser = {
        ...user,
        walletBalance: 100,
      };

      mockUserRepository.findOneBy.mockResolvedValue(foundedUser);

      const result = await userService.findByEmail(user.email);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: user.email,
      });
      expect(result).toEqual(foundedUser);
    });

    it('should return null if user is not found by email', async () => {
      const email = 'nonexistent@example.com';

      mockUserRepository.findOneBy.mockResolvedValue(null);

      const result = await userService.findByEmail(email);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email });
      expect(result).toBeNull();
    });
  });

  describe('deposit', () => {
    it('should deposit an amount to user wallet', async () => {
      const userReq = {
        ...user,
        walletBalance: 100,
        items: [],
        bids: [],
      };
      const depositDto = {
        amount: 50,
      };

      const updatedUser = {
        ...userReq,
        walletBalance: userReq.walletBalance + depositDto.amount,
      };

      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await userService.deposit(userReq, depositDto);

      expect(mockUserRepository.save).toHaveBeenCalledWith(updatedUser);
      expect(result).toEqual({
        id: updatedUser.id,
        email: updatedUser.email,
        walletBalance: updatedUser.walletBalance,
      });
    });
  });
});
