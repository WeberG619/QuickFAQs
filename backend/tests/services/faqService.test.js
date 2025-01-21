const mongoose = require('mongoose');
const faqService = require('../../src/services/faqService');
const FAQ = require('../../src/models/FAQ');
const analyticsService = require('../../src/services/analyticsService');
const { ValidationError } = require('../../src/utils/errors');

jest.mock('../../src/services/analyticsService');

describe('FAQService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createFAQ', () => {
    const mockFAQData = {
      question: 'Test question?',
      answer: 'Test answer',
      category: 'Test Category',
      tags: ['test', 'faq'],
      createdBy: 'userId123'
    };

    it('should create FAQ successfully', async () => {
      const mockSavedFAQ = {
        _id: 'faqId123',
        ...mockFAQData,
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(FAQ.prototype, 'save')
        .mockResolvedValue(mockSavedFAQ);

      const result = await faqService.createFAQ(mockFAQData);

      expect(result).toEqual(mockSavedFAQ);
      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        mockFAQData.createdBy,
        'FAQ_CREATED',
        expect.any(Object)
      );
    });

    it('should throw error if required fields are missing', async () => {
      const invalidFAQData = {
        question: 'Test question?'
        // missing answer and category
      };

      await expect(faqService.createFAQ(invalidFAQData))
        .rejects
        .toThrow(ValidationError);
    });
  });

  describe('getFAQ', () => {
    const mockFAQId = 'faqId123';
    const mockFAQ = {
      _id: mockFAQId,
      question: 'Test question?',
      answer: 'Test answer',
      category: 'Test Category',
      status: 'published'
    };

    it('should return FAQ by ID', async () => {
      jest.spyOn(FAQ, 'findById')
        .mockResolvedValue(mockFAQ);

      const result = await faqService.getFAQ(mockFAQId);

      expect(result).toEqual(mockFAQ);
    });

    it('should throw error if FAQ not found', async () => {
      jest.spyOn(FAQ, 'findById')
        .mockResolvedValue(null);

      await expect(faqService.getFAQ(mockFAQId))
        .rejects
        .toThrow('FAQ not found');
    });
  });

  describe('updateFAQ', () => {
    const mockFAQId = 'faqId123';
    const mockUpdateData = {
      question: 'Updated question?',
      answer: 'Updated answer'
    };

    it('should update FAQ successfully', async () => {
      const mockUpdatedFAQ = {
        _id: mockFAQId,
        ...mockUpdateData,
        category: 'Test Category',
        status: 'published',
        updatedAt: new Date()
      };

      jest.spyOn(FAQ, 'findByIdAndUpdate')
        .mockResolvedValue(mockUpdatedFAQ);

      const result = await faqService.updateFAQ(mockFAQId, mockUpdateData);

      expect(result).toEqual(mockUpdatedFAQ);
      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        expect.any(String),
        'FAQ_UPDATED',
        expect.any(Object)
      );
    });

    it('should throw error if FAQ not found', async () => {
      jest.spyOn(FAQ, 'findByIdAndUpdate')
        .mockResolvedValue(null);

      await expect(faqService.updateFAQ(mockFAQId, mockUpdateData))
        .rejects
        .toThrow('FAQ not found');
    });
  });

  describe('deleteFAQ', () => {
    const mockFAQId = 'faqId123';

    it('should delete FAQ successfully', async () => {
      const mockDeletedFAQ = {
        _id: mockFAQId,
        status: 'deleted'
      };

      jest.spyOn(FAQ, 'findByIdAndDelete')
        .mockResolvedValue(mockDeletedFAQ);

      await faqService.deleteFAQ(mockFAQId);

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        expect.any(String),
        'FAQ_DELETED',
        expect.any(Object)
      );
    });

    it('should throw error if FAQ not found', async () => {
      jest.spyOn(FAQ, 'findByIdAndDelete')
        .mockResolvedValue(null);

      await expect(faqService.deleteFAQ(mockFAQId))
        .rejects
        .toThrow('FAQ not found');
    });
  });

  describe('searchFAQs', () => {
    const mockQuery = {
      search: 'test',
      category: 'Test Category',
      tags: ['test'],
      page: 1,
      limit: 10
    };

    it('should search FAQs successfully', async () => {
      const mockFAQs = [
        {
          _id: 'faqId123',
          question: 'Test question 1?',
          answer: 'Test answer 1',
          category: 'Test Category'
        },
        {
          _id: 'faqId124',
          question: 'Test question 2?',
          answer: 'Test answer 2',
          category: 'Test Category'
        }
      ];

      jest.spyOn(FAQ, 'find').mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockFAQs)
      });

      jest.spyOn(FAQ, 'countDocuments')
        .mockResolvedValue(mockFAQs.length);

      const result = await faqService.searchFAQs(mockQuery);

      expect(result.faqs).toEqual(mockFAQs);
      expect(result.total).toBe(mockFAQs.length);
      expect(result.page).toBe(mockQuery.page);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('updateFAQStatus', () => {
    const mockFAQId = 'faqId123';
    const mockStatus = 'archived';

    it('should update FAQ status successfully', async () => {
      const mockUpdatedFAQ = {
        _id: mockFAQId,
        status: mockStatus,
        updatedAt: new Date()
      };

      jest.spyOn(FAQ, 'findByIdAndUpdate')
        .mockResolvedValue(mockUpdatedFAQ);

      const result = await faqService.updateFAQStatus(mockFAQId, mockStatus);

      expect(result).toEqual(mockUpdatedFAQ);
      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        expect.any(String),
        'FAQ_STATUS_UPDATED',
        expect.any(Object)
      );
    });

    it('should throw error if status is invalid', async () => {
      await expect(faqService.updateFAQStatus(mockFAQId, 'invalid_status'))
        .rejects
        .toThrow(ValidationError);
    });
  });

  describe('recordFAQView', () => {
    const mockFAQId = 'faqId123';
    const mockUserId = 'userId123';

    it('should record FAQ view successfully', async () => {
      const mockUpdatedFAQ = {
        _id: mockFAQId,
        viewCount: 1,
        lastViewedAt: new Date()
      };

      jest.spyOn(FAQ, 'findByIdAndUpdate')
        .mockResolvedValue(mockUpdatedFAQ);

      await faqService.recordFAQView(mockFAQId, mockUserId);

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        mockUserId,
        'FAQ_VIEWED',
        expect.any(Object)
      );
    });
  });

  describe('voteFAQ', () => {
    const mockFAQId = 'faqId123';
    const mockUserId = 'userId123';
    const mockVote = { helpful: true };

    it('should record vote successfully', async () => {
      const mockUpdatedFAQ = {
        _id: mockFAQId,
        helpfulVotes: 1,
        totalVotes: 1
      };

      jest.spyOn(FAQ, 'findByIdAndUpdate')
        .mockResolvedValue(mockUpdatedFAQ);

      const result = await faqService.voteFAQ(mockFAQId, mockUserId, mockVote);

      expect(result).toEqual(mockUpdatedFAQ);
      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        mockUserId,
        'FAQ_VOTED',
        expect.any(Object)
      );
    });

    it('should throw error if vote is invalid', async () => {
      await expect(faqService.voteFAQ(mockFAQId, mockUserId, {}))
        .rejects
        .toThrow(ValidationError);
    });
  });
});
