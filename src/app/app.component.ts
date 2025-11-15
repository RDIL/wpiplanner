import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {ScheduleDB} from './models/schedule-db';
import {XmlParser} from './utils/xml-parser';
import {JsonParser} from './utils/json-parser';
import {MainViewComponent} from './components/main-view/main-view.component';
import {StudentSchedule} from "./controllers/student-schedule";
import {LoadingOverlayComponent} from "./components/loading-overlay/loading-overlay.component";
import {DataParser} from "./utils/parser-base";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MainViewComponent, LoadingOverlayComponent],
  providers: [ScheduleDB],
  template: `
    <loading-overlay [isLoading]="loading">
      Loading schedule database...
    </loading-overlay>

    <main-view *ngIf="!loading" [studentSchedule]="studentSchedule"></main-view>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  `,
})
export class AppComponent implements OnInit {
  private scheduleDB = inject(ScheduleDB);
  loading = true;
  studentSchedule: StudentSchedule;
  parsers: DataParser[] = [new XmlParser(), new JsonParser()];

  constructor(private http: HttpClient) {
    this.studentSchedule = new StudentSchedule();
  }

  ngOnInit(): void {
    this.loadSchedule();
  }

  private loadSchedule(): void {
    this.http.get('new.schedb', {responseType: 'text'}).subscribe({
      next: (text) => {
        for (const parser of this.parsers) {
          try {
            parser.load(text, this.scheduleDB);
            break;
          } catch {
            console.error(`Failed to load schedule with ${parser.name}.`)
          }
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading schedule:', error);
        alert('Something went horribly wrong.');
      }
    });
  }
}

