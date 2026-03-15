/**
 * Mapping : personnage → completion marks → achievement ID requis
 * Source : achievements.json + wiki Isaac Repentance
 *
 * Structure marks :
 *   hard_moms_heart, satan, ???_mark, the_lamb, mega_satan,
 *   boss_rush, hush, ultra_greed, ultra_greedier, delirium, mother, beast
 *
 * Tainted uniquement :
 *   four_bosses (Isaac+???+Satan+Lamb), hush_boss_rush
 */

export const BOSS_LABELS = {
  hard_moms_heart: "Mom's Heart",
  satan:           'Satan',
  '???_mark':      '???',
  the_lamb:        'The Lamb',
  mega_satan:      'Mega Satan',
  boss_rush:       'Boss Rush',
  hush:            'Hush',
  ultra_greed:     'Ultra\nGreed',
  ultra_greedier:  'Greed\nMode',
  delirium:        'Delirium',
  mother:          'Mother',
  beast:           'The Beast',
  // Tainted marks
  four_bosses:     'Classic Bosses\n(Isa+???+Sat+Lmb)',
  hush_boss_rush:  'Hush +\nBoss Rush',
};

// Marks normaux (personnages réguliers)
export const NORMAL_MARK_KEYS = [
  'hard_moms_heart','satan','???_mark','the_lamb','mega_satan',
  'boss_rush','hush','ultra_greedier','delirium','mother','beast',
];

// Marks tainted
export const TAINTED_MARK_KEYS = [
  'four_bosses','mother','beast','mega_satan','hush_boss_rush','ultra_greedier','delirium',
];

// ─── Personnages normaux (0-16) ───────────────────────────────────────────────

