/**
 * Challenge ID → Achievement ID mapping
 * Each challenge completion unlocks a specific achievement.
 * Challenge 46 ("???") has no standard completion achievement.
 * Challenges 29 & 30 each have their own achievement (232/233),
 * both of which require completing both challenges.
 */
export const CHALLENGE_ACH = {
   1: 89,   2: 90,   3: 91,   4: 92,   5: 93,
   6: 94,   7: 120,  8: 96,   9: 97,  10: 98,
  11: 99,  12: 100, 13: 60,  14: 63,  15: 101,
  16: 102, 17: 103, 18: 104, 19: 62,  20: 95,
  21: 224, 22: 225, 23: 226, 24: 227, 25: 228,
  26: 229, 27: 230, 28: 231, 29: 232, 30: 233,
  31: 331, 32: 332, 33: 333, 34: 334, 35: 335,
  36: 517, 37: 518, 38: 519, 39: 520, 40: 521,
  41: 522, 42: 531, 43: 532, 44: 533, 45: 538,
  // 46 ("???") has no completion achievement
};
