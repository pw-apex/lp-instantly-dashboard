import fs from 'node:fs';
import path from 'node:path';
import type { EmailBucket } from './types';

const CACHE_DIR = path.join(process.cwd(), 'data', 'email-buckets');

function fileForDate(date: string): string {
  return path.join(CACHE_DIR, `${date}.json`);
}

export function todayInPT(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
}

export function readCachedDay(date: string): EmailBucket[] | null {
  try {
    const raw = fs.readFileSync(fileForDate(date), 'utf8');
    return JSON.parse(raw) as EmailBucket[];
  } catch {
    return null;
  }
}

export function writeCachedDay(date: string, buckets: EmailBucket[]): void {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(fileForDate(date), JSON.stringify(buckets), 'utf8');
}

export function datesInRange(startDate: string, endDate: string): string[] {
  const out: string[] = [];
  const start = new Date(startDate + 'T00:00:00Z');
  const end = new Date(endDate + 'T00:00:00Z');
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}
