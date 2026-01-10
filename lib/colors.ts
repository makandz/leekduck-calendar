type EventTypeTheme = {
  hue?: number;
  background?: string;
  accent?: string;
};

const EVENT_TYPE_THEME: Record<string, EventTypeTheme> = {
  // User-requested palette
  "event": {
    hue: 145,
    background: "hsl(145 72% 24%)",
    accent: "hsl(145 85% 60%)",
  },
  "max-mondays": {
    hue: 275,
    background: "hsl(275 75% 22%)",
    accent: "hsl(275 92% 68%)",
  },
  "pokemon-spotlight-hour": {
    hue: 28,
    background: "hsl(28 88% 28%)",
    accent: "hsl(28 95% 62%)",
  },
  "raid-hour": {
    hue: 0,
    background: "hsl(0 78% 28%)",
    accent: "hsl(0 92% 60%)",
  },
  "raid-day": {
    hue: 0,
    background: "hsl(0 78% 28%)",
    accent: "hsl(0 92% 60%)",
  },
  "community-day": {
    hue: 210,
    background: "hsl(210 85% 28%)",
    accent: "hsl(210 95% 62%)",
  },
  "pokemon-go-tour": {
    hue: 210,
    background: "hsl(210 85% 28%)",
    accent: "hsl(210 95% 62%)",
  },

  // Special cases
  "team-go-rocket": { background: "#111827", accent: "#94A3B8" },

  // Other known types (hue-only; swatch derived)
  "go-battle-league": { hue: 200 },
  "go-pass": { hue: 174 },
  "max-battles": { hue: 275 },
  "pokestop-showcase": { hue: 152 },
  "raid-battles": { hue: 0 },
};

function normalizeEventTypeKey(eventType?: string): string | undefined {
  if (!eventType) return undefined;
  const normalized = eventType
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized || undefined;
}

function hashStringToInt(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function hueForEventTypeKey(key: string): number {
  return EVENT_TYPE_THEME[key]?.hue ?? (hashStringToInt(key) % 360);
}

export function eventTypeToColor(eventType?: string): string {
  if (!eventType) return "hsl(215 25% 28%)"; // slate

  const normalized = normalizeEventTypeKey(eventType) ?? eventType;
  const hue = hueForEventTypeKey(normalized);
  return `hsl(${hue} 70% 28%)`;
}

export function eventTypeToSwatch(eventType?: string): {
  background: string;
  accent: string;
} {
  const normalized = normalizeEventTypeKey(eventType);
  if (normalized) {
    if (normalized.includes("rocket")) {
      return {
        background: EVENT_TYPE_THEME["team-go-rocket"].background ?? "#111827",
        accent: EVENT_TYPE_THEME["team-go-rocket"].accent ?? "#94A3B8",
      };
    }

    const theme = EVENT_TYPE_THEME[normalized];
    if (theme?.background && theme?.accent) {
      return { background: theme.background, accent: theme.accent };
    }
  }
  const hue = normalized ? hueForEventTypeKey(normalized) : 215;

  return {
    background: `hsl(${hue} 70% 28%)`,
    accent: `hsl(${hue} 92% 62%)`,
  };
}
