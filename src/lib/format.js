import { config } from '../config.js';

const dateFormatter = new Intl.DateTimeFormat(config.lang, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

export const formatDate = (date) => dateFormatter.format(date);

export const isoDate = (date) => date.toISOString().slice(0, 10);

// 한글은 분당 약 500자, 영문은 분당 약 200단어 기준
export const readingMinutes = (text) => {
  const plain = text.replace(/```[\s\S]*?```/g, '').replace(/[#>*_`\[\]()!-]/g, ' ');
  const hangul = (plain.match(/[가-힣]/g) ?? []).length;
  const words = plain.replace(/[가-힣]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(hangul / 500 + words / 200));
};

export const slugify = (text) =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
