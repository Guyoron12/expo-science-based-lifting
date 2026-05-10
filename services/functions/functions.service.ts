type HasDate = {
  date?: string;
};

export function startOfLocalDay(date: Date): Date {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

export function weekDatesFromMonday(anchor: Date): Date[] {
  const base = startOfLocalDay(anchor);
  const day = base.getDay();
  base.setDate(base.getDate() + (day === 0 ? -6 : 1 - day));

  return Array.from({ length: 7 }, (_, index) => {
    const value = new Date(base);
    value.setDate(base.getDate() + index);
    return value;
  });
}

export function parseIsoDateToLocalDay(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isSameCalendarDay(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function getRoutineByDate<T extends HasDate>(
  routines: T[],
  date: Date,
): T | undefined {
  return routines.find((routine) => {
    if (!routine.date) return false;
    return isSameCalendarDay(parseIsoDateToLocalDay(routine.date), date);
  });
}

export function isPersonalRecordText(text: string): boolean {
  return /pr|personal record|pb/i.test(text);
}
