export const CATEGORIES = [
  'rant',
  'bant',
  'music',
  'comedy',
  'story',
  'question',
  'opinion',
  'other'
] as const;

export type Category = typeof CATEGORIES[number];

export const CATEGORY_IMAGES: Record<Category, string> = {
  rant: 'rant-emoji.png',
  bant: 'bant-emoji.png',
  music: 'music-emoji.png',
  comedy: 'comedy-emoji.png',
  story: 'story-emoji.png',
  question: 'question-emoji.png',
  opinion: 'opinion-emoji.png',
  other: 'other-emoji.png'
};
