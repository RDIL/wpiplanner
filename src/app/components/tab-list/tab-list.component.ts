import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StudentSchedule} from '../../controllers/student-schedule';
import {ScheduleDB} from '../../models/schedule-db';
import {CourseSelectionTabComponent} from '../course-selection-tab/course-selection-tab.component';
import {WelcomeTabComponent} from '../welcome-tab/welcome-tab.component';
import {TimeTabComponent} from '../time-tab/time-tab.component';
import {PermutationTabComponent} from '../permutation-tab/permutation-tab.component';

@Component({
  selector: 'tab-list',
  standalone: true,
  imports: [
    CommonModule,
    CourseSelectionTabComponent,
    WelcomeTabComponent,
    TimeTabComponent,
    PermutationTabComponent
  ],
  template: `
    <div class="tab-list-container">
      <div class="tabs">
        <button
          *ngFor="let tab of tabs"
          [class.selected]="selectedTab === tab.id"
          (click)="selectTab(tab.id)"
          class="tab-button"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <course-selection-tab
          *ngIf="selectedTab === 'courses'"
          [studentSchedule]="studentSchedule"
        ></course-selection-tab>

        <welcome-tab
          *ngIf="selectedTab === 'welcome'"
        ></welcome-tab>

        <time-tab
          *ngIf="selectedTab === 'time'"
          [studentSchedule]="studentSchedule"
        ></time-tab>
  
        <permutation-tab
          *ngIf="selectedTab === 'permutation'"
          [studentSchedule]="studentSchedule">
        </permutation-tab>
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

    .tab-list-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      min-height: 0;
      overflow: hidden;
    }

    .tabs {
      background-color: var(--color-wpi-red);
      display: flex;
      border-bottom: 2px solid var(--color-wpi-red);
      position: sticky;
      top: 0;
      z-index: 100;
      flex-shrink: 0;
    }

    .tab-button {
      font-size: 20px;
      padding: 10px 75px;
      border: none;
      background-color: var(--color-wpi-red);
      color: var(--color-white);
      cursor: pointer;
    }

    .tab-button.selected {
      background-color: var(--color-wpi-red);
      font-weight: bold;
    }

    .tab-button:not(.selected):hover {
      background-color: var(--color-wpi-red-hover);
    }

    .tab-content {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
  `,
})
export class TabListComponent {
  @Input() studentSchedule!: StudentSchedule;

  selectedTab = 'courses';

  tabs = [
    {id: 'courses', label: 'Courses'},
    {id: 'welcome', label: 'Welcome'},
    {id: 'time', label: 'Time Chooser'},
    {id: 'permutation', label: 'Schedules'}
  ];

  selectTab(tabId: string): void {
    this.selectedTab = tabId;
  }
}
