/**
 * Live classes are scheduled and shown in India Standard Time: the audience
 * is in India, while the Worker runs in UTC — so times are converted
 * explicitly instead of relying on the server's zone.
 */
export const APP_TIME_ZONE = "Asia/Kolkata";
const IST_OFFSET = "+05:30";

/** `YYYY-MM-DDTHH:mm` (from <input type="datetime-local">) in IST → Date. */
export function parseIstLocal(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const d = new Date(`${value}:00${IST_OFFSET}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Date → `YYYY-MM-DDTHH:mm` in IST, for pre-filling datetime-local inputs. */
export function toIstLocalInput(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** "Sat, 12 Oct 2026, 6:30 pm IST" */
export function formatIst(date: Date): string {
  return `${new Intl.DateTimeFormat("en-IN", {
    timeZone: APP_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)} IST`;
}

/** "6:30 pm" */
export function formatIstTime(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: APP_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/** Calendar-day parts in IST, for date badges. */
export function istDayParts(date: Date) {
  const f = (o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-IN", { timeZone: APP_TIME_ZONE, ...o }).format(date);
  return { day: f({ day: "numeric" }), month: f({ month: "short" }), weekday: f({ weekday: "short" }) };
}

export type LiveState = "upcoming" | "joinable" | "live" | "ended";

/** Students can join from 15 minutes before the start until the end. */
export const JOIN_WINDOW_MINUTES = 15;

export function liveState(startsAt: Date, durationMinutes: number, now = Date.now()): LiveState {
  const start = startsAt.getTime();
  const end = start + durationMinutes * 60_000;
  if (now >= end) return "ended";
  if (now >= start) return "live";
  if (now >= start - JOIN_WINDOW_MINUTES * 60_000) return "joinable";
  return "upcoming";
}