export const CHARACTERS = [
  {
    id: 0, key: 'isaac', name: 'Isaac', tainted: false, unlockAchId: null,
    marks: {
      hard_moms_heart: 167, satan: 43, '???_mark': 49, the_lamb: 149,
      mega_satan: 205, boss_rush: 70, hush: 179, ultra_greed: 192,
      ultra_greedier: 296, delirium: 282, mother: 440, beast: 441,
    },
  },
  {
    id: 1, key: 'magdalene', name: 'Magdalene', tainted: false, unlockAchId: 1,
    marks: {
      hard_moms_heart: 168, satan: 45, '???_mark': 50, the_lamb: 71,
      mega_satan: 206, boss_rush: 109, hush: 180, ultra_greed: 193,
      ultra_greedier: 297, delirium: 283, mother: 442, beast: 443,
    },
  },
  {
    id: 2, key: 'cain', name: 'Cain', tainted: false, unlockAchId: 2,
    marks: {
      hard_moms_heart: 171, satan: 46, '???_mark': 75, the_lamb: 51,
      mega_satan: 207, boss_rush: 110, hush: 181, ultra_greed: 194,
      ultra_greedier: 298, delirium: 284, mother: 444, beast: 445,
    },
  },
  {
    id: 3, key: 'judas', name: 'Judas', tainted: false, unlockAchId: 3,
    marks: {
      hard_moms_heart: 170, satan: 72, '???_mark': 77, the_lamb: 52,
      mega_satan: 208, boss_rush: 108, hush: 182, ultra_greed: 195,
      ultra_greedier: 299, delirium: 285, mother: 446, beast: 447,
    },
  },
  {
    id: 4, key: 'blue_baby', name: '???', tainted: false, unlockAchId: 32,
    marks: {
      hard_moms_heart: 174, satan: 48, '???_mark': null, the_lamb: 73,
      mega_satan: 209, boss_rush: 114, hush: 183, ultra_greed: 196,
      ultra_greedier: 300, delirium: 286, mother: 448, beast: 449,
    },
  },
  {
    id: 5, key: 'eve', name: 'Eve', tainted: false, unlockAchId: 42,
    marks: {
      hard_moms_heart: 169, satan: 44, '???_mark': 53, the_lamb: 111,
      mega_satan: 210, boss_rush: 112, hush: 184, ultra_greed: 197,
      ultra_greedier: 302, delirium: 288, mother: 450, beast: 451,
    },
  },
  {
    id: 6, key: 'samson', name: 'Samson', tainted: false, unlockAchId: 67,
    marks: {
      hard_moms_heart: 177, satan: 56, '???_mark': 55, the_lamb: 74,
      mega_satan: 211, boss_rush: 115, hush: 185, ultra_greed: 198,
      ultra_greedier: 301, delirium: 287, mother: 452, beast: 453,
    },
  },
  {
    id: 7, key: 'azazel', name: 'Azazel', tainted: false, unlockAchId: 79,
    marks: {
      hard_moms_heart: 172, satan: 127, '???_mark': 128, the_lamb: 47,
      mega_satan: 212, boss_rush: 9, hush: 186, ultra_greed: 199,
      ultra_greedier: 304, delirium: 290, mother: 454, beast: 455,
    },
  },
  {
    id: 8, key: 'lazarus', name: 'Lazarus', tainted: false, unlockAchId: 80,
    marks: {
      hard_moms_heart: 173, satan: 117, '???_mark': 118, the_lamb: 119,
      mega_satan: 213, boss_rush: 105, hush: 187, ultra_greed: 200,
      ultra_greedier: 305, delirium: 291, mother: 456, beast: 457,
    },
  },
  {
    id: 9, key: 'eden', name: 'Eden', tainted: false, unlockAchId: 81,
    marks: {
      hard_moms_heart: 176, satan: 122, '???_mark': 123, the_lamb: 124,
      mega_satan: 214, boss_rush: 125, hush: 188, ultra_greed: 201,
      ultra_greedier: 303, delirium: 289, mother: 458, beast: 459,
    },
  },
  {
    id: 10, key: 'lost', name: 'The Lost', tainted: false, unlockAchId: 82,
    marks: {
      hard_moms_heart: 175, satan: 130, '???_mark': 131, the_lamb: 132,
      mega_satan: 215, boss_rush: 133, hush: 189, ultra_greed: 202,
      ultra_greedier: 307, delirium: 293, mother: 460, beast: 461,
    },
  },
  {
    id: 11, key: 'lilith', name: 'Lilith', tainted: false, unlockAchId: 199,
    marks: {
      hard_moms_heart: 223, satan: 220, '???_mark': 219, the_lamb: 221,
      mega_satan: 216, boss_rush: 222, hush: 190, ultra_greed: 203,
      ultra_greedier: 306, delirium: 292, mother: 462, beast: 463,
    },
  },
  {
    id: 12, key: 'keeper', name: 'Keeper', tainted: false, unlockAchId: 251,
    marks: {
      hard_moms_heart: 241, satan: 237, '???_mark': 238, the_lamb: 239,
      mega_satan: 217, boss_rush: 240, hush: 191, ultra_greed: 204,
      ultra_greedier: 308, delirium: 294, mother: 464, beast: 465,
    },
  },
  {
    id: 13, key: 'apollyon', name: 'Apollyon', tainted: false, unlockAchId: 340,
    marks: {
      hard_moms_heart: 318, satan: 311, '???_mark': 312, the_lamb: 313,
      mega_satan: 317, boss_rush: 314, hush: 315, ultra_greed: 316,
      ultra_greedier: 309, delirium: 295, mother: 466, beast: 467,
    },
  },
  {
    id: 14, key: 'the_forgotten', name: 'The Forgotten', tainted: false, unlockAchId: 390,
    marks: {
      hard_moms_heart: 392, satan: 394, '???_mark': 395, the_lamb: 396,
      mega_satan: 403, boss_rush: 397, hush: 398, ultra_greed: 399,
      ultra_greedier: 400, delirium: 401, mother: 468, beast: 469,
    },
  },
  {
    id: 15, key: 'bethany', name: 'Bethany', tainted: false, unlockAchId: null,
    marks: {
      hard_moms_heart: 416, satan: 418, '???_mark': 419, the_lamb: 420,
      mega_satan: 427, boss_rush: 421, hush: 423, ultra_greed: 422,
      ultra_greedier: 424, delirium: 425, mother: 470, beast: 471,
    },
  },
  {
    id: 16, key: 'jacob_esau', name: 'Jacob & Esau', tainted: false, unlockAchId: null,
    marks: {
      hard_moms_heart: 428, satan: 430, '???_mark': 431, the_lamb: 432,
      mega_satan: 439, boss_rush: 433, hush: 435, ultra_greed: 434,
      ultra_greedier: 436, delirium: 437, mother: 472, beast: 473,
    },
  },

  // ─── Tainted (17-33) ─────────────────────────────────────────────────────

  {
    id: 17, key: 't_isaac', name: 'T. Isaac', tainted: true, unlockAchId: 474,
    marks: {
      four_bosses: 548, mother: 549, beast: 491, mega_satan: 601,
      hush_boss_rush: 618, ultra_greedier: 541, delirium: 584,
    },
  },
  {
    id: 18, key: 't_magdalene', name: 'T. Magdalene', tainted: true, unlockAchId: 475,
    marks: {
      four_bosses: 550, mother: 551, beast: 492, mega_satan: 602,
      hush_boss_rush: 619, ultra_greedier: 530, delirium: 585,
    },
  },
  {
    id: 19, key: 't_cain', name: 'T. Cain', tainted: true, unlockAchId: 476,
    marks: {
      four_bosses: 552, mother: 553, beast: 493, mega_satan: 603,
      hush_boss_rush: 620, ultra_greedier: 534, delirium: 586,
    },
  },
  {
    id: 20, key: 't_judas', name: 'T. Judas', tainted: true, unlockAchId: 477,
    marks: {
      four_bosses: 554, mother: 555, beast: 494, mega_satan: 604,
      hush_boss_rush: 621, ultra_greedier: 525, delirium: 587,
    },
  },
  {
    id: 21, key: 't_blue_baby', name: 'T. ???', tainted: true, unlockAchId: 478,
    marks: {
      four_bosses: 556, mother: 557, beast: 495, mega_satan: 605,
      hush_boss_rush: 622, ultra_greedier: 528, delirium: 588,
    },
  },
  {
    id: 22, key: 't_eve', name: 'T. Eve', tainted: true, unlockAchId: 479,
    marks: {
      four_bosses: 558, mother: 559, beast: 496, mega_satan: 606,
      hush_boss_rush: 623, ultra_greedier: 527, delirium: 589,
    },
  },
  {
    id: 23, key: 't_samson', name: 'T. Samson', tainted: true, unlockAchId: 480,
    marks: {
      four_bosses: 560, mother: 561, beast: 497, mega_satan: 607,
      hush_boss_rush: 624, ultra_greedier: 535, delirium: 590,
    },
  },
  {
    id: 24, key: 't_azazel', name: 'T. Azazel', tainted: true, unlockAchId: 481,
    marks: {
      four_bosses: 562, mother: 563, beast: 498, mega_satan: 608,
      hush_boss_rush: 625, ultra_greedier: 539, delirium: 591,
    },
  },
  {
    id: 25, key: 't_lazarus', name: 'T. Lazarus', tainted: true, unlockAchId: 482,
    marks: {
      four_bosses: 564, mother: 565, beast: 499, mega_satan: 609,
      hush_boss_rush: 626, ultra_greedier: 543, delirium: 592,
    },
  },
  {
    id: 26, key: 't_eden', name: 'T. Eden', tainted: true, unlockAchId: 483,
    marks: {
      four_bosses: 566, mother: 567, beast: 500, mega_satan: 610,
      hush_boss_rush: 627, ultra_greedier: 544, delirium: 593,
    },
  },
  {
    id: 27, key: 't_lost', name: 'T. Lost', tainted: true, unlockAchId: 484,
    marks: {
      four_bosses: 568, mother: 569, beast: 501, mega_satan: 611,
      hush_boss_rush: 628, ultra_greedier: 524, delirium: 594,
    },
  },
  {
    id: 28, key: 't_lilith', name: 'T. Lilith', tainted: true, unlockAchId: 485,
    marks: {
      four_bosses: 570, mother: 571, beast: 502, mega_satan: 612,
      hush_boss_rush: 629, ultra_greedier: 526, delirium: 595,
    },
  },
  {
    id: 29, key: 't_keeper', name: 'T. Keeper', tainted: true, unlockAchId: 486,
    marks: {
      four_bosses: 572, mother: 573, beast: 503, mega_satan: 613,
      hush_boss_rush: 630, ultra_greedier: 536, delirium: 596,
    },
  },
  {
    id: 30, key: 't_apollyon', name: 'T. Apollyon', tainted: true, unlockAchId: 487,
    marks: {
      four_bosses: 574, mother: 575, beast: 504, mega_satan: 614,
      hush_boss_rush: 631, ultra_greedier: 540, delirium: 597,
    },
  },
  {
    id: 31, key: 't_forgotten', name: 'T. Forgotten', tainted: true, unlockAchId: 488,
    marks: {
      four_bosses: 576, mother: 577, beast: 505, mega_satan: 615,
      hush_boss_rush: 632, ultra_greedier: 537, delirium: 598,
    },
  },
  {
    id: 32, key: 't_bethany', name: 'T. Bethany', tainted: true, unlockAchId: 489,
    marks: {
      four_bosses: 578, mother: 579, beast: 506, mega_satan: 616,
      hush_boss_rush: 633, ultra_greedier: 529, delirium: 599,
    },
  },
  {
    id: 33, key: 't_jacob', name: 'T. Jacob', tainted: true, unlockAchId: 490,
    marks: {
      four_bosses: 580, mother: 581, beast: 507, mega_satan: 617,
      hush_boss_rush: 634, ultra_greedier: 542, delirium: 600,
    },
  },
];

