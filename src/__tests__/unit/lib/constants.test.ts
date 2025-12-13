import { describe, it, expect } from 'vitest';
import { AI_TOOLS, CATEGORIES, PACKAGE_TYPES, ORDER_STATUS, SERVICE_STATUS } from '@/lib/constants';

describe('constants', () => {
  describe('AI_TOOLS', () => {
    it('should have IMAGE tools', () => {
      expect(AI_TOOLS.IMAGE).toBeDefined();
      expect(AI_TOOLS.IMAGE.length).toBeGreaterThan(0);
      expect(AI_TOOLS.IMAGE).toContain('Midjourney');
    });

    it('should have VIDEO tools', () => {
      expect(AI_TOOLS.VIDEO).toBeDefined();
      expect(AI_TOOLS.VIDEO).toContain('Runway');
    });

    it('should have WRITING tools', () => {
      expect(AI_TOOLS.WRITING).toBeDefined();
      expect(AI_TOOLS.WRITING).toContain('ChatGPT');
      expect(AI_TOOLS.WRITING).toContain('Claude');
    });

    it('should have CODING tools', () => {
      expect(AI_TOOLS.CODING).toBeDefined();
      expect(AI_TOOLS.CODING).toContain('GitHub Copilot');
    });

    it('should have AUDIO tools', () => {
      expect(AI_TOOLS.AUDIO).toBeDefined();
      expect(AI_TOOLS.AUDIO).toContain('ElevenLabs');
    });

    it('should have MUSIC tools', () => {
      expect(AI_TOOLS.MUSIC).toBeDefined();
      expect(AI_TOOLS.MUSIC).toContain('Suno AI');
    });
  });

  describe('CATEGORIES', () => {
    it('should have at least one category', () => {
      expect(CATEGORIES.length).toBeGreaterThan(0);
    });

    it('should have AI and non-AI categories', () => {
      const aiCategories = CATEGORIES.filter((c) => c.is_ai);
      const nonAiCategories = CATEGORIES.filter((c) => !c.is_ai);

      expect(aiCategories.length).toBeGreaterThan(0);
      expect(nonAiCategories.length).toBeGreaterThan(0);
    });

    it('should have required fields for each category', () => {
      CATEGORIES.forEach((category) => {
        expect(category.id).toBeDefined();
        expect(category.name).toBeDefined();
        expect(category.slug).toBeDefined();
        expect(category.is_active).toBeDefined();
      });
    });

    it('should have AI Image/Design category with children', () => {
      const aiImageDesign = CATEGORIES.find((c) => c.id === 'ai-image-design');
      expect(aiImageDesign).toBeDefined();
      expect(aiImageDesign?.children).toBeDefined();
      expect(aiImageDesign?.children?.length).toBeGreaterThan(0);
    });
  });

  describe('PACKAGE_TYPES', () => {
    it('should have all package types', () => {
      expect(PACKAGE_TYPES.BASIC).toBe('basic');
      expect(PACKAGE_TYPES.STANDARD).toBe('standard');
      expect(PACKAGE_TYPES.PREMIUM).toBe('premium');
      expect(PACKAGE_TYPES.CUSTOM).toBe('custom');
    });
  });

  describe('ORDER_STATUS', () => {
    it('should have all order statuses', () => {
      expect(ORDER_STATUS.PENDING).toBe('pending');
      expect(ORDER_STATUS.ACCEPTED).toBe('accepted');
      expect(ORDER_STATUS.IN_PROGRESS).toBe('in_progress');
      expect(ORDER_STATUS.DELIVERED).toBe('delivered');
      expect(ORDER_STATUS.COMPLETED).toBe('completed');
      expect(ORDER_STATUS.CANCELLED).toBe('cancelled');
      expect(ORDER_STATUS.REFUNDED).toBe('refunded');
    });
  });

  describe('SERVICE_STATUS', () => {
    it('should have all service statuses', () => {
      expect(SERVICE_STATUS.DRAFT).toBe('draft');
      expect(SERVICE_STATUS.PENDING).toBe('pending');
      expect(SERVICE_STATUS.ACTIVE).toBe('active');
      expect(SERVICE_STATUS.INACTIVE).toBe('inactive');
      expect(SERVICE_STATUS.REJECTED).toBe('rejected');
    });
  });
});
