import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'loading-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-overlay" *ngIf="isLoading">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div class="loading-text">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: `
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--color-overlay-white);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid var(--color-gray-bg-light);
      border-top: 4px solid var(--color-wpi-red);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-text {
      font-size: 16px;
      color: var(--color-gray-dark);
      font-weight: 500;
      text-align: center;
    }
  `,
})
export class LoadingOverlayComponent {
  @Input() isLoading: boolean = false;
}

