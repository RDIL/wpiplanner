export class Time {
  hour: number;
  minutes: number;

  constructor(hour: number, minutes: number);
  constructor(time: string);

  constructor(hourOrTime: number | string, minutes?: number) {
    if (typeof hourOrTime === 'string') {
      const time = hourOrTime;
      const length = time.length;
      const meridian = time.substring(length - 2) === 'AM';

      const colonIndex = time.indexOf(':');
      this.hour = parseInt(time.substring(0, colonIndex), 10);
      this.minutes = parseInt(time.substring(length - 4, length - 2), 10);

      if (!meridian && this.hour !== 12) {
        this.hour += 12;
      }
    } else {
      this.hour = hourOrTime;
      this.minutes = minutes ?? 0;
    }

    this.assertValidTime();
  }

  private assertValidTime(): void {
    if (this.hour < 0 || this.hour >= 24 || this.minutes < 0 || this.minutes >= 60) {
      throw new Error('Input time is not within bounds.');
    }
  }

  toString(includeMinutes: boolean = true): string {
    let min = this.minutes.toString();
    if (min.length === 1) {
      min = '0' + min;
    }

    if (includeMinutes) {
      min = ':' + min;
    } else {
      min = '';
    }

    if (this.hour <= 12) {
      return this.hour + min + (this.hour === 12 ? 'PM' : 'AM');
    }

    return (this.hour - 12) + min + 'PM';
  }

  get value(): number {
    return this.hour + this.minutes / 60.0;
  }

  compareTo(other: Time): number {
    if (this.hour === other.hour) {
      if (this.minutes === other.minutes) return 0;
      if (this.minutes < other.minutes) return -1;
      return 1;
    }
    return this.hour < other.hour ? -1 : 1;
  }

  equals(other: Time): boolean {
    return this.hour === other.hour && this.minutes === other.minutes;
  }

  increment(byHours: number, byMinutes: number): Time {
    this.hour += byHours;
    this.minutes += byMinutes;

    while (this.minutes >= 60) {
      this.hour += 1;
      this.minutes -= 60;
    }

    while (this.minutes < 0) {
      this.hour -= 1;
      this.minutes += 60;
    }

    while (this.hour >= 24) {
      this.hour -= 24;
    }

    return this;
  }
}
