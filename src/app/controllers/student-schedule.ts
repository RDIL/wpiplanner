import type {Course} from '../models/course';
import type {Section} from '../models/section';
import {EventEmitter} from '../utils/event-emitter';
import {Storage} from '../utils/storage';

export enum StudentScheduleEventType {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
  UPDATE = 'UPDATE',
}

export interface StudentScheduleEvent {
  course: Course;
  type: StudentScheduleEventType;
}

export class SectionProducer {
  private studentSchedule: StudentSchedule;
  private course: Course;
  private selectedTerms: Set<string> = new Set();

  constructor(studentSchedule: StudentSchedule, course: Course) {
    this.studentSchedule = studentSchedule;
    this.course = course;
    // Default: select all available terms
    this.initializeDefaultTerms();
  }

  getCourse(): Course {
    return this.course;
  }

  private initializeDefaultTerms(): void {
    const terms = ['A', 'B', 'C', 'D'];
    for (const term of terms) {
      if (this.course.hasAvailableSeatsForTerm(term) || this.course.hasAvailableWaitlistForTerm(term)) {
        this.selectedTerms.add(term);
      }
    }
  }

  isTermSelected(term: string): boolean {
    return this.selectedTerms.has(term);
  }

  toggleTerm(term: string): void {
    if (this.selectedTerms.has(term)) {
      this.selectedTerms.delete(term);
    } else {
      this.selectedTerms.add(term);
    }
    this.studentSchedule.courseUpdated(this.course);
  }

  getSelectedTerms(): string[] {
    return Array.from(this.selectedTerms).sort();
  }

  hasTermAvailable(term: string): boolean {
    return this.course.hasAvailableSeatsForTerm(term) || this.course.hasAvailableWaitlistForTerm(term);
  }

  getSections(): Section[] {
    const sections: Section[] = [];
    const selectedTerms = this.getSelectedTerms();

    for (const section of this.course.sections) {
      // Check if section has available seats or waitlist
      if (!section.hasAvailableSeats && !section.hasAvailableWaitlist) {
        continue;
      }

      // Check if section matches any selected term
      let matchesTerm = false;
      for (const term of selectedTerms) {
        if (section.term.charAt(0) === term.charAt(0)) {
          matchesTerm = true;
          break;
        } else if (section.term.substring(8)?.charAt(0) === term.charAt(0)) {
          matchesTerm = true;
          break;
        }
      }

      if (matchesTerm) {
        sections.push(section);
      }
    }

    return sections;
  }
}

export class StudentSchedule extends EventEmitter {
  sectionProducers: SectionProducer[] = [];
  studentTermTimes: any; // TODO: implement StudentTermTimes
  startTime: number = 8.0;
  endTime: number = 16.0;

  constructor() {
    super();
    this.loadFromStorage();
  }

  addCourse(course: Course): SectionProducer | null {
    for (const producer of this.sectionProducers) {
      if (producer.getCourse() === course) {
        throw new Error('The course is already in the list of producers!');
      }
    }

    if (this.sectionProducers.length >= 18) {
      alert('There is a hard-coded limit of 18 courses.');
      return null;
    }

    const producer = new SectionProducer(this, course);
    this.sectionProducers.push(producer);

    this.courseUpdated(course, StudentScheduleEventType.ADD);
    this.saveToStorage();

    return producer;
  }

  getSectionProducer(course: Course): SectionProducer | null {
    for (const producer of this.sectionProducers) {
      if (producer.getCourse() === course) {
        return producer;
      }
    }
    return null;
  }

  removeCourse(course: Course): void {
    const producer = this.getSectionProducer(course);
    if (producer) {
      const index = this.sectionProducers.indexOf(producer);
      if (index > -1) {
        this.sectionProducers.splice(index, 1);
        this.courseUpdated(course, StudentScheduleEventType.REMOVE);
        this.saveToStorage();
      }
    }
  }

  courseUpdated(course: Course, eventType: StudentScheduleEventType = StudentScheduleEventType.UPDATE): void {
    this.updateTimeRange();
    const event: StudentScheduleEvent = {course, type: eventType};
    this.emit('courseUpdated', event);
    this.saveToStorage();
  }

  private updateTimeRange(): void {
    let startTime = 10.0;
    let endTime = 16.0;

    for (const producer of this.sectionProducers) {
      for (const section of producer.getCourse().sections) {
        for (const period of section.periods) {
          if (period.startTime && period.endTime) {
            startTime = Math.min(period.startTime.value, startTime);
            endTime = Math.max(period.endTime.value, endTime);
          }
        }
      }
    }

    this.setTimeRange(startTime, endTime);
  }

  get startHour(): number {
    return this.startTime;
  }

  get endHour(): number {
    return this.endTime;
  }

  setTimeRange(startTime: number, endTime: number): void {
    startTime = Math.floor(startTime);
    endTime = Math.ceil(endTime);

    if (this.startTime === startTime && this.endTime === endTime) {
      return;
    }

    this.startTime = startTime;
    this.endTime = endTime;

    this.emit('timeRangeChanged', {startTime, endTime});
  }

  private saveToStorage(): void {
    const data = {
      sectionProducers: this.sectionProducers.map(p => ({
        course: {
          department: {
            abbreviation: p.getCourse().department?.abbreviation,
            name: p.getCourse().department?.name,
          },
          name: p.getCourse().name,
          number: p.getCourse().number,
        },
      })),
    };
    Storage.saveSchedule(data);
  }

  private loadFromStorage(): void {
    const data = Storage.loadSchedule();
    if (data && data.sectionProducers) {
      // TODO: Restore section producers from storage
      // This would require access to ScheduleDB to look up courses
    }
  }
}
