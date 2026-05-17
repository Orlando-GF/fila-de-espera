export function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function labelize(value: string | null | undefined) {
  if (!value) return "-";
  return value.replaceAll("_", " ").toLocaleUpperCase("pt-BR");
}

const waitlistTimeZone = "America/Sao_Paulo";

type DateOnly = {
  day: number;
  month: number;
  year: number;
};

function parseDateOnly(value: string | null | undefined): DateOnly | null {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;

  return { day, month, year };
}

function todayInWaitlistTimeZone(): DateOnly {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: waitlistTimeZone,
    year: "numeric",
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    day: Number(values.day),
    month: Number(values.month),
    year: Number(values.year),
  };
}

function dateOnlyToUtcTimestamp(date: DateOnly) {
  return Date.UTC(date.year, date.month - 1, date.day);
}

export function daysSinceDate(value: string | null | undefined) {
  const start = parseDateOnly(value);
  if (!start) return null;

  const today = todayInWaitlistTimeZone();
  const dayInMs = 24 * 60 * 60 * 1000;

  return Math.max(0, Math.floor((dateOnlyToUtcTimestamp(today) - dateOnlyToUtcTimestamp(start)) / dayInMs));
}

export function formatWaitDays(value: string | null | undefined, compact = false) {
  const days = daysSinceDate(value);
  if (days === null) return "-";
  if (days === 0) return compact ? "0 dias" : "0 dias na fila";
  if (days === 1) return compact ? "1 dia" : "1 dia na fila";

  return compact ? `${days} dias` : `${days} dias na fila`;
}
