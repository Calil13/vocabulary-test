import type { Direction, LevelCode } from './types';

export interface LevelMeta {
  code: LevelCode;
  name: string;
  color: string;
}

// Rəng çətinliyi göstərir: A1 yaşıldan C2 çəhrayıya doğru.
export const LEVELS: LevelMeta[] = [
  { code: 'A1', name: 'Başlanğıc', color: '#3DDC97' },
  { code: 'A2', name: 'Elementar', color: '#3FC1F0' },
  { code: 'B1', name: 'Orta', color: '#6C8BFF' },
  { code: 'B2', name: 'Orta üstü', color: '#A070FF' },
  { code: 'C1', name: 'İrəli', color: '#E86BE0' },
  { code: 'C2', name: 'Mükəmməl', color: '#FF5C7A' },
];

export interface DirectionMeta {
  slug: string;
  value: Direction;
  title: string;
  hint: string;
  prompt: string;
  questionLang: string;
  answerLang: string;
}

export const DIRECTIONS: DirectionMeta[] = [
  {
    slug: 'az-en',
    value: 'AZ_TO_EN',
    title: 'Azərbaycan dilindən ingilis dilinə',
    hint: 'Azərbaycanca söz verilir, ingiliscə tərcüməsini seçirsən.',
    prompt: 'ingilis dilində nə deməkdir?',
    questionLang: 'az',
    answerLang: 'en',
  },
  {
    slug: 'en-az',
    value: 'EN_TO_AZ',
    title: 'İngilis dilindən Azərbaycan dilinə',
    hint: 'İngiliscə söz verilir, Azərbaycanca tərcüməsini seçirsən.',
    prompt: 'Azərbaycan dilində nə deməkdir?',
    questionLang: 'en',
    answerLang: 'az',
  },
];

export const findLevel = (code?: string) => LEVELS.find((l) => l.code === code);
export const findDirection = (slug?: string) => DIRECTIONS.find((d) => d.slug === slug);
