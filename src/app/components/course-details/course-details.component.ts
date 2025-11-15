import {Component, Input, OnInit, OnDestroy, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Course} from '../../models/course';
import {StudentSchedule, SectionProducer} from '../../controllers/student-schedule';
import {TermTogglesComponent} from '../term-toggles/term-toggles.component';

@Component({
  selector: 'course-details',
  standalone: true,
  imports: [CommonModule, TermTogglesComponent],
  template: `
    <div class="course-details-container">
      <div class="selected-course-section" *ngIf="selectedCourse">
        <h3 class="course-title">{{ selectedCourse.toAbbreviation() }}</h3>
        <h4 class="course-name">{{ selectedCourse.name }}</h4>

        <div class="description" *ngIf="selectedCourse.description">
          <h5>Description</h5>
          <p>{{ selectedCourse.description }}</p>
        </div>

        <div class="professors" *ngIf="getProfessors().length > 0">
          <h5>Professors</h5>
          <ul class="professor-list">
            <li *ngFor="let professor of getProfessors()">{{ professor }}</li>
          </ul>
        </div>
      </div>

      <div class="no-selection" *ngIf="!selectedCourse">
        <p>Select a course to view details</p>
      </div>

      <div class="added-courses-section">
        <h4 class="section-title">Added Courses</h4>
        <div class="added-courses-list" *ngIf="getAddedCourses().length > 0; else noCourses">
          <div
            *ngFor="let producer of getAddedCourses()"
            class="added-course-item">
            <div class="course-info">
              <span class="course-id"
                    (click)="selectCourse(producer.getCourse())"
              >
                {{ producer.getCourse().toAbbreviation() }}
              </span>
              <term-toggles
                [producer]="producer"
                (termToggled)="toggleTerm(producer, $event)"
              ></term-toggles>
            </div>
            <button
              class="remove-button"
              (click)="removeCourse(producer.getCourse(), $event)"
              title="Remove course"
            >
              ×
            </button>
          </div>
        </div>

        <ng-template #noCourses>
          <p class="empty-message">No courses added yet</p>
        </ng-template>
      </div>
    </div>
  `,
  styleUrl: './course-details.component.css',
})
export class CourseDetailsComponent implements OnInit, OnDestroy {
  @Input() studentSchedule!: StudentSchedule;
  @Input() selectedCourse: Course | null = null;
  @Output() courseSelected = new EventEmitter<Course>();

  private unsubscribe?: () => void;

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    // Listen for course updates to refresh the added courses list
    this.unsubscribe = this.studentSchedule.on('courseUpdated', () => {
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  selectCourse(course: Course): void {
    this.courseSelected.emit(course);
  }

  removeCourse(course: Course, event: Event): void {
    event.stopPropagation();
    this.studentSchedule.removeCourse(course);
  }

  getProfessors(): string[] {
    if (!this.selectedCourse) {
      return [];
    }

    const professors = new Set<string>();
    for (const section of this.selectedCourse.sections) {
      for (const period of section.periods) {
        if (period.professor && period.professor.trim()) {
          professors.add(period.professor.trim());
        }
      }
    }

    return Array.from(professors).sort();
  }

  getAddedCourses(): SectionProducer[] {
    return this.studentSchedule.sectionProducers;
  }

  toggleTerm(producer: SectionProducer, term: string): void {
    producer.toggleTerm(term);
  }
}
