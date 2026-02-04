import { describe, it, expect, beforeEach } from 'vitest';
import { getLevelFromXP, getXPForLevel, getProgressInLevel } from '../lib/data';

describe('Gamification System', () => {
  describe('getLevelFromXP', () => {
    it('should return level 1 for 0 XP', () => {
      expect(getLevelFromXP(0)).toBe(1);
    });

    it('should return level 1 for 100 XP', () => {
      // Level 1 requires 200 XP, so 100 XP is still level 1
      expect(getLevelFromXP(100)).toBe(1);
    });

    it('should return level 2 for 200 XP', () => {
      // Level 1 requires 200 XP, so at 200 XP we reach level 2
      expect(getLevelFromXP(200)).toBe(2);
    });

    it('should return level 3 for 1000 XP', () => {
      // Level 1: 200 XP, Level 2: 400 XP, Level 3: 600 XP
      // Total for level 3: 200 + 400 = 600 XP
      // 1000 XP = 600 (L1+L2) + 400 (L3) = level 3
      expect(getLevelFromXP(1000)).toBe(3);
    });
  });

  describe('getXPForLevel', () => {
    it('should return 200 XP for level 1', () => {
      expect(getXPForLevel(1)).toBe(200);
    });

    it('should return 400 XP for level 2', () => {
      expect(getXPForLevel(2)).toBe(400);
    });

    it('should return 600 XP for level 3', () => {
      expect(getXPForLevel(3)).toBe(600);
    });

    it('should return 800 XP for level 4', () => {
      expect(getXPForLevel(4)).toBe(800);
    });
  });

  describe('getProgressInLevel', () => {
    it('should return 0% at the start of a level', () => {
      expect(getProgressInLevel(0, 1)).toBe(0);
    });

    it('should return 50% at halfway through level 1', () => {
      // Level 1 requires 200 XP, so 100 XP = 50%
      expect(getProgressInLevel(100, 1)).toBe(50);
    });

    it('should return 100% at the end of level 1', () => {
      // Level 1 requires 200 XP
      expect(getProgressInLevel(200, 1)).toBe(100);
    });

    it('should calculate progress correctly for level 2', () => {
      // Level 2 requires 200 XP to reach (level 1), and 400 XP for level 2
      // At 300 XP total, we have 100 XP in level 2, which is 25% of 400
      expect(getProgressInLevel(300, 2)).toBe(25);
    });
  });
});
