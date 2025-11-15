import {ScheduleDB} from '../models/schedule-db';
import {Department} from '../models/department';
import {Course} from '../models/course';
import {Section} from '../models/section';
import {Period} from '../models/period';
import {Time} from '../models/time';
import {DayOfWeek, getDayByShortName} from '../models/day-of-week';
import {DataParser} from "./parser-base";

export class XmlParser implements DataParser {
  get name(): string {
    return 'xml';
  }

  load(xmlText: string, db: ScheduleDB): void {
    // Remove XML declaration if present (handles version 1.1 issue)
    let cleanXml = xmlText.trim();
    if (cleanXml.startsWith('<?xml')) {
      const firstNewline = cleanXml.indexOf('\n');
      if (firstNewline > 0) {
        cleanXml = cleanXml.substring(firstNewline + 1);
      }
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanXml, 'text/xml');

    // Check for parsing errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      throw new Error(`XML Parse Error: ${parseError.textContent}`);
    }

    // Get generated date from schedb element
    const schedbElement = doc.querySelector('schedb');
    if (schedbElement) {
      db.generated = schedbElement.getAttribute('generated') || '';
    }

    // Parse departments
    const deptElements = doc.querySelectorAll('dept');
    for (const deptElement of Array.from(deptElements)) {
      const department = this.readDepartmentNode(deptElement);
      db.departments.push(department);
    }
  }

  private readDepartmentNode(element: Element): Department {
    const department = new Department();
    department.abbreviation = element.getAttribute('abbrev') || '';
    department.name = element.getAttribute('name') || '';

    const courseElements = element.querySelectorAll('course');
    for (const courseElement of Array.from(courseElements)) {
      const course = this.readCourseNode(department, courseElement);
      department.courses.push(course);
    }

    return department;
  }

  private readCourseNode(department: Department, element: Element): Course {
    const course = new Course(department);
    course.name = element.getAttribute('name') || '';
    course.number = element.getAttribute('number') || '';
    course.description = element.getAttribute('course_desc') || '';

    // Get section elements (direct children that are sections)
    const sectionElements = Array.from(element.children).filter(
      el => el.tagName === 'section'
    );

    for (const sectionElement of sectionElements) {
      const section = this.readSectionNode(course, sectionElement);
      course.sections.push(section);
    }

    return course;
  }

  private readSectionNode(course: Course, element: Element): Section {
    const section = new Section(course);
    section.number = element.getAttribute('number') || '';
    section.seats = parseInt(element.getAttribute('seats') || '0', 10);
    section.seatsAvailable = parseInt(element.getAttribute('availableseats') || '0', 10);
    section.actualWaitlist = parseInt(element.getAttribute('actual_waitlist') || '0', 10);
    section.maxWaitlist = parseInt(element.getAttribute('max_waitlist') || '0', 10);
    section.note = element.getAttribute('note') || '';
    section.description = element.getAttribute('sec_desc') || '';
    section.term = element.getAttribute('part-of-term') || '';

    // Get period elements (direct children that are periods)
    const periodElements = Array.from(element.children).filter(
      el => el.tagName === 'period'
    );

    for (const periodElement of periodElements) {
      const period = this.readPeriodNode(section, periodElement);
      section.periods.push(period);
    }

    return section;
  }

  private readPeriodNode(section: Section, element: Element): Period {
    const period = new Period(section);
    period.type = element.getAttribute('type') || '';
    period.professor = element.getAttribute('professor') || '';

    const startsAttr = element.getAttribute('starts');
    const endsAttr = element.getAttribute('ends');

    if (startsAttr) {
      period.startTime = new Time(startsAttr);
    }
    if (endsAttr) {
      period.endTime = new Time(endsAttr);
    }

    const building = element.getAttribute('building') || '';
    const room = element.getAttribute('room') || '';
    period.location = building + room;

    period.seats = parseInt(element.getAttribute('seats') || '0', 10);
    period.seatsAvailable = parseInt(element.getAttribute('availableseats') || '0', 10);
    period.actualWaitlist = parseInt(element.getAttribute('actual_waitlist') || '0', 10);
    period.maxWaitlist = parseInt(element.getAttribute('max_waitlist') || '0', 10);
    period.specificSection = element.getAttribute('section') || '';

    const daysAttr = element.getAttribute('days');
    if (daysAttr && daysAttr !== '?') {
      period.days = this.getDaysOfWeek(daysAttr);
    }

    return period;
  }

  private getDaysOfWeek(value: string): Set<DayOfWeek> {
    const days = new Set<DayOfWeek>();
    const dayStrings = value.split(',').map(d => d.trim());

    for (const dayStr of dayStrings) {
      try {
        days.add(getDayByShortName(dayStr));
      } catch (e) {
        console.warn(`Unknown day: ${dayStr}`);
      }
    }

    return days;
  }
}
