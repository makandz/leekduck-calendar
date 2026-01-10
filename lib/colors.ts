const KNOWN_EVENT_TYPE_HUES: Record<string, number> = {
  "community-day": 265, // violet
  "event": 215, // blue
  "go-battle-league": 200, // sky
  "go-pass": 174, // teal
  "max-battles": 24, // orange
  "max-mondays": 18, // orange dark
  "pokemon-go-tour": 346, // rose
  "pokemon-spotlight-hour": 41, // amber
  "pokestop-showcase": 152, // emerald
  "raid-battles": 4, // red
  "raid-day": 2, // red dark
  "raid-hour": 6, // red light
  "team-go-rocket": 222, // slate
};

function hashStringToInt(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function eventTypeToColor(eventType?: string): string {
  if (!eventType) return "hsl(215 25% 28%)"; // slate

  const normalized = eventType.trim().toLowerCase();
  const hue = KNOWN_EVENT_TYPE_HUES[normalized] ?? (hashStringToInt(normalized) % 360);
  return `hsl(${hue} 70% 28%)`;
}

export function eventTypeToSwatch(eventType?: string): {
  background: string;
  accent: string;
} {
  const normalized = eventType?.trim().toLowerCase();
  const hue = normalized
    ? (KNOWN_EVENT_TYPE_HUES[normalized] ?? (hashStringToInt(normalized) % 360))
    : 215;

  return {
    background: `hsl(${hue} 70% 28%)`,
    accent: `hsl(${hue} 92% 62%)`,
  };
}
