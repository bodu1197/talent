import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateRandomNickname,
  generateUniqueNickname,
  generateProfileImage,
  generateProfileImageWithStyle,
} from '@/lib/utils/nickname-generator';

// Mock crypto.getRandomValues
const mockGetRandomValues = vi.fn();
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: mockGetRandomValues.mockImplementation((array: Uint32Array) => {
      array[0] = Math.floor(Math.random() * 4294967296);
      return array;
    }),
  },
});

describe('nickname-generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateRandomNickname', () => {
    it('should generate a non-empty nickname', () => {
      const nickname = generateRandomNickname();
      expect(nickname).toBeTruthy();
      expect(typeof nickname).toBe('string');
    });

    it('should generate nicknames in Korean format', () => {
      const nickname = generateRandomNickname();
      // Korean nickname should contain at least 2 Korean characters
      const koreanRegex = /[가-힣]{2,}/;
      expect(koreanRegex.test(nickname)).toBe(true);
    });

    it('should generate different nicknames on multiple calls', () => {
      const nicknames = new Set<string>();
      for (let i = 0; i < 10; i++) {
        nicknames.add(generateRandomNickname());
      }
      // With random generation, should get at least some unique values
      expect(nicknames.size).toBeGreaterThan(1);
    });
  });

  describe('generateUniqueNickname', () => {
    it('should generate a nickname with numbers', () => {
      const nickname = generateUniqueNickname();
      expect(nickname).toBeTruthy();
      // Should contain numbers at the end
      expect(/\d+$/.test(nickname)).toBe(true);
    });

    it('should include base nickname plus number', () => {
      const nickname = generateUniqueNickname();
      // Korean part followed by numbers
      expect(/[가-힣]+\d+/.test(nickname)).toBe(true);
    });
  });

  describe('generateProfileImage', () => {
    it('should generate a DiceBear URL with the nickname as seed', () => {
      const nickname = '테스트닉네임';
      const url = generateProfileImage(nickname);

      expect(url).toContain('api.dicebear.com');
      expect(url).toContain('avataaars');
      expect(url).toContain(encodeURIComponent(nickname));
    });

    it('should include PNG format in URL', () => {
      const url = generateProfileImage('test');
      expect(url).toContain('/png');
    });

    it('should include background color options', () => {
      const url = generateProfileImage('test');
      expect(url).toContain('backgroundColor');
    });
  });

  describe('generateProfileImageWithStyle', () => {
    it('should generate URL with avataaars style by default', () => {
      const url = generateProfileImageWithStyle('test');
      expect(url).toContain('avataaars');
    });

    it('should generate URL with bottts style', () => {
      const url = generateProfileImageWithStyle('test', 'bottts');
      expect(url).toContain('bottts');
    });

    it('should generate URL with initials style', () => {
      const url = generateProfileImageWithStyle('test', 'initials');
      expect(url).toContain('initials');
    });

    it('should generate URL with shapes style', () => {
      const url = generateProfileImageWithStyle('test', 'shapes');
      expect(url).toContain('shapes');
    });

    it('should include seed parameter', () => {
      const nickname = 'myNickname';
      const url = generateProfileImageWithStyle(nickname);
      expect(url).toContain(`seed=${encodeURIComponent(nickname)}`);
    });
  });
});
