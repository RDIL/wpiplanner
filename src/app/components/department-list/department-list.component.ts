import {Component, Input, OnInit, Output, EventEmitter, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ScheduleDB} from '../../models/schedule-db';
import {Department} from '../../models/department';

interface AcademicGroup {
  name: string;
  departments: string[];
}

@Component({
  selector: 'department-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <select
      multiple
      #selectEl
      (change)="onChange(selectEl)"
      class="department-select"
    >
      <optgroup *ngFor="let group of groups" [label]="group.name">
        <option
          *ngFor="let dept of getDepartmentsInGroup(group)"
          [value]="dept.abbreviation"
          [selected]="isSelected(dept)"
        >
          {{ dept.name }}
        </option>
      </optgroup>
      <optgroup label="Other">
        <option
          *ngFor="let dept of getOtherDepartments()"
          [value]="dept.abbreviation"
          [selected]="isSelected(dept)"
        >
          {{ dept.name }}
        </option>
      </optgroup>
    </select>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .department-select {
      width: 100%;
      height: 100%;
      border: none;
      margin: 0;
      padding: 5px;
    }
  `,
})
export class DepartmentListComponent implements OnInit {
  private scheduleDB = inject(ScheduleDB);
  @Output() departmentsChanged = new EventEmitter<Department[]>();

  groups: AcademicGroup[] = [
    {
      name: 'Science',
      departments: ['MA', 'PH', 'BB', 'BCB', 'CH', 'CS', 'GE', 'DS', 'IMGD', 'MMS', 'MPE', 'MME', 'NEU']
    },
    {
      name: 'Engineering',
      departments: ['ECE', 'RBE', 'AREN', 'ARCH', 'BME', 'CE', 'CHE', 'ES', 'ME', 'MFE', 'MTE', 'NSE', 'FP', 'SYS', 'AE']
    },
    {name: 'Language', departments: ['GN', 'AB', 'CN', 'ESL', 'JP', 'ISE', 'SP']},
    {name: 'Humanities', departments: ['PY', 'AR', 'HI', 'HU', 'MU', 'RE', 'TH', 'WR', 'EN', 'INTL']},
    {name: 'Social Science', departments: ['ECON', 'SS', 'PSY', 'DEV', 'ENV', 'GOV', 'SD', 'SOC', 'STS']},
    {name: 'Business', departments: ['BUS', 'ETR', 'FIN', 'MIS', 'MKT', 'OBC', 'ACC', 'OIE']},
  ];

  selectedValues: string[] = [];

  ngOnInit(): void {
    const saved = this.savedSelectedDepartments();
    if (saved === null) {
      // Default: select MA
      this.selectedValues = ['MA'];
    } else {
      this.selectedValues = saved;
    }

    // Emit initial selection after view init
    setTimeout(() => {
      const selected = this.scheduleDB.departments.filter(d =>
        this.selectedValues.includes(d.abbreviation)
      );
      this.departmentsChanged.emit(selected);
    });
  }

  getDepartmentsInGroup(group: AcademicGroup): Department[] {
    return this.scheduleDB.departments.filter(d => group.departments.includes(d.abbreviation));
  }

  getOtherDepartments(): Department[] {
    const allGroupDepts = this.groups.flatMap(g => g.departments);
    return this.scheduleDB.departments.filter(d => !allGroupDepts.includes(d.abbreviation));
  }

  isSelected(dept: Department): boolean {
    return this.selectedValues.includes(dept.abbreviation);
  }

  onChange(selectEl: HTMLSelectElement): void {
    this.selectedValues = Array.from(selectEl.selectedOptions).map(opt => opt.value);

    // Save to localStorage
    try {
      localStorage.setItem('selectedDepts', JSON.stringify(this.selectedValues));
    } catch (e) {
      console.error('Failed to save selected departments:', e);
    }

    // Emit selected departments
    const selected = this.scheduleDB.departments.filter(d =>
      this.selectedValues.includes(d.abbreviation)
    );
    this.departmentsChanged.emit(selected);
  }

  private savedSelectedDepartments(): string[] | null {
    try {
      const data = localStorage.getItem('selectedDepts');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }
}

