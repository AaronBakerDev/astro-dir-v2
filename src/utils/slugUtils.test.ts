import { describe, it, expect } from 'vitest';
import { extractIdFromSlug, generateSlug } from './slugUtils';

describe('extractIdFromSlug', () => {
  it('should extract ID from valid slug', () => {
    expect(extractIdFromSlug('sweeps-luck-1201')).toBe(1201);
    expect(extractIdFromSlug('some-business-name-42')).toBe(42);
  });

  it('should handle invalid slugs', () => {
    expect(extractIdFromSlug('')).toBeNull();
    expect(extractIdFromSlug(undefined)).toBeNull();
    expect(extractIdFromSlug('no-id-here')).toBeNull();
    expect(extractIdFromSlug('invalid-123-456')).toBe(456);
  });
});

describe('generateSlug', () => {
  it('should generate valid slugs', () => {
    expect(generateSlug('Sweeps Luck', 1201)).toBe('sweeps-luck-1201');
    expect(generateSlug('Some Business Name!', 42)).toBe(
      'some-business-name-42'
    );
  });

  it('should handle special characters', () => {
    expect(generateSlug('Café & Restaurant', 123)).toBe('cafe-restaurant-123');
    expect(generateSlug('   Spaces   ', 456)).toBe('spaces-456');
  });
});
