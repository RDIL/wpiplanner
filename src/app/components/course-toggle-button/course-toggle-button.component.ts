import {Component, Input, OnInit, OnDestroy, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StudentSchedule} from '../../controllers/student-schedule';
import {Course} from '../../models/course';

@Component({
  selector: 'course-toggle-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="course-toggle-button"
      [class.added]="isAdded"
      (click)="toggle($event)"
    >
      {{ isAdded ? '−' : '+' }}
    </button>
  `,
  styles: `
    .course-toggle-button {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--color-success);
      color: var(--color-white);

      &:hover {
        opacity: 0.8;
      }
    }

    .course-toggle-button.added {
      background-color: var(--color-button-remove);

      &:hover {
        background-color: var(--color-button-remove-hover);
      }
    }
  `,
})
export class CourseToggleButtonComponent implements OnInit, OnDestroy {
  @Input() course!: Course;
  @Input() studentSchedule!: StudentSchedule;
  @Input() courseSelected!: EventEmitter<Course>;

  isAdded = false;
  private unsubscribe?: () => void;

  ngOnInit(): void {
    this.update();
    this.unsubscribe = this.studentSchedule.on('courseUpdated', () => {
      this.update();
    });
  }

  ngOnDestroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  toggle(event: Event): void {
    event.stopPropagation();
    if (this.isAdded) {
      this.studentSchedule.removeCourse(this.course);
    } else {
      this.courseSelected.emit(this.course);
      try {
        this.studentSchedule.addCourse(this.course);
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Failed to add course');
      }
    }
    this.update();
  }

  private update(): void {
    const producer = this.studentSchedule.getSectionProducer(this.course);
    this.isAdded = producer !== null;
  }
}

