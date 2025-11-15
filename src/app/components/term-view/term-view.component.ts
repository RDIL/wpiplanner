import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Course } from '../../models/course';

@Component({
  selector: 'term-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="term-view">
      <button
        *ngFor="let term of terms"
        [class]="getTermClass(term)"
        [title]="getTermTitle(term)"
        [disabled]="!hasTerm(term)"
      >
        {{ term }}
      </button>
    </div>
  `,
  styles: `
    .term-view {
      display: flex;
      gap: 4px;
    }

    button {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid var(--color-gray-border);
      cursor: pointer;
      font-size: 12px;
      font-weight: bold;
      padding: 0;
    }

    button:disabled {
      opacity: 0.2;
      cursor: not-allowed;
    }

    .available {
      background-color: var(--color-term-available-bg);
      color: var(--color-black);
      border-color: var(--color-term-available-border);
    }

    .waitlist {
      background-color: var(--color-term-waitlist-bg);
      color: var(--color-black);
    }

    .full {
      background-color: var(--color-term-full-bg);
      color: var(--color-black);
      border-color: var(--color-term-full-border);
    }

    .not-offered {
      background-color: var(--color-term-not-offered-bg);
      color: var(--color-gray-medium);
      border-color: var(--color-term-not-offered-border);
    }
  `,
})
export class TermViewComponent {
  @Input() course!: Course;
  terms = ['A', 'B', 'C', 'D'];

  hasTerm(term: string): boolean {
    for (const section of this.course.sections) {
      if (section.term && section.term.includes(`${term} Term`)) {
        return true;
      }
    }
    return false;
  }

  getTermClass(term: string): string {
    if (!this.hasTerm(term)) {
      return 'not-offered';
    }
    if (this.course.hasAvailableSeatsForTerm(term)) {
      return 'available';
    }
    if (this.course.hasAvailableWaitlistForTerm(term)) {
      return 'waitlist';
    }
    return 'full';
  }

  getTermTitle(term: string): string {
    if (!this.hasTerm(term)) {
      return `Course not offered during ${term} Term.`;
    }
    if (this.course.hasAvailableSeatsForTerm(term)) {
      return `Seats available during ${term} Term.`;
    }
    if (this.course.hasAvailableWaitlistForTerm(term)) {
      return `No seats left, but waitlist available during ${term} Term.`;
    }
    return `No seats left during ${term} Term.`;
  }
}
