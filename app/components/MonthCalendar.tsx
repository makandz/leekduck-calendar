"use client";

import { useMemo, useState } from "react";
import type { CalendarEvent } from "../lib/leekduck";
import { eventTypeToSwatch } from "../lib/colors";
import {
  addDays,
  diffDays,
  endOfMonth,
  endOfWeek,
  isSameDay,
  startOfMonth,
  startOfWeek,
  toDayStart,
} from "../lib/date";

type Props = {
  events: CalendarEvent[];
};

type EventSegment = {
  event: CalendarEvent;
  startCol: number; // 0..6 (Sun..Sat)
  endCol: number; // 0..6 (Sun..Sat)
  continuesLeft: boolean;
  continuesRight: boolean;
};

const EVENT_PILL_HEIGHT_PX = 28; // h-7
const EVENT_LANE_GAP_PX = 6; // gap-1.5
const EVENTS_TOP_OFFSET_PX = 48; // pt-12, leaves space for date header
const CARD_VERTICAL_PADDING_PX = 24; // approx p-3 top+bottom
const CARD_MIN_BASE_PX = 88; // baseline when no events

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatMonthLabel(date: Date): string {
  return `${MONTH_LONG[date.getMonth()]} ${date.getFullYear()}`;
}

function formatWeekdayLabel(date: Date, variant: "short" | "narrow"): string {
  const short = WEEKDAY_SHORT[date.getDay()];
  return variant === "narrow" ? short.slice(0, 1) : short;
}

function isMidnightLocal(date: Date): boolean {
  return (
    date.getHours() === 0 &&
    date.getMinutes() === 0 &&
    date.getSeconds() === 0 &&
    date.getMilliseconds() === 0
  );
}

function eventDayRange(event: CalendarEvent): { startDay: Date; endDay: Date } {
  const startDay = toDayStart(event.start);
  const endDayRaw = toDayStart(event.end);
  const endDay =
    isMidnightLocal(event.end) && diffDays(startDay, endDayRaw) >= 1
      ? addDays(endDayRaw, -1)
      : endDayRaw;
  return { startDay, endDay };
}

function intersectsRange(
  range: { start: Date; end: Date },
  target: { start: Date; end: Date },
): boolean {
  return diffDays(range.start, target.end) >= 0 && diffDays(target.start, range.end) >= 0;
}

function clampToRange(
  value: Date,
  range: { start: Date; end: Date },
): Date {
  if (diffDays(value, range.start) > 0) return range.start;
  if (diffDays(range.end, value) > 0) return range.end;
  return value;
}

function buildWeekSegments(
  weekStart: Date,
  weekEnd: Date,
  events: CalendarEvent[],
): EventSegment[][] {
  const weekRange = { start: weekStart, end: weekEnd };

  const segments: EventSegment[] = [];
  for (const event of events) {
    const { startDay, endDay } = eventDayRange(event);
    const eventRange = { start: startDay, end: endDay };
    if (!intersectsRange(weekRange, eventRange)) continue;

    const segStart = clampToRange(startDay, weekRange);
    const segEnd = clampToRange(endDay, weekRange);
    const startCol = diffDays(weekStart, segStart);
    const endCol = diffDays(weekStart, segEnd);
    if (startCol < 0 || endCol > 6 || startCol > endCol) continue;

    segments.push({
      event,
      startCol,
      endCol,
      continuesLeft: diffDays(startDay, weekStart) > 0,
      continuesRight: diffDays(weekEnd, endDay) > 0,
    });
  }

  segments.sort((a, b) => {
    if (a.startCol !== b.startCol) return a.startCol - b.startCol;
    return b.endCol - a.endCol;
  });

  const lanes: EventSegment[][] = [];
  const laneEnd: number[] = [];
  for (const seg of segments) {
    let placed = false;
    for (let laneIndex = 0; laneIndex < laneEnd.length; laneIndex++) {
      if (seg.startCol > laneEnd[laneIndex]) {
        lanes[laneIndex].push(seg);
        laneEnd[laneIndex] = seg.endCol;
        placed = true;
        break;
      }
    }
    if (!placed) {
      lanes.push([seg]);
      laneEnd.push(seg.endCol);
    }
  }

  return lanes;
}

function formatEventTooltip(event: CalendarEvent): string {
  const type = event.eventType ? `\nType: ${event.eventType}` : "";
  return `${event.title}${type}`;
}

function EventBar({ seg }: { seg: EventSegment }) {
  const swatch = eventTypeToSwatch(seg.event.eventType);

  const title = `${seg.continuesLeft ? "◀ " : ""}${seg.event.title}${seg.continuesRight ? " ▶" : ""}`;

  return (
    <a
      href={seg.event.href}
      target="_blank"
      rel="noreferrer noopener"
      className="group pointer-events-auto mx-1 flex h-7 items-center gap-2 overflow-hidden rounded-full border px-2.5 text-[11px] font-semibold leading-7 text-white shadow-sm ring-1 ring-black/10 transition will-change-transform hover:-translate-y-px hover:shadow-md hover:shadow-zinc-900/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      style={{
        gridColumn: `${seg.startCol + 1} / ${seg.endCol + 2}`,
        backgroundColor: swatch.background,
        borderColor: "rgba(255,255,255,0.18)",
        backgroundImage:
          "linear-gradient(to bottom, rgba(255,255,255,0.10), rgba(0,0,0,0.18))",
      }}
      title={formatEventTooltip(seg.event)}
      aria-label={formatEventTooltip(seg.event)}
    >
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/15"
        style={{ backgroundColor: swatch.accent }}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 truncate">{title}</span>
      {seg.event.eventType ? (
        <span className="hidden shrink-0 rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90 group-hover:inline-flex">
          {seg.event.eventType.replaceAll("-", " ")}
        </span>
      ) : null}
    </a>
  );
}

function formatDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMobileDayLabel(date: Date): string {
  return `${WEEKDAY_SHORT[date.getDay()]}, ${MONTH_SHORT[date.getMonth()]} ${date.getDate()}`;
}

function MobileEventRow({
  event,
  day,
}: {
  event: CalendarEvent;
  day: Date;
}) {
  const swatch = eventTypeToSwatch(event.eventType);
  const { startDay, endDay } = eventDayRange(event);
  const continuesLeft = diffDays(startDay, day) > 0;
  const continuesRight = diffDays(day, endDay) > 0;

  const title = `${continuesLeft ? "◀ " : ""}${event.title}${continuesRight ? " ▶" : ""}`;

  return (
    <a
      href={event.href}
      target="_blank"
      rel="noreferrer noopener"
      className="flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-black/10"
      style={{
        backgroundColor: swatch.background,
        backgroundImage:
          "linear-gradient(to bottom, rgba(255,255,255,0.10), rgba(0,0,0,0.18))",
      }}
      title={formatEventTooltip(event)}
      aria-label={formatEventTooltip(event)}
    >
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/15"
        style={{ backgroundColor: swatch.accent }}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 truncate">{title}</span>
      {event.eventType ? (
        <span className="shrink-0 rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90">
          {event.eventType.replaceAll("-", " ")}
        </span>
      ) : null}
    </a>
  );
}

