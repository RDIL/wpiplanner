import { Time } from './time';
import { DayOfWeek } from './day-of-week';
import type { Section } from './section';

export class Period {
  section?: Section;
  type: string = '';
  professor: string = '';
  days: Set<DayOfWeek> = new Set();
  startTime?: Time;
  endTime?: Time;
  location: string = '';
  seats: number = 0;
  seatsAvailable: number = 0;
  actualWaitlist: number = 0;
  maxWaitlist: number = 0;
  specificSection: string = '';

  constructor(section?: Section) {
    this.section = section;
  }

  get filled(): boolean {
    return this.seatsAvailable <= 0;
  }

  get waitlistFilled(): boolean {
    return this.actualWaitlist === this.maxWaitlist;
  }
}
