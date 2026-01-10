import type { CalendarEvent } from "./leekduck";

export const IGNORED_EVENT_TYPES = new Set<string>([
  "research",
  "season",
  "raid-battles",
  "go-pass",
  "go-battle-league",
  "pokestop-showcase",
]);

export const IGNORED_EVENT_IDS = new Set<string>([]);

export function shouldIgnoreEvent(event: CalendarEvent): boolean {
  if (IGNORED_EVENT_IDS.has(event.id)) return true;
  if (event.eventType && IGNORED_EVENT_TYPES.has(event.eventType)) return true;
  return false;
}
