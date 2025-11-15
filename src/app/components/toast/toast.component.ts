import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast" *ngIf="show" [class]="type">
      <div class="toast-content">
        <span class="toast-message">
          <ng-content></ng-content>
        </span>
        <button class="toast-close" (click)="onClose()" *ngIf="dismissible">×</button>
      </div>
    </div>
  `,
  styles: `
    .toast {
      position: fixed;
      top: 20px;
      right: 20px;
      min-width: 300px;
      max-width: 500px;
      background-color: var(--color-white);
      border-radius: 8px;
      box-shadow: 0 4px 12px var(--color-shadow-black);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      border-left: 4px solid;
    }

    @media screen and (prefers-reduced-motion: reduce) {
      .toast {
        animation: none;
      }
    }

    .toast.info {
      border-left-color: var(--color-info);
    }

    .toast.warning {
      border-left-color: var(--color-warning);
    }

    .toast.error {
      border-left-color: var(--color-error);
    }

    .toast.success {
      border-left-color: var(--color-success);
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      gap: 12px;
    }

    .toast-message {
      flex: 1;
      font-size: 14px;
      color: var(--color-gray-dark);
      line-height: 1.5;
    }

    .toast-close {
      background: none;
      border: none;
      font-size: 24px;
      color: var(--color-gray-medium);
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      flex-shrink: 0;
      transition: color 0.2s;

      &:hover {
        color: var(--color-gray-dark);
      }
    }
  `,
})
export class ToastComponent implements OnChanges {
  @Input() show: boolean = false;
  @Input() type: 'info' | 'warning' | 'error' | 'success' = 'info';
  @Input() dismissible: boolean = true;
  /**
   * In milliseconds. 0 means keep open until the user manually closes it.
   */
  @Input() autoHide: number = 0;
  @Output() close = new EventEmitter<void>();

  private autoHideTimeout?: number;

  ngOnChanges(): void {
    if (this.show && this.autoHide > 0) {
      this.scheduleAutoHide();
    } else if (!this.show) {
      this.clearAutoHide();
    }
  }

  onClose(): void {
    this.show = false;
    this.clearAutoHide();
    this.close.emit();
  }

  private scheduleAutoHide(): void {
    this.clearAutoHide();
    this.autoHideTimeout = window.setTimeout(() => {
      this.onClose();
    }, this.autoHide);
  }

  private clearAutoHide(): void {
    if (this.autoHideTimeout) {
      clearTimeout(this.autoHideTimeout);
      this.autoHideTimeout = undefined;
    }
  }
}
