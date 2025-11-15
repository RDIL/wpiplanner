import {Department} from './department';
import {Section} from './section';
import {Injectable} from "@angular/core";

@Injectable()
export class ScheduleDB {
  departments: Department[] = [];
  schoolYear: number = 0;
  generated: string = '';
}
