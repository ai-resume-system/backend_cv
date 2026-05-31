const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';
const VIETNAM_UTC_OFFSET_HOURS = 7;

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

function buildUtcDateFromVietnamLocal(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0,
): Date {
  return new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      hour - VIETNAM_UTC_OFFSET_HOURS,
      minute,
      second,
      millisecond,
    ),
  );
}

function hasExplicitTimeZone(input: string): boolean {
  return /(?:Z|[+-]\d{2}:\d{2})$/i.test(input);
}

function parseLocalDateParts(input: string): [number, number, number] | null {
  const match = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function parseLocalDateTimeParts(
  input: string,
): [number, number, number, number, number, number, number] | null {
  const match = input.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/,
  );
  if (!match) {
    return null;
  }

  const milliseconds = (match[7] ?? '').padEnd(3, '0');
  return [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    Number(match[6] ?? '0'),
    Number(milliseconds || '0'),
  ];
}

export function parseVietnamDateOnlyToUtcEndOfDay(input: string): Date {
  const parts = parseLocalDateParts(input);
  if (!parts) {
    throw new Error('Invalid Vietnam date-only input');
  }

  const date = buildUtcDateFromVietnamLocal(
    parts[0],
    parts[1],
    parts[2],
    23,
    59,
    59,
    999,
  );
  if (!isValidDate(date)) {
    throw new Error('Invalid Vietnam date-only input');
  }

  return date;
}

export function parseVietnamDateTimeInput(input: string): Date {
  if (hasExplicitTimeZone(input)) {
    const date = new Date(input);
    if (!isValidDate(date)) {
      throw new Error('Invalid datetime input');
    }
    return date;
  }

  const dateTimeParts = parseLocalDateTimeParts(input);
  if (dateTimeParts) {
    const date = buildUtcDateFromVietnamLocal(...dateTimeParts);
    if (!isValidDate(date)) {
      throw new Error('Invalid datetime input');
    }
    return date;
  }

  const dateOnlyParts = parseLocalDateParts(input);
  if (dateOnlyParts) {
    const date = buildUtcDateFromVietnamLocal(
      dateOnlyParts[0],
      dateOnlyParts[1],
      dateOnlyParts[2],
    );
    if (!isValidDate(date)) {
      throw new Error('Invalid datetime input');
    }
    return date;
  }

  throw new Error('Invalid datetime input');
}

export function parseJobExpiredAtInput(input: string): Date {
  if (parseLocalDateParts(input)) {
    return parseVietnamDateOnlyToUtcEndOfDay(input);
  }

  return parseVietnamDateTimeInput(input);
}

export function formatDateTimeVN(
  value?: Date | string | null,
): string | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (!isValidDate(date)) {
    return null;
  }

  const formatter = new Intl.DateTimeFormat('vi-VN', {
    timeZone: VIETNAM_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const lookup = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return `${lookup('day')}/${lookup('month')}/${lookup('year')} ${lookup('hour')}:${lookup('minute')}:${lookup('second')}`;
}
