import {Component, Input, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StudentSchedule} from '../../controllers/student-schedule';
import {Course} from '../../models/course';
import {CourseToggleButtonComponent} from '../course-toggle-button/course-toggle-button.component';
import {TermViewComponent} from '../term-view/term-view.component';

@Component({
  selector: 'tr[course-list-item]',
  standalone: true,
  imports: [CommonModule, CourseToggleButtonComponent, TermViewComponent],
  template: `
    <td style="width: 36px; text-align: center; padding: 5px;" (click)="$event.stopPropagation()">
      <course-toggle-button
        [courseSelected]="courseSelected"
        [course]="course"
        [studentSchedule]="studentSchedule"
      ></course-toggle-button>
    </td>

    <td style="width: 100px; text-align: center; padding: 5px;" (click)="onRowClick()">
      {{ course.toAbbreviation() }}
    </td>

    <td style="width: 128px; padding: 5px;" (click)="onRowClick()">
      <term-view [course]="course"></term-view>
    </td>

    <td style="padding: 5px;" (click)="onRowClick()">
      <span
        *ngIf="!course.hasAvailableSeats && course.hasAvailableWaitlist"
        title="No remaining seats, but waitlist is available."
      >⚠️</span>
      <span
        *ngIf="!course.hasAvailableSeats && !course.hasAvailableWaitlist"
        title="No remaining seats, no waitlist available."
      >🔴</span>
      {{ course.name }}
    </td>
  `,
  styles: `
    :host {
      cursor: pointer;
    }

    :host:hover {
      background-color: var(--color-gray-bg-light);
    }
  `,
})
export class CourseListItemComponent {
  @Input() course!: Course;
  @Input() studentSchedule!: StudentSchedule;
  @Output() courseSelected = new EventEmitter<Course>();

  onRowClick(): void {
    this.courseSelected.emit(this.course);
  }
}
