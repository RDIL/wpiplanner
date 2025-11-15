import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { SchedulePermutation } from '../../utils/permutation-generator';
import type { Period } from '../../models/period';
import { getDayShortName } from '../../models/day-of-week';

@Component({
  selector: 'permutation-detail-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="detail-content" *ngIf="permutation; else noSelection">
      <div class="conflicts-warning" *ngIf="permutation.conflicts.length > 0">
        <h3>⚠️ Schedule Conflicts Detected</h3>
        <div class="conflict-list">
          <div *ngFor="let conflict of permutation.conflicts" class="conflict-item">
            <strong>{{ conflict.section1.course?.toAbbreviation() }} {{ conflict.section1.number }}</strong>
            vs
            <strong>{{ conflict.section2.course?.toAbbreviation() }} {{ conflict.section2.number }}</strong>
            <div class="conflict-details">
              <span>{{ getConflictDay(conflict) }}</span>:
              {{ conflict.period1.startTime?.toString() }} - {{ conflict.period1.endTime?.toString() }}
              vs
              {{ conflict.period2.startTime?.toString() }} - {{ conflict.period2.endTime?.toString() }}
            </div>
          </div>
        </div>
      </div>
      <div class="course-detail-section" *ngFor="let course of getUniqueCourses(permutation)">
        <div class="course-header">
          <h3 class="course-abbrev">{{ course.toAbbreviation() }}</h3>
          <h4 class="course-name">{{ course.name }}</h4>
          <div class="section-codes">Section(s): {{ getSectionCodesForCourse(course) }}</div>
        </div>

        <table class="section-table">
          <thead>
            <tr>
              <th>Section</th>
              <th>Professor</th>
              <th>Location</th>
              <th>Type</th>
              <th>Seats Available</th>
              <th>Waitlist Spots Occupied</th>
              <th>Weekdays</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let period of getPeriodsForCourse(course)">
              <td>{{ period.section?.number }}</td>
              <td>{{ period.professor || 'Not Assigned' }}</td>
              <td>{{ period.location || 'Unknown' }}</td>
              <td>{{ period.type }}</td>
              <td>{{ period.seatsAvailable }}/{{ period.seats }}</td>
              <td>{{ period.actualWaitlist }}/{{ period.maxWaitlist }}</td>
              <td>{{ getWeekdaysString(period) }}</td>
              <td>{{ period.startTime?.toString() || 'N/A' }}</td>
              <td>{{ period.endTime?.toString() || 'N/A' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ng-template #noSelection>
      <div class="no-selection">
        <p>Select a schedule candidate to view details</p>
      </div>
    </ng-template>
  `,
  styleUrl: './permutation-detail-view.component.css',
})
export class PermutationDetailViewComponent {
  @Input() permutation: SchedulePermutation | null = null;

  getUniqueCourses(permutation: SchedulePermutation): any[] {
    const courses = new Set<any>();
    for (const section of permutation.sections) {
      if (section.course) {
        courses.add(section.course);
      }
    }
    return Array.from(courses);
  }

  getSectionCodesForCourse(course: any): string {
    if (!this.permutation) return '';
    const sections = this.permutation.sections.filter(s => s.course === course);
    return sections.map(s => s.number).join('/');
  }

  getPeriodsForCourse(course: any): Period[] {
    if (!this.permutation) return [];
    const sections = this.permutation.sections.filter(s => s.course === course);
    const periods: Period[] = [];
    for (const section of sections) {
      periods.push(...section.periods);
    }
    return periods;
  }

  getWeekdaysString(period: Period): string {
    const days = Array.from(period.days).map(d => getDayShortName(d).toLowerCase());
    return days.join(', ') || '';
  }

  getConflictDay(conflict: any): string {
    const commonDays: string[] = [];
    for (const day of conflict.period1.days) {
      if (conflict.period2.days.has(day)) {
        commonDays.push(getDayShortName(day));
      }
    }
    return commonDays.join(', ') || 'Unknown day';
  }
}
