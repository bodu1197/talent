import { describe, it, expect } from 'vitest';
import { cryptoShuffleArray, partitionArray } from '@/lib/utils/crypto-shuffle';

describe('crypto-shuffle utilities', () => {
  describe('cryptoShuffleArray', () => {
    it('should return the same array reference (in-place)', () => {
      const original = [1, 2, 3, 4, 5];
      const result = cryptoShuffleArray(original);
      expect(result).toBe(original);
    });

    it('should preserve all elements after shuffle', () => {
      const original = [1, 2, 3, 4, 5];
      const copy = [...original];
      cryptoShuffleArray(original);

      expect(original.length).toBe(copy.length);
      expect(original.sort()).toEqual(copy.sort());
    });

    it('should handle empty array', () => {
      const empty: number[] = [];
      const result = cryptoShuffleArray(empty);
      expect(result).toEqual([]);
    });

    it('should handle single element array', () => {
      const single = [42];
      const result = cryptoShuffleArray(single);
      expect(result).toEqual([42]);
    });

    it('should handle array with string elements', () => {
      const strings = ['a', 'b', 'c', 'd'];
      const copy = [...strings];
      cryptoShuffleArray(strings);

      expect(strings.length).toBe(copy.length);
      expect(strings.sort()).toEqual(copy.sort());
    });

    it('should handle array with object elements', () => {
      const objects = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const copy = [...objects];
      cryptoShuffleArray(objects);

      expect(objects.length).toBe(copy.length);
      // Objects should be the same references, just reordered
      for (const obj of copy) {
        expect(objects).toContain(obj);
      }
    });

    it('should produce different orderings over multiple calls', () => {
      // With a large enough array, consecutive shuffles should differ
      const orderings = new Set<string>();

      for (let i = 0; i < 10; i++) {
        const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        cryptoShuffleArray(arr);
        orderings.add(arr.join(','));
      }

      // With cryptographic randomness, we should get multiple different orderings
      expect(orderings.size).toBeGreaterThan(1);
    });
  });

  describe('partitionArray', () => {
    it('should partition numbers into even and odd', () => {
      const numbers = [1, 2, 3, 4, 5, 6];
      const [even, odd] = partitionArray(numbers, n => n % 2 === 0);

      expect(even).toEqual([2, 4, 6]);
      expect(odd).toEqual([1, 3, 5]);
    });

    it('should partition empty array', () => {
      const empty: number[] = [];
      const [matching, nonMatching] = partitionArray(empty, () => true);

      expect(matching).toEqual([]);
      expect(nonMatching).toEqual([]);
    });

    it('should partition when all match', () => {
      const numbers = [2, 4, 6, 8];
      const [even, odd] = partitionArray(numbers, n => n % 2 === 0);

      expect(even).toEqual([2, 4, 6, 8]);
      expect(odd).toEqual([]);
    });

    it('should partition when none match', () => {
      const numbers = [1, 3, 5, 7];
      const [even, odd] = partitionArray(numbers, n => n % 2 === 0);

      expect(even).toEqual([]);
      expect(odd).toEqual([1, 3, 5, 7]);
    });

    it('should partition strings by length', () => {
      const strings = ['a', 'bb', 'ccc', 'dd', 'e'];
      const [short, long] = partitionArray(strings, s => s.length <= 1);

      expect(short).toEqual(['a', 'e']);
      expect(long).toEqual(['bb', 'ccc', 'dd']);
    });

    it('should partition objects by property', () => {
      const items = [
        { name: 'a', active: true },
        { name: 'b', active: false },
        { name: 'c', active: true },
      ];
      const [active, inactive] = partitionArray(items, item => item.active);

      expect(active).toHaveLength(2);
      expect(inactive).toHaveLength(1);
      expect(active.every(i => i.active)).toBe(true);
      expect(inactive.every(i => !i.active)).toBe(true);
    });

    it('should preserve order within partitions', () => {
      const numbers = [5, 2, 8, 1, 4, 3];
      const [even, odd] = partitionArray(numbers, n => n % 2 === 0);

      // Order should be preserved within each partition
      expect(even).toEqual([2, 8, 4]);
      expect(odd).toEqual([5, 1, 3]);
    });

    it('should not modify original array', () => {
      const original = [1, 2, 3, 4, 5];
      const copy = [...original];
      partitionArray(original, n => n > 3);

      expect(original).toEqual(copy);
    });
  });
});