export default function MonthCalendar({ events }: Props) {
  const [monthCursor, setMonthCursor] = useState<Date>(() => startOfMonth(new Date()));

  const today = useMemo(() => toDayStart(new Date()), []);
  const monthStart = useMemo(() => startOfMonth(monthCursor), [monthCursor]);
  const monthEnd = useMemo(() => endOfMonth(monthCursor), [monthCursor]);

  const gridStart = useMemo(() => startOfWeek(monthStart), [monthStart]);
  const gridEnd = useMemo(() => endOfWeek(monthEnd), [monthEnd]);

  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let cursor = gridStart; diffDays(cursor, gridEnd) >= 0; cursor = addDays(cursor, 7)) {
      result.push(Array.from({ length: 7 }, (_, i) => addDays(cursor, i)));
    }
    return result;
  }, [gridStart, gridEnd]);

  const visibleEvents = useMemo(() => {
    const visibleRange = { start: gridStart, end: gridEnd };
    return events.filter((event) => {
      const { startDay, endDay } = eventDayRange(event);
      return intersectsRange(visibleRange, { start: startDay, end: endDay });
    });
  }, [events, gridStart, gridEnd]);

  const monthDays = useMemo(() => {
    const result: Date[] = [];
    for (let cursor = monthStart; diffDays(cursor, monthEnd) >= 0; cursor = addDays(cursor, 1)) {
      result.push(cursor);
    }
    return result;
  }, [monthStart, monthEnd]);

  const eventsByDayKey = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    for (const day of monthDays) {
      map.set(formatDayKey(day), []);
    }

    for (const event of visibleEvents) {
      const { startDay, endDay } = eventDayRange(event);

      const start = diffDays(startDay, monthStart) > 0 ? monthStart : startDay;
      const end = diffDays(monthEnd, endDay) > 0 ? monthEnd : endDay;

      for (let cursor = start; diffDays(cursor, end) >= 0; cursor = addDays(cursor, 1)) {
        const key = formatDayKey(cursor);
        const bucket = map.get(key);
        if (bucket) bucket.push(event);
      }
    }

    for (const bucket of map.values()) {
      bucket.sort((a, b) => a.start.getTime() - b.start.getTime());
    }

    return map;
  }, [visibleEvents, monthDays, monthStart, monthEnd]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 to-white text-zinc-900">
      <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-zinc-950">
              {formatMonthLabel(monthCursor)}
            </h1>
            <p className="text-xs text-zinc-600">Leekduck events</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-zinc-300/70 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm shadow-zinc-900/5 hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              onClick={() => setMonthCursor((d) => startOfMonth(addDays(d, -1)))}
              aria-label="Previous month"
            >
              Prev
            </button>
            <button
              type="button"
              className="rounded-md border border-zinc-300/70 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm shadow-zinc-900/5 hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              onClick={() => setMonthCursor(startOfMonth(new Date()))}
            >
              Today
            </button>
            <button
              type="button"
              className="rounded-md border border-zinc-300/70 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm shadow-zinc-900/5 hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              onClick={() => setMonthCursor((d) => startOfMonth(addDays(endOfMonth(d), 1)))}
              aria-label="Next month"
            >
              Next
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5">
        <div className="sm:hidden">
          <div className="space-y-3">
            {monthDays.map((day) => {
              const isToday = isSameDay(day, today);
              const bucket = eventsByDayKey.get(formatDayKey(day)) ?? [];

              return (
                <section
                  key={formatDayKey(day)}
                  className={[
                    "rounded-2xl bg-white p-4 shadow-sm shadow-zinc-900/5 ring-1 ring-zinc-200/70",
                    isToday ? "ring-2 ring-blue-500/70" : "",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={[
                          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold tabular-nums",
                          isToday
                            ? "bg-blue-500 text-white shadow-sm shadow-blue-500/20"
                            : "bg-zinc-100 text-zinc-800",
                        ].join(" ")}
                      >
                        {day.getDate()}
                      </div>
                      <div className="text-sm font-semibold text-zinc-900">
                        {formatMobileDayLabel(day)}
                      </div>
                    </div>
                    {bucket.length ? (
                      <div className="text-xs font-semibold text-zinc-500">
                        {bucket.length} {bucket.length === 1 ? "event" : "events"}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-3 space-y-2">
                    {bucket.length ? (
                      bucket.map((event) => (
                        <MobileEventRow
                          key={`${formatDayKey(day)}:${event.id}`}
                          event={event}
                          day={day}
                        />
                      ))
                    ) : (
                      <div className="rounded-xl bg-zinc-50 px-3 py-3 text-sm font-medium text-zinc-500 ring-1 ring-zinc-200/70">
                        No events
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <div className="hidden sm:block">
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 shadow-sm shadow-zinc-900/5">
          {Array.from({ length: 7 }, (_, index) => {
            const day = addDays(gridStart, index);
            return (
              <div
                key={index}
                className="bg-zinc-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-600"
              >
                <span className="hidden sm:inline">{formatWeekdayLabel(day, "short")}</span>
                <span className="sm:hidden">{formatWeekdayLabel(day, "narrow")}</span>
              </div>
            );
          })}
          </div>

          <div className="mt-2 grid gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 shadow-sm shadow-zinc-900/5">
          {weeks.map((week, weekIndex) => {
            const weekStart = week[0];
            const weekEnd = week[6];
            const lanes = buildWeekSegments(weekStart, weekEnd, visibleEvents);
            const perDayTotals = Array.from({ length: 7 }, (_, dayIndex) =>
              lanes.reduce((count, lane) => {
                const covers = lane.some(
                  (seg) => seg.startCol <= dayIndex && dayIndex <= seg.endCol,
                );
                return count + (covers ? 1 : 0);
              }, 0),
            );
            const visibleLaneCount = lanes.length;
            const weekMinHeightPx = Math.max(
              CARD_MIN_BASE_PX,
              EVENTS_TOP_OFFSET_PX +
                visibleLaneCount * EVENT_PILL_HEIGHT_PX +
                Math.max(0, visibleLaneCount - 1) * EVENT_LANE_GAP_PX +
                CARD_VERTICAL_PADDING_PX,
            );

            return (
              <div key={weekIndex} className="relative bg-zinc-200">
                <div className="grid grid-cols-7 gap-2 bg-zinc-200 p-2">
                  {week.map((day, dayIndex) => {
                    const inMonth =
                      day.getFullYear() === monthStart.getFullYear() &&
                      day.getMonth() === monthStart.getMonth();
                    const isToday = isSameDay(day, today);
                    const totalCount = perDayTotals[dayIndex];

                    return (
                      <div
                        key={day.toISOString()}
                        className={[
                          "relative overflow-hidden rounded-xl bg-white p-3 shadow-sm shadow-zinc-900/5 ring-1 ring-zinc-200/70",
                          inMonth ? "text-zinc-900" : "bg-zinc-50 text-zinc-400",
                          isToday ? "ring-2 ring-blue-500/70" : "",
                        ].join(" ")}
                        style={{ minHeight: `${weekMinHeightPx}px` }}
                      >
                        <div className="flex items-center justify-between pb-3">
                          <div
                            className={[
                              "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                              isToday
                                ? "bg-blue-500 text-white shadow-sm shadow-blue-500/20"
                                : "text-zinc-700",
                              inMonth ? "" : "opacity-60",
                            ].join(" ")}
                          >
                            {day.getDate()}
                          </div>
                        </div>

                        {inMonth && totalCount === 0 ? (
                          <div className="text-[11px] font-medium text-zinc-400">
                            No events
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {lanes.length > 0 ? (
                  <div className="pointer-events-none absolute inset-0 z-10 p-2 pt-12">
                    <div className="flex flex-col gap-1.5">
                      {lanes.map((lane, laneIndex) => (
                        <div key={laneIndex} className="grid grid-cols-7 gap-2">
                          {lane.map((seg) => (
                            <EventBar
                              key={`${seg.event.id}:${seg.startCol}:${seg.endCol}`}
                              seg={seg}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
          </div>
        </div>
      </main>
    </div>
  );
}
