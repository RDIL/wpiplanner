import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentSchedule } from '../../controllers/student-schedule';

@Component({
  selector: 'time-tab',
  standalone: true,
  imports: [CommonModule],
  // TODO
  template: `
    <div style="padding: 20px;">
      <h2>Time Chooser</h2>
      <p>Time chooser view - to be implemented</p>
    </div>
  `
})
export class TimeTabComponent {
  @Input() studentSchedule!: StudentSchedule;
}
