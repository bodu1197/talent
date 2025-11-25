import { randomBytes } from 'node:crypto';

/**
 * Fisher-Yates shuffle with cryptographically secure random
 * @param array Array to shuffle
 * @returns Shuffled array (in-place)
 */
export function cryptoShuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const buffer = randomBytes(4);
    const randomValue = buffer.readUInt32BE(0) / 0xffffffff;
    const j = Math.floor(randomValue * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Partition array into two groups based on predicate
 * @param array Source array
 * @param predicate Function to determine group
 * @returns Tuple of [matching, non-matching]
 */
export function partitionArray<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const matching: T[] = [];
  const nonMatching: T[] = [];

  for (const item of array) {
    if (predicate(item)) {
      matching.push(item);
    } else {
      nonMatching.push(item);
    }
  }

  return [matching, nonMatching];
}
