import { zonedParts } from "./text";

export function quotaPeriod(now = new Date()): string {
  return zonedParts(now).period;
}

export function quotaRemaining(used: number, bonus: number, limit: number): number {
  return Math.max(limit + bonus - used, 0);
}

export function quotaAllows(used: number, bonus: number, limit: number): boolean {
  return used < limit + bonus;
}
