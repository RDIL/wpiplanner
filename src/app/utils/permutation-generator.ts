import type {Section} from '../models/section';
import type {Period} from '../models/period';
import {DayOfWeek} from '../models/day-of-week';
import type {SectionProducer} from '../controllers/student-schedule';

export interface SchedulePermutation {
  sections: Section[];
  conflicts: Conflict[];
}

export interface PermutationGenerationResult {
  permutations: SchedulePermutation[];
  limitReached: boolean;
}

export interface Conflict {
  section1: Section;
  section2: Section;
  period1: Period;
  period2: Period;
  reason: string;
}

/**
 * Maximum number of permutations to generate
 */
const MAX_PERMUTATIONS = 50000;

/**
 * Generates all valid schedule permutations from selected sections.
 * Each permutation contains one section from each course.
 * Limited to MAX_PERMUTATIONS to prevent performance issues.
 * @param selectedSectionsByCourse Map of course to array of selected sections for that course
 */
export function generatePermutationsFromSelected(
  selectedSectionsByCourse: Map<any, Section[]>
): PermutationGenerationResult {
  const permutations: SchedulePermutation[] = [];

  if (selectedSectionsByCourse.size === 0) {
    return {permutations, limitReached: false};
  }

  // Get sections for each course
  const sectionLists: Section[][] = [];
  for (const sections of selectedSectionsByCourse.values()) {
    if (sections.length === 0) {
      // If a course has no selected sections, return empty
      return {permutations, limitReached: false};
    }
    sectionLists.push(sections.filter((s) => s.usableInPermutations));
  }

  // Generate all combinations using DFS, limited to MAX_PERMUTATIONS
  const currentCombination: Section[] = [];
  const limitReached = generateCombinations(sectionLists, 0, currentCombination, permutations, MAX_PERMUTATIONS);

  return {permutations, limitReached};
}

/**
 * Generates all valid schedule permutations from section producers.
 * Each permutation contains one section from each course.
 * Limited to MAX_PERMUTATIONS to prevent performance issues.
 */
export function generatePermutations(producers: SectionProducer[]): SchedulePermutation[] {
  const permutations: SchedulePermutation[] = [];

  if (producers.length === 0) {
    return permutations;
  }

  // Get sections for each producer
  const sectionLists: Section[][] = [];
  for (const producer of producers) {
    const sections = producer.getSections();
    if (sections.length === 0) {
      // If a course has no available sections, return empty
      return permutations;
    }
    sectionLists.push(sections);
  }

  // Generate all combinations using DFS, limited to MAX_PERMUTATIONS
  const currentCombination: Section[] = [];
  generateCombinations(sectionLists, 0, currentCombination, permutations, MAX_PERMUTATIONS);

  return permutations;
}

function generateCombinations(
  sectionLists: Section[][],
  courseIndex: number,
  currentCombination: Section[],
  permutations: SchedulePermutation[],
  maxPermutations: number
): boolean {
  // Stop if we've reached the maximum number of permutations
  if (permutations.length >= maxPermutations) {
    return true; // Limit reached
  }

  if (courseIndex >= sectionLists.length) {
    // We have a complete combination, check for conflicts
    const conflicts = detectConflicts(currentCombination);
    permutations.push({
      sections: [...currentCombination],
      conflicts
    });
    return false; // Limit not reached
  }

  // Try each section from the current course
  for (const section of sectionLists[courseIndex]) {
    // Check limit before recursing
    if (permutations.length >= maxPermutations) {
      return true; // Limit reached
    }
    currentCombination.push(section);
    const limitReached = generateCombinations(sectionLists, courseIndex + 1, currentCombination, permutations, maxPermutations);
    currentCombination.pop();
    if (limitReached) {
      return true; // Limit reached
    }
  }

  return false; // Limit not reached
}

/**
 * Detects time conflicts between sections in a permutation.
 */
function detectConflicts(sections: Section[]): Conflict[] {
  const conflicts: Conflict[] = [];

  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      const section1 = sections[i];
      const section2 = sections[j];

      // Check if sections are in overlapping terms
      const terms1 = extractTerms(section1.term);
      const terms2 = extractTerms(section2.term);
      const overlappingTerms = terms1.filter(t => terms2.includes(t));

      // If sections are not in overlapping terms, no conflict is possible
      if (overlappingTerms.length === 0) {
        continue;
      }

      // Check all periods between these two sections
      for (const period1 of section1.periods) {
        for (const period2 of section2.periods) {
          if (hasTimeConflict(period1, period2)) {
            conflicts.push({
              section1,
              section2,
              period1,
              period2,
              reason: 'Time conflict'
            });
          }
        }
      }
    }
  }

  return conflicts;
}

/**
 * Extracts term letters (A, B, C, D) from a term string.
 * Handles both single terms (e.g., "A Term") and multi-term sections (e.g., "A Term / B Term").
 */
function extractTerms(termString: string): string[] {
  const terms: string[] = [];
  
  // Check first term (character at position 0)
  if (termString.length > 0) {
    const firstChar = termString.charAt(0).toUpperCase();
    if (['A', 'B', 'C', 'D'].includes(firstChar)) {
      terms.push(firstChar);
    }
  }
  
  // Check for second term (typically after " / " at position 8 or similar)
  // Look for pattern like "A Term / B Term" or similar
  const secondTermMatch = termString.match(/[\/\s]+([ABCD])/i);
  if (secondTermMatch) {
    const secondTerm = secondTermMatch[1].toUpperCase();
    if (!terms.includes(secondTerm)) {
      terms.push(secondTerm);
    }
  }
  
  // Fallback: check character at position 8 (for "A Term / B Term" format)
  if (termString.length > 8) {
    const secondChar = termString.substring(8).charAt(0).toUpperCase();
    if (['A', 'B', 'C', 'D'].includes(secondChar) && !terms.includes(secondChar)) {
      terms.push(secondChar);
    }
  }
  
  return terms;
}

/**
 * Checks if two periods have a time conflict (overlap on the same day).
 */
function hasTimeConflict(period1: Period, period2: Period): boolean {
  if (!period1.startTime || !period1.endTime || !period2.startTime || !period2.endTime) {
    return false;
  }

  // Check if periods share any common day
  const commonDays = new Set<DayOfWeek>();
  for (const day of period1.days) {
    if (period2.days.has(day)) {
      commonDays.add(day);
    }
  }

  if (commonDays.size === 0) {
    return false; // No common days, no conflict
  }

  // Check if time ranges overlap
  const start1 = period1.startTime.value;
  const end1 = period1.endTime.value;
  const start2 = period2.startTime.value;
  const end2 = period2.endTime.value;

  // Check for overlap: periods overlap if one starts before the other ends
  return (start1 < end2 && start2 < end1);
}

/**
 * Gets a unique identifier for a permutation (section numbers concatenated).
 */
export function getPermutationId(permutation: SchedulePermutation): string {
  return permutation.sections.map(s => s.number).join('/');
}

/**
 * Gets professor names for a permutation (all unique professors).
 */
export function getPermutationProfessors(permutation: SchedulePermutation): string[] {
  const professors = new Set<string>();
  for (const section of permutation.sections) {
    for (const period of section.periods) {
      if (period.professor && period.professor.trim() && period.professor.trim() !== 'Not Assigned') {
        professors.add(period.professor.trim());
      }
    }
  }
  return Array.from(professors).sort();
}
