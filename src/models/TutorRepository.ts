import { Tutor, type TutorFilterCriteria, type TutorData } from "./Tutor";

/**
 * TutorRepository - Repository pattern for managing tutor data
 *
 * Provides a centralized data access layer for tutors.
 * Uses Singleton pattern to ensure consistent state across the app.
 */
export class TutorRepository {
  private static instance: TutorRepository;
  private tutors: Map<string, Tutor> = new Map();

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): TutorRepository {
    if (!TutorRepository.instance) {
      TutorRepository.instance = new TutorRepository();
    }
    return TutorRepository.instance;
  }

  /**
   * Initialize repository with tutor data
   */
  initialize(tutorsData: TutorData[]): void {
    this.tutors.clear();
    tutorsData.forEach((data) => {
      const tutor = new Tutor(data);
      this.tutors.set(tutor.id, tutor);
    });
  }

  /**
   * Get all tutors
   */
  findAll(): Tutor[] {
    return Array.from(this.tutors.values());
  }

  /**
   * Find a tutor by ID
   */
  findById(id: string): Tutor | undefined {
    return this.tutors.get(id);
  }

  /**
   * Search tutors with filters
   */
  search(filters: TutorFilterCriteria): Tutor[] {
    return this.findAll().filter((tutor) => tutor.matchesFilters(filters));
  }

  /**
   * Get all unique departments from tutors
   */
  getDepartments(): string[] {
    const departments = new Set<string>();
    this.tutors.forEach((tutor) => departments.add(tutor.department));
    return Array.from(departments).sort();
  }

  /**
   * Get all unique subjects from tutors
   */
  getSubjects(): string[] {
    const subjects = new Set<string>();
    this.tutors.forEach((tutor) => {
      tutor.subjects.forEach((s) => subjects.add(s));
    });
    return Array.from(subjects).sort();
  }

  /**
   * Get tutors by department
   */
  findByDepartment(department: string): Tutor[] {
    return this.findAll().filter((tutor) => tutor.department === department);
  }

  /**
   * Get tutors by subject
   */
  findBySubject(subject: string): Tutor[] {
    return this.findAll().filter((tutor) => tutor.teachesSubject(subject));
  }

  /**
   * Get top-rated tutors
   */
  findTopRated(limit: number = 5): Tutor[] {
    return this.findAll()
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  /**
   * Auto-match tutors based on subject and modality preferences
   * Returns best recommendation and alternatives sorted by rating
   *
   * @param excludeTutorId - Optional tutor ID to exclude (e.g., when user is also a tutor)
   */
  autoMatch(params: {
    subject: string;
    modality: "all" | "online" | "in_person";
    excludeTutorId?: string;
  }): { recommended: Tutor | null; alternates: Tutor[] } {
    const { subject, modality, excludeTutorId } = params;

    // Filter candidates by subject and modality
    const candidates = this.findAll().filter((tutor) => {
      // Exclude self if needed (when user is both student and tutor)
      if (excludeTutorId && tutor.id === excludeTutorId) {
        return false;
      }
      const subjectMatch = !subject || tutor.teachesSubject(subject);
      const modalityMatch = modality === "all" || tutor.hasModality(modality);
      return subjectMatch && modalityMatch;
    });

    if (candidates.length === 0) {
      return { recommended: null, alternates: [] };
    }

    // Sort by rating (highest first)
    const sorted = [...candidates].sort((a, b) => b.rating - a.rating);

    // First is recommended, next 3 are alternates
    const [recommended, ...rest] = sorted;
    const alternates = rest.slice(0, 3);

    return { recommended, alternates };
  }

  /**
   * Search tutors with filters, optionally excluding a specific tutor
   *
   * @param excludeTutorId - Optional tutor ID to exclude (e.g., when user is also a tutor)
   */
  searchExcluding(
    filters: TutorFilterCriteria,
    excludeTutorId?: string
  ): Tutor[] {
    return this.findAll().filter((tutor) => {
      if (excludeTutorId && tutor.id === excludeTutorId) {
        return false;
      }
      return tutor.matchesFilters(filters);
    });
  }

  /**
   * Get all tutors except the specified one
   * Useful when a user is both a student and a tutor
   */
  findAllExcluding(excludeTutorId: string): Tutor[] {
    return this.findAll().filter((tutor) => tutor.id !== excludeTutorId);
  }

  /**
   * Get total count of tutors
   */
  count(): number {
    return this.tutors.size;
  }
}

// Export singleton instance for convenience
export const tutorRepository = TutorRepository.getInstance();
