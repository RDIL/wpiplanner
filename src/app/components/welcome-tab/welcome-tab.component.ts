import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ScheduleDB} from "../../models/schedule-db";

@Component({
  selector: 'welcome-tab',
  standalone: true,
  imports: [CommonModule],
  providers: [ScheduleDB],
  template: `
    <div style="padding: 20px;">
      <h2>Welcome to WPI Planner</h2>
      <p>Welcome view - to be implemented</p>

      <h3>Term color reference</h3>

      <ul>
        <li>Green: the term is enabled and has available seats.</li>
        <li>Blue: the term is enabled and has no available seats, but has spots on the waitlist.</li>
        <li>Orange: the term is enabled but has no available seats or spots on the waitlist.</li>
        <li>Red: the term is disabled. This color is only shown in the bottom right in the Courses box and Schedules
          tab.
        </li>
      </ul>

      <p>
        You will see a red warning symbol next to a class name when the class or section is filled with no spots on the
        waitlist.
        You will see a blue warning symbol when the class is filled, but has slots on the waitlist.
        If you cannot see the different color warning icons on your browser, hover over the icon to see which warning it
        is.
      </p>

      <div class="stats">
        <h3>Stats</h3>

        <div class="year-label">{{ yearLabel }}</div>
        <div class="updated-label">{{ updatedLabel }}</div>
      </div>
    </div>
  `,
  styles: `
    .year-label {
      font-size: 18px;
      font-weight: bold;
    }

    .updated-label {
      font-size: 12px;
      margin-top: 5px;
    }
  `,
})
export class WelcomeTabComponent implements OnInit {
  private scheduleDB = inject(ScheduleDB);

  yearLabel = '';
  updatedLabel = '';

  ngOnInit(): void {
    this.updateRefreshTimestamp();
  }

  private updateRefreshTimestamp(): void {
    this.updatedLabel = `Schedule Data Refreshed: ${this.scheduleDB.generated}`;
  }
}
