export function toDayStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function utcDayNumber(date: Date): number {
  return (
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000
  );
}

export function diffDays(from: Date, to: Date): number {
  return utcDayNumber(to) - utcDayNumber(from);
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function startOfWeek(date: Date): Date {
  const copy = toDayStart(date);
  const weekday = copy.getDay(); // 0 = Sun
  return addDays(copy, -weekday);
}

export function endOfWeek(date: Date): Date {
  return addDays(startOfWeek(date), 6);
}

export function isSameDay(a: Date, b: Date): boolean {
  return utcDayNumber(a) === utcDayNumber(b);
}

