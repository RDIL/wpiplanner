import type { Course } from './course';
import { Period } from './period';

export class Section {
  course?: Course;
  number: string = ''; // TODO: rename this to something more accurate
  seats: number = 0;
  seatsAvailable: number = 0;
  semester: string = '';
  term: string = '';
  note: string = '';
  periods: Period[] = [];
  description: string = '';
  actualWaitlist: number = 0;
  maxWaitlist: number = 0;

  constructor(course?: Course) {
    this.course = course;
  }

  get usableInPermutations(): boolean {
    return !this.number.toLowerCase().startsWith('interest list');
  }

  get hasAvailableSeats(): boolean {
    for (const period of this.periods) {
      if (period.filled) {
        return false;
      }
    }
    return true;
  }

  get hasAvailableWaitlist(): boolean {
    for (const period of this.periods) {
      if (period.waitlistFilled) {
        return false;
      }
    }
    return true;
  }
}
