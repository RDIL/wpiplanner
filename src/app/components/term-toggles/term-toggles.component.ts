import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { SectionProducer } from '../../controllers/student-schedule';

@Component({
  selector: 'term-toggles',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="term-buttons">
      <button
        *ngFor="let term of ['A', 'B', 'C', 'D']"
        [class]="getTermButtonClass(term)"
        [disabled]="!isTermAvailable(term)"
        (click)="onTermClick(term, $event)"
        [title]="getTermButtonTitle(term)"
      >
        {{ term }}
      </button>
    </div>
  `,
  styles: `
    .term-buttons {
      display: flex;
      gap: 4px;
    }

    .term-buttons button {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      border: 1px solid var(--color-gray-border);
      cursor: pointer;
      font-size: 11px;
      font-weight: bold;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .term-buttons button:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .term-buttons button.term-selected {
      background-color: var(--color-wpi-red);
      color: var(--color-white);
      border-color: var(--color-wpi-red);
    }

    .term-buttons button:not(.term-selected):not(:disabled) {
      background-color: var(--color-gray-bg-light);
      color: var(--color-gray-medium);
    }

    .term-buttons button:not(.term-selected):not(:disabled):hover {
      background-color: var(--color-gray-border-very-light);
    }
  `,
})
export class TermTogglesComponent {
  @Input() producer!: SectionProducer;
  @Output() termToggled = new EventEmitter<string>();

  isTermAvailable(term: string): boolean {
    return this.producer.hasTermAvailable(term);
  }

  isTermSelected(term: string): boolean {
    return this.producer.isTermSelected(term);
  }

  getTermButtonClass(term: string): string {
    if (!this.isTermAvailable(term)) {
      return 'term-unavailable';
    }
    return this.isTermSelected(term) ? 'term-selected' : 'term-unselected';
  }

  getTermButtonTitle(term: string): string {
    if (!this.isTermAvailable(term)) {
      return `Course not offered during ${term} Term`;
    }
    if (this.isTermSelected(term)) {
      return `Selected for ${term} Term - Click to deselect`;
    }
    return `Not selected for ${term} Term - Click to select`;
  }

  onTermClick(term: string, event: Event): void {
    event.stopPropagation();
    this.termToggled.emit(term);
  }
}
