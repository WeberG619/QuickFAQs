const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authService = require('../../src/services/authService');
const User = require('../../src/models/User');
const { ValidationError } = require('../../src/utils/errors');

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    const mockUserData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    };

    it('should create a new user successfully', async () => {
      const hashedPassword = 'hashedPassword123';
      bcrypt.hash.mockResolvedValue(hashedPassword);

      const mockSavedUser = {
        _id: 'userId123',
        email: mockUserData.email,
        name: mockUserData.name,
        role: 'user'
      };

      jest.spyOn(User.prototype, 'save')
        .mockResolvedValue(mockSavedUser);

      const result = await authService.registerUser(mockUserData);

      expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 10);
      expect(result).toEqual(mockSavedUser);
    });

    it('should throw error if user already exists', async () => {
      jest.spyOn(User, 'findOne')
        .mockResolvedValue({ email: mockUserData.email });

      await expect(authService.registerUser(mockUserData))
        .rejects
        .toThrow('User already exists with this email');
    });

    it('should throw error if required fields are missing', async () => {
      const invalidUserData = {
        email: 'test@example.com'
        // missing password and name
      };

      await expect(authService.registerUser(invalidUserData))
        .rejects
        .toThrow(ValidationError);
    });
  });

  describe('loginUser', () => {
    const mockCredentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    const mockUser = {
      _id: 'userId123',
      email: mockCredentials.email,
      password: 'hashedPassword123',
      name: 'Test User',
      role: 'user'
    };

    it('should login user successfully with correct credentials', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockToken123');

      const result = await authService.loginUser(mockCredentials);

      expect(User.findOne).toHaveBeenCalledWith({ email: mockCredentials.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(mockCredentials.password, mockUser.password);
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('token', 'mockToken123');
      expect(result).toHaveProperty('user');
    });

    it('should throw error if user not found', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      await expect(authService.loginUser(mockCredentials))
        .rejects
        .toThrow('Invalid credentials');
    });

    it('should throw error if password is incorrect', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(authService.loginUser(mockCredentials))
        .rejects
        .toThrow('Invalid credentials');
    });
  });

  describe('verifyToken', () => {
    const mockToken = 'validToken123';
    const mockDecodedToken = {
      userId: 'userId123',
      role: 'user'
    };

    it('should verify token successfully', async () => {
      jwt.verify.mockReturnValue(mockDecodedToken);
      jest.spyOn(User, 'findById').mockResolvedValue({
        _id: mockDecodedToken.userId,
        role: mockDecodedToken.role
      });

      const result = await authService.verifyToken(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
      expect(result).toHaveProperty('userId', mockDecodedToken.userId);
      expect(result).toHaveProperty('role', mockDecodedToken.role);
    });

    it('should throw error if token is invalid', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.verifyToken(mockToken))
        .rejects
        .toThrow('Invalid token');
    });

    it('should throw error if user not found', async () => {
      jwt.verify.mockReturnValue(mockDecodedToken);
      jest.spyOn(User, 'findById').mockResolvedValue(null);

      await expect(authService.verifyToken(mockToken))
        .rejects
        .toThrow('User not found');
    });
  });

  describe('changePassword', () => {
    const mockUserId = 'userId123';
    const mockPasswords = {
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword123'
    };

    const mockUser = {
      _id: mockUserId,
      password: 'hashedOldPassword',
      save: jest.fn()
    };

    it('should change password successfully', async () => {
      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('hashedNewPassword');
      mockUser.save.mockResolvedValue(mockUser);

      await authService.changePassword(mockUserId, mockPasswords);

      expect(bcrypt.compare).toHaveBeenCalledWith(mockPasswords.currentPassword, mockUser.password);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockPasswords.newPassword, 10);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw error if current password is incorrect', async () => {
      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(authService.changePassword(mockUserId, mockPasswords))
        .rejects
        .toThrow('Current password is incorrect');
    });

    it('should throw error if user not found', async () => {
      jest.spyOn(User, 'findById').mockResolvedValue(null);

      await expect(authService.changePassword(mockUserId, mockPasswords))
        .rejects
        .toThrow('User not found');
    });
  });
});
