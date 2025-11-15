import {ScheduleDB} from '../models/schedule-db';
import {Department} from '../models/department';
import {Course} from '../models/course';
import {Section} from '../models/section';
import {Period} from '../models/period';
import {Time} from '../models/time';
import {getDayByName} from '../models/day-of-week';
import {DataParser} from "./parser-base";

export class JsonParser implements DataParser {
  get name(): string {
    return 'json';
  }

  load(json: string, db: ScheduleDB): void {
    let jsonData = JSON.parse(json);

    if (!Array.isArray(jsonData)) {
      // Handle case where data is wrapped in an object
      if (jsonData.departments && Array.isArray(jsonData.departments)) {
        jsonData = jsonData.departments;
      } else {
        throw new Error('Invalid JSON format: expected departments array');
      }
    }

    for (const deptData of jsonData) {
      const department = this.readDepartmentNode(deptData);
      db.departments.push(department);
    }
  }

  private readDepartmentNode(node: any): Department {
    const department = new Department();
    department.abbreviation = node.abbrev || '';
    department.name = node.name || '';

    const courses = node.courses || [];
    for (const courseData of courses) {
      const course = this.readCourseNode(department, courseData);
      department.courses.push(course);
    }

    return department;
  }

  private readCourseNode(department: Department, node: any): Course {
    const course = new Course(department);
    course.name = node.name || '';
    course.number = node.number || '';
    course.description = node.description || '';

    const sections = node.sections || [];
    for (const sectionData of sections) {
      const section = this.readSectionNode(course, sectionData);
      course.sections.push(section);
    }

    return course;
  }

  private readSectionNode(course: Course, node: any): Section {
    const section = new Section(course);
    section.number = node.number || '';
    section.seats = typeof node.seats === 'number' ? node.seats : parseInt(node.seats, 10);
    section.seatsAvailable = typeof node.availableseats === 'number'
      ? node.availableseats
      : parseInt(node.availableseats, 10);
    section.note = node.note || '';
    section.term = node.partOfTerm || '';

    const periods = node.periods || [];
    for (const periodData of periods) {
      const period = this.readPeriodNode(section, periodData);
      section.periods.push(period);
    }

    return section;
  }

  private readPeriodNode(section: Section, node: any): Period {
    const period = new Period(section);
    period.type = node.type || '';
    period.professor = node.professor || '';
    period.startTime = this.readTime(node.starts);
    period.endTime = this.readTime(node.ends);
    period.location = node.location || '';

    const days = node.days || [];
    if (days.length === 1 && days[0] === 'UNKNOWN') {
      period.days = new Set();
    } else {
      for (const day of days) {
        try {
          period.days.add(getDayByName(day));
        } catch (e) {
          console.warn(`Unknown day: ${day}`);
        }
      }
    }

    return period;
  }

  private readTime(value: number): Time {
    const minute = Math.floor(value % 100.0);
    let hour = Math.floor(value / 100.0);

    if (hour === 0) {
      hour = 12;
    }

    return new Time(hour, minute);
  }
}
