import type {Department} from './department';
import {Section} from './section';

export class Course {
  department?: Department;
  name: string = '';
  number: string = '';
  sections: Section[] = [];
  description: string = '';

  constructor(department?: Department) {
    this.department = department;
  }

  toString(): string {
    return `${this.name} (${this.toAbbreviation()})`;
  }

  toAbbreviation(): string {
    return (this.department?.abbreviation ?? '') + this.number;
  }

  get hasAvailableSeats(): boolean {
    for (const section of this.sections) {
      if (section.hasAvailableSeats) {
        return true;
      }
    }
    return false;
  }

  hasAvailableSeatsForTerm(term: string): boolean {
    for (const section of this.sections) {
      if (section.hasAvailableSeats && section.term.charAt(0) === term.charAt(0)) {
        return true;
      } else if (section.hasAvailableSeats && section.term.substring(8)?.charAt(0) === term.charAt(0)) {
        return true;
      }
    }
    return false;
  }

  get hasAvailableWaitlist(): boolean {
    for (const section of this.sections) {
      if (section.hasAvailableWaitlist) {
        return true;
      }
    }
    return false;
  }

  hasAvailableWaitlistForTerm(term: string): boolean {
    for (const section of this.sections) {
      if (section.hasAvailableWaitlist && section.term.charAt(0) === term.charAt(0)) {
        return true;
      } else if (section.hasAvailableWaitlist && section.term.substring(8)?.charAt(0) === term.charAt(0)) {
        return true;
      }
    }
    return false;
  }
}
