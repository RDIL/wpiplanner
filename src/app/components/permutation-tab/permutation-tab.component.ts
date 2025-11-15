import {Component, Input, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StudentSchedule} from '../../controllers/student-schedule';
import {
  generatePermutationsFromSelected,
  type SchedulePermutation,
  getPermutationProfessors
} from '../../utils/permutation-generator';
import type {Section} from '../../models/section';
import type {Course} from '../../models/course';
import {LoadingOverlayComponent} from '../loading-overlay/loading-overlay.component';
import {ToastComponent} from '../toast/toast.component';
import {PermutationDetailViewComponent} from '../permutation-detail-view/permutation-detail-view.component';
import {PermutationGridViewComponent} from '../permutation-grid-view/permutation-grid-view.component';

interface CourseWithSections {
  course: Course;
  sections: Section[];
}

@Component({
  selector: 'permutation-tab',
  standalone: true,
  imports: [CommonModule, LoadingOverlayComponent, ToastComponent, PermutationDetailViewComponent, PermutationGridViewComponent],
  template: `
    <div class="permutation-container">
      <toast [show]="showLimitToast" type="warning" [autoHide]="15000" (close)="showLimitToast = false">
        Danger! That request resulted in over 50,000 possible schedules.
        I can't generate more without crashing your browser.
        Try filtering out specific terms on classes with lots of sections!
      </toast>

      <loading-overlay [isLoading]="isGenerating">
        Cookin' up some schedules...
      </loading-overlay>

      <div class="permutation-sidebar">
        <div class="sidebar-header">
          <h3>Select Sections</h3>
          <div class="permutation-count">{{ permutations.length }} candidate(s)</div>
        </div>

        <div class="course-list" *ngIf="getCoursesWithSections().length > 0; else noCourses">
          <div *ngFor="let courseData of getCoursesWithSections()" class="course-group">
            <div class="course-header-collapsible" (click)="toggleCourseCollapse(courseData.course)">
              <span class="collapse-icon">{{ isCourseExpanded(courseData.course) ? '▼' : '▶' }}</span>
              <span class="course-name-header">{{ courseData.course.toAbbreviation() }}
                - {{ courseData.course.name }}</span>
            </div>

            <div class="section-list" *ngIf="isCourseExpanded(courseData.course)">
              <div *ngFor="let section of courseData.sections" class="section-item">
                <label class="section-checkbox-label">
                  <input
                    type="checkbox"
                    [checked]="isSectionSelected(section)"
                    (change)="toggleSection(section, $event)"
                    class="section-checkbox">
                  <span class="section-number">{{ section.number }}</span>
                  <span class="section-professor" *ngIf="getSectionProfessor(section)">
                    {{ getSectionProfessor(section) }}
                  </span>

                  <span class="no-seats-indicator"
                        *ngIf="!section.hasAvailableSeats && !section.hasAvailableWaitlist"
                  >
                    (No seats)
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <ng-template #noCourses>
          <div class="no-courses">
            <p>Add courses to select sections.</p>
          </div>
        </ng-template>
      </div>

      <div class="candidates-sidebar">
        <div class="candidates-header">
          <h3>Schedule Candidates</h3>
        </div>

        <div class="candidates-list" *ngIf="permutations.length > 0; else noCandidates">
          <div
            *ngFor="let perm of permutations; let i = index"
            class="candidate-item"
            [class.selected]="selectedPermutationIndex === i"
            [class.has-conflicts]="perm.conflicts.length > 0"
            (click)="selectPermutation(i)"
          >
            <div class="candidate-content">
              <div class="candidate-codes">
                {{ getPermutationCodes(perm) }}
                <span class="conflict-indicator" *ngIf="perm.conflicts.length > 0" title="Has conflicts">
                  ⚠️
                </span>
              </div>
              <div class="candidate-professor" *ngIf="getPermutationProfessors(perm).length > 0">
                {{ getPermutationProfessors(perm)[0] }}
              </div>
            </div>
          </div>
        </div>

        <ng-template #noCandidates>
          <div class="no-candidates">
            <p>No schedule candidates available.</p>
            <p *ngIf="selectedSectionsCount === 0">Select at least one section to generate possible schedules.</p>
          </div>
        </ng-template>
      </div>

      <div class="permutation-detail">
        <div class="detail-header">
          <div class="detail-tabs">
            <button class="detail-tab" [class.active]="activeTab === 'grid'"
                    (click)="activeTab = 'grid'"
            >
              Grid
            </button>

            <button class="detail-tab" [class.active]="activeTab === 'detail'"
                    (click)="activeTab = 'detail'"
            >
              Details
            </button>

            <button class="detail-tab" [class.active]="activeTab === 'favorites'"
                    (click)="activeTab = 'favorites'"
            >
              Favorites ({{ favoriteIndices.size }})
            </button>
          </div>

          <div class="detail-actions">
            <button class="share-button" *ngIf="selectedPermutationIndex !== null">Share</button>
            <button class="star-button"
                    [class.favorited]="isFavorite(selectedPermutationIndex)"
                    *ngIf="selectedPermutationIndex !== null"
                    (click)="toggleFavorite(selectedPermutationIndex, $event)"
            >★</button>
          </div>
        </div>

        <permutation-grid-view
          *ngIf="activeTab === 'grid'"
          [permutation]="selectedPermutation"
        ></permutation-grid-view>
        <permutation-detail-view
          *ngIf="activeTab === 'detail'"
          [permutation]="selectedPermutation"
        ></permutation-detail-view>
        <div *ngIf="activeTab === 'favorites'" class="favorites-placeholder">
          <p>Favorites view coming soon</p>
        </div>
      </div>
    </div>
  `,
  styleUrl: "./permutation-tab.component.css",
})
export class PermutationTabComponent implements OnInit, OnDestroy {
  @Input() studentSchedule!: StudentSchedule;

