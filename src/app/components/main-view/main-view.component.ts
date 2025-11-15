import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StudentSchedule} from '../../controllers/student-schedule';
import {TabListComponent} from '../tab-list/tab-list.component';

@Component({
  selector: 'main-view',
  standalone: true,
  imports: [CommonModule, TabListComponent],
  template: `
    <div class="main-view">
      <div class="tab-list-wrapper">
        <tab-list [studentSchedule]="studentSchedule"></tab-list>
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

    .main-view {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      overflow: hidden;
    }

    .tab-list-wrapper {
      flex: 1;
      min-height: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
  `,
})
export class MainViewComponent {
  @Input() studentSchedule!: StudentSchedule;
}

