import {Component, Input, OnChanges, SimpleChanges, OnInit, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StudentSchedule} from '../../controllers/student-schedule';
import {Department} from '../../models/department';
import {Course} from '../../models/course';
import {CourseListItemComponent} from '../course-list-item/course-list-item.component';

@Component({
  selector: 'course-list',
  standalone: true,
  imports: [CommonModule, CourseListItemComponent],
  template: `
    <div class="course-list-wrapper">
      <table class="course-list">
        <tr course-list-item
            *ngFor="let course of courses"
            [course]="course"
            [studentSchedule]="studentSchedule"
            (courseSelected)="onCourseClick($event)">
        </tr>
      </table>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .course-list-wrapper {
      width: 100%;
    }

    .course-list {
      width: 100%;
      border-spacing: 0;
      display: table;
    }

    .course-list > tr:nth-child(even) {
      background: var(--color-course-list-even);
    }

    .course-list > tr:nth-child(odd) {
      background: var(--color-white);
    }

    .course-list > tr:hover {
      background: var(--color-course-list-hover);
    }
  `,
})
export class CourseListComponent implements OnChanges, OnInit {
  @Input() studentSchedule!: StudentSchedule;
  @Input() departments: Department[] = [];
  @Output() courseSelected = new EventEmitter<Course>();

  courses: Course[] = [];

  ngOnInit(): void {
    this.updateCourses();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['departments']) {
      this.updateCourses();
    }
  }

  onCourseClick(course: Course): void {
    this.courseSelected.emit(course);
  }

  private updateCourses(): void {
    this.courses = [];
    if (this.departments && this.departments.length > 0) {
      for (const department of this.departments) {
        if (department && department.courses) {
          this.courses.push(...department.courses);
        }
      }
    }
  }
}
