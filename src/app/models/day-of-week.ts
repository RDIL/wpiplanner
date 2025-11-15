export enum DayOfWeek {
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
}

const dayInfo: Record<DayOfWeek, { shortName: string; name: string }> = {
  [DayOfWeek.SUNDAY]: {shortName: 'sun', name: 'Sunday'},
  [DayOfWeek.MONDAY]: {shortName: 'mon', name: 'Monday'},
  [DayOfWeek.TUESDAY]: {shortName: 'tue', name: 'Tuesday'},
  [DayOfWeek.WEDNESDAY]: {shortName: 'wed', name: 'Wednesday'},
  [DayOfWeek.THURSDAY]: {shortName: 'thu', name: 'Thursday'},
  [DayOfWeek.FRIDAY]: {shortName: 'fri', name: 'Friday'},
  [DayOfWeek.SATURDAY]: {shortName: 'sat', name: 'Saturday'},
};

export function getDayShortName(day: DayOfWeek): string {
  return dayInfo[day].shortName;
}

export function getDayByShortName(shortName: string): DayOfWeek {
  for (const [day, info] of Object.entries(dayInfo)) {
    if (info.shortName === shortName) {
      return day as DayOfWeek;
    }
  }
  throw new Error(`Non-existent day of the week name: ${shortName}`);
}

export function getDayByName(name: string): DayOfWeek {
  const lowerName = name.toLowerCase();
  for (const [day, info] of Object.entries(dayInfo)) {
    if (info.name.toLowerCase() === lowerName) {
      return day as DayOfWeek;
    }
  }
  throw new Error(`Non-existent day of the week name: ${name}`);
}
