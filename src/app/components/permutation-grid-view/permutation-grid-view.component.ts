import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import type {SchedulePermutation} from '../../utils/permutation-generator';
import type {Period} from '../../models/period';
import {DayOfWeek} from '../../models/day-of-week';
import {Course} from "../../models/course";

interface GridCell {
  period?: Period;
  course?: Course;
  rowSpan: number;
  startHour: number;
  startMinute: number;
}

@Component({
  selector: 'permutation-grid-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid-content" *ngIf="permutation; else noSelection">
      <div class="terms-grid">
        <div class="term-grid-container" *ngFor="let term of ['A', 'B', 'C', 'D']">
          <div class="term-label">{{ term }} Term</div>

          <div class="schedule-grid">
            <div class="grid-header">
              <div class="time-column-header"></div>
              <div class="day-header" *ngFor="let day of weekDays">{{ day }}</div>
            </div>

            <div class="grid-body">
              <ng-container *ngFor="let hour of hours">
                <div class="time-label">{{ formatHour(hour) }}</div>
                <div class="hour-row" *ngFor="let day of weekDays">
                  <div class="cell">
                    <div
                      *ngFor="let cell of getCellsForSlot(day, hour, term)"
                      class="period-block"
                      [style.top.px]="getTopOffset(cell)"
                      [style.height.px]="getHeight(cell)"
                      [style.background-color]="getCourseColor(cell.course)"
                      [title]="getPeriodTooltip(cell.period)"
                    >
                      <div class="period-content">
                        <div class="period-course">{{ cell.course?.toAbbreviation() }}</div>
                        <div class="period-type">{{ cell.period?.type }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </ng-container>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #noSelection>
      <div class="no-selection">
        <p>Select a schedule candidate to view grid</p>
      </div>
    </ng-template>
  `,
  styleUrl: './permutation-grid-view.component.css',
})
export class PermutationGridViewComponent {
  @Input() permutation: SchedulePermutation | null = null;

  weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  hours: number[] = [];
  cellHeight = 35; // pixels per hour

  // Color palette for courses - matches CSS variables
  private courseColors: string[] = [
    '#c41230', // WPI red (--color-wpi-red)
    '#2196F3', // Blue (--color-course-blue)
    '#4CAF50', // Green (--color-course-green)
    '#FF9800', // Orange (--color-course-orange)
    '#9C27B0', // Purple (--color-course-purple)
    '#00BCD4', // Cyan (--color-course-cyan)
    '#FF5722', // Deep Orange (--color-course-deep-orange)
    '#795548', // Brown (--color-course-brown)
    '#607D8B', // Blue Grey (--color-course-blue-grey)
    '#E91E63', // Pink (--color-course-pink)
  ];

  private courseColorMap = new Map<any, string>();

  constructor() {
    for (let i = 8; i <= 17; i++) {
      this.hours.push(i);
    }
  }

  getDayEnum(dayName: string): DayOfWeek {
    const dayMap: Record<string, DayOfWeek> = {
      'Monday': DayOfWeek.MONDAY,
      'Tuesday': DayOfWeek.TUESDAY,
      'Wednesday': DayOfWeek.WEDNESDAY,
      'Thursday': DayOfWeek.THURSDAY,
      'Friday': DayOfWeek.FRIDAY,
    };
    return dayMap[dayName] || DayOfWeek.MONDAY;
  }

  getCellsForSlot(dayName: string, hour: number, term: string): GridCell[] {
    if (!this.permutation) return [];

    const day = this.getDayEnum(dayName);
    const cells: GridCell[] = [];

    for (const section of this.permutation.sections) {
      // Check if section matches the term
      if (!this.sectionMatchesTerm(section, term)) {
        continue;
      }

      for (const period of section.periods) {
        if (!period.days.has(day) || !period.startTime || !period.endTime) {
          continue;
        }

        const startHour = period.startTime.hour;
        const startMinute = period.startTime.minutes;
        const endHour = period.endTime.hour;
        const endMinute = period.endTime.minutes;

        if (startHour === hour) {
          const periodStart = startHour + startMinute / 60;
          const periodEnd = endHour + endMinute / 60;
          const duration = periodEnd - periodStart;

          const rowSpan = Math.ceil(duration * this.cellHeight);

          cells.push({
            period,
            course: section.course,
            rowSpan,
            startHour,
            startMinute
          });
        }
      }
    }

    return cells;
  }

  sectionMatchesTerm(section: any, term: string): boolean {
    if (!section.term) return false;

    // Check if section matches the term using the same logic as Course.hasAvailableSeatsForTerm
    // Terms can be like "A Term", "A Term, B Term", etc.
    const sectionTerm = section.term;

    // Check first character (e.g., "A Term" -> 'A')
    if (sectionTerm.charAt(0) === term.charAt(0)) {
      return true;
    }

    // Check after position 8 (e.g., "A Term, B Term" -> check 'B' at position 8+)
    return sectionTerm.substring(8)?.charAt(0) === term.charAt(0);
  }

  getTopOffset(cell: GridCell): number {
    if (!cell.period?.startTime) return 0;
    const minutes = cell.startMinute;
    return (minutes / 60) * this.cellHeight;
  }

  getHeight(cell: GridCell): number {
    return cell.rowSpan;
  }

  getCourseColor(course: any): string {
    if (!course) return '#999';

    if (!this.courseColorMap.has(course)) {
      const index = this.courseColorMap.size % this.courseColors.length;
      this.courseColorMap.set(course, this.courseColors[index]);
    }

    return this.courseColorMap.get(course)!;
  }

  formatHour(hour: number): string {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  }

  getPeriodTime(period: Period | undefined): string {
    if (!period?.startTime || !period?.endTime) return '';
    return `${period.startTime.toString()} - ${period.endTime.toString()}`;
  }

  getPeriodTooltip(period: Period | undefined): string {
    if (!period) return '';
    const course = period.section?.course;
    const parts = [
      course?.toAbbreviation(),
      period.section?.number,
      period.type,
      period.professor || 'Not Assigned',
      period.location || 'Unknown',
      this.getPeriodTime(period)
    ].filter(Boolean);
    return parts.join(' | ');
  }
}