  permutations: SchedulePermutation[] = [];
  selectedPermutationIndex: number | null = null;
  favoriteIndices: Set<number> = new Set();
  activeTab: 'detail' | 'grid' | 'favorites' = 'grid';

  selectedSections: Set<Section> = new Set();
  expandedCourses: Set<Course> = new Set();
  isGenerating: boolean = false;
  showLimitToast: boolean = false;

  private unsubscribe?: () => void;

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.initializeSelectedSections();
    this.generatePermutations();

    // Listen for course updates to regenerate permutations
    this.unsubscribe = this.studentSchedule.on('courseUpdated', () => {
      this.initializeSelectedSections();
      this.generatePermutations();
    });
  }

  ngOnDestroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  initializeSelectedSections(): void {
    // Select all sections by default
    this.selectedSections.clear();
    this.expandedCourses.clear();
    for (const producer of this.studentSchedule.sectionProducers) {
      const course = producer.getCourse();
      const sections = producer.getSections();
      // Expand all courses by default
      this.expandedCourses.add(course);
      for (const section of sections) {
        this.selectedSections.add(section);
      }
    }
  }

  getCoursesWithSections(): CourseWithSections[] {
    const courses: CourseWithSections[] = [];
    for (const producer of this.studentSchedule.sectionProducers) {
      const course = producer.getCourse();
      const sections = producer.getSections();
      if (sections.length > 0) {
        courses.push({course, sections});
      }
    }
    // Sort by course abbreviation
    courses.sort((a, b) => a.course.toAbbreviation().localeCompare(b.course.toAbbreviation()));
    return courses;
  }

  isCourseExpanded(course: Course): boolean {
    return this.expandedCourses.has(course);
  }

  toggleCourseCollapse(course: Course): void {
    if (this.expandedCourses.has(course)) {
      this.expandedCourses.delete(course);
    } else {
      this.expandedCourses.add(course);
    }
  }

  isSectionSelected(section: Section): boolean {
    return this.selectedSections.has(section);
  }

  toggleSection(section: Section, event: Event): void {
    event.stopPropagation();
    if (this.selectedSections.has(section)) {
      this.selectedSections.delete(section);
    } else {
      this.selectedSections.add(section);
    }
    this.generatePermutations();
  }

  get selectedSectionsCount(): number {
    return this.selectedSections.size;
  }

  getSectionProfessor(section: Section): string | null {
    for (const period of section.periods) {
      if (period.professor && period.professor.trim() && period.professor.trim() !== 'Not Assigned') {
        return period.professor.trim();
      }
    }
    return null;
  }

  generatePermutations(): void {
    // Show loading overlay immediately
    this.isGenerating = true;
    this.cdr.markForCheck();
    this.cdr.detectChanges();

    requestAnimationFrame(() => {
      setTimeout(() => {
        try {
          // Group selected sections by course
          const selectedSectionsByCourse = new Map<Course, Section[]>();

          for (const section of this.selectedSections) {
            if (section.course) {
              if (!selectedSectionsByCourse.has(section.course)) {
                selectedSectionsByCourse.set(section.course, []);
              }
              selectedSectionsByCourse.get(section.course)!.push(section);
            }
          }

          const result = generatePermutationsFromSelected(selectedSectionsByCourse);
          // Filter out permutations with conflicts
          this.permutations = result.permutations.filter(perm => perm.conflicts.length === 0);

          // Show toast if limit was reached
          if (result.limitReached) {
            this.showLimitToast = true;
          }

          // Reset selection if current selection is invalid
          if (this.selectedPermutationIndex !== null &&
            this.selectedPermutationIndex >= this.permutations.length) {
            this.selectedPermutationIndex = null;
          }
        } finally {
          // Hide loading overlay
          this.isGenerating = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        }
      }, 100);
    });
  }

  get selectedPermutation(): SchedulePermutation | null {
    if (this.selectedPermutationIndex === null) {
      return null;
    }
    return this.permutations[this.selectedPermutationIndex] || null;
  }

  selectPermutation(index: number): void {
    this.selectedPermutationIndex = index;
  }

  toggleFavorite(index: number, event: Event): void {
    event.stopPropagation();
    if (this.favoriteIndices.has(index)) {
      this.favoriteIndices.delete(index);
    } else {
      this.favoriteIndices.add(index);
    }
  }

  isFavorite(index: number): boolean {
    return this.favoriteIndices.has(index);
  }

  getPermutationCodes(permutation: SchedulePermutation): string {
    return permutation.sections.map(s => s.number).join('/');
  }

  getPermutationProfessors(permutation: SchedulePermutation): string[] {
    return getPermutationProfessors(permutation);
  }
}
