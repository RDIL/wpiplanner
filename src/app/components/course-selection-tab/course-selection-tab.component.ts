import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StudentSchedule} from '../../controllers/student-schedule';
import {Course} from '../../models/course';
import {DepartmentListComponent} from '../department-list/department-list.component';
import {CourseListComponent} from '../course-list/course-list.component';
import {CourseDetailsComponent} from '../course-details/course-details.component';

@Component({
  selector: 'course-selection-tab',
  standalone: true,
  imports: [CommonModule, DepartmentListComponent, CourseListComponent, CourseDetailsComponent],
  template: `
    <div class="course-selection-container">
      <div class="left-column">
        <department-list
          (departmentsChanged)="onDepartmentsChanged($event)"
        ></department-list>
      </div>

      <div class="middle-column">
        <course-list
          [studentSchedule]="studentSchedule"
          [departments]="selectedDepartments"
          (courseSelected)="onCourseSelected($event)"
        ></course-list>
      </div>

      <div class="right-column">
        <course-details
          [studentSchedule]="studentSchedule"
          [selectedCourse]="selectedCourse"
          (courseSelected)="onCourseSelected($event)"
        ></course-details>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .course-selection-container {
      display: flex;
      height: 100%;
      width: 100%;
      overflow: hidden;
    }

    .left-column {
      width: 250px;
      border-right: 1px solid var(--color-gray-border);
      overflow-y: auto;
      overflow-x: hidden;
      flex-shrink: 0;
      min-height: 0;
    }

    .middle-column {
      flex: 1;
      overflow-y: scroll;
      overflow-x: hidden;
      padding: 10px;
      min-height: 0;
    }

    .right-column {
      width: 300px;
      border-left: 1px solid var(--color-gray-border);
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-height: 0;
    }
  `,
})
export class CourseSelectionTabComponent {
  @Input() studentSchedule!: StudentSchedule;

  selectedDepartments: any[] = [];
  selectedCourse: Course | null = null;

  onDepartmentsChanged(departments: any[]): void {
    this.selectedDepartments = departments;
  }

  onCourseSelected(course: Course): void {
    this.selectedCourse = course;
  }
}

