import {ScheduleDB} from "../models/schedule-db";

export interface DataParser {
  load(text: string, db: ScheduleDB): void;

  get name(): string;
}
