import type { Region } from './types';

export const EUROPE = ['DE','FR','CH','NL','IT','ES','SE','FI','DK','NO','BE','AT','PL','PT','IE','CZ','GR','HU','RO','EE','LV','LT','SI','SK','HR','BG','LU','IS','CY','MT','RS','UA'];
export const ASIA = ['JP','KR','SG','IN','HK','TW','MO','MY','TH','VN','ID','PH','PK','BD','LK','IL','SA','AE','QA','TR','KZ'];
// ponytail: discovery slice for big non-region countries so their counts aren't
// collab-polluted; grow the list if a major org shows a suspiciously low count.
export const OTHER_MAJORS = ['CA','AU','BR','RU','ZA','MX','CL','AR','EG','NZ'];

export function regionForCountry(cc: string | null): Region {
  if (!cc) return 'other';
  const c = cc.toUpperCase();
  if (c === 'US') return 'us';
  if (c === 'CN') return 'china';
  if (c === 'GB') return 'uk';
  if (EUROPE.includes(c)) return 'europe';
  if (ASIA.includes(c)) return 'asia';
  return 'other';
}

export const REGION_LABELS: Record<Region | 'global', string> = {
  global: 'Global', us: 'US', china: 'China', europe: 'Europe',
  uk: 'UK', asia: 'Rest of Asia', other: 'Rest of World',
};
