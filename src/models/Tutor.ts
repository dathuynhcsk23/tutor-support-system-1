import type { SessionModality } from "@/types/session";

/**
 * Filter criteria for searching tutors
 */
export interface TutorFilterCriteria {
  query?: string;
  department?: string;
  subject?: string;
  modality?: "all" | SessionModality;
}

/**
 * Data required to construct a Tutor instance
 */
export interface TutorData {
  id: string;
  name: string;
  email: string;
  department: string;
  subjects: string[];
  rating: number;
  totalSessions: number;
  bio: string;
  modalities: SessionModality[];
}

/**
 * Tutor class - represents a tutor in the system
 *
 * Domain model class that encapsulates tutor data and behavior
 * used for business logic operations.
 */
export class Tutor {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly department: string;
  readonly subjects: string[];
  readonly rating: number;
  readonly totalSessions: number;
  readonly bio: string;
  readonly modalities: SessionModality[];

  constructor(data: TutorData) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.department = data.department;
    this.subjects = [...data.subjects];
    this.rating = data.rating;
    this.totalSessions = data.totalSessions;
    this.bio = data.bio;
    this.modalities = [...data.modalities];
  }

  /**
   * Get initials from the tutor's name (for avatar)
   */
  getInitials(): string {
    return this.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  /**
   * Check if tutor supports a specific modality
   */
  hasModality(modality: SessionModality): boolean {
    return this.modalities.includes(modality);
  }

  /**
   * Check if tutor teaches a specific subject
   */
  teachesSubject(subject: string): boolean {
    return this.subjects.some((s) => s.toLowerCase() === subject.toLowerCase());
  }

  /**
   * Get formatted rating display (e.g., "4.8")
   */
  getFormattedRating(): string {
    return this.rating.toFixed(1);
  }

  /**
   * Get modalities as display labels
   */
  getModalityLabels(): string[] {
    return this.modalities.map((m) =>
      m === "online" ? "Online" : "In-Person"
    );
  }

  /**
   * Check if tutor matches the given filter criteria
   */
  matchesFilters(filters: TutorFilterCriteria): boolean {
    // Filter by search query (name or subject)
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const matchesName = this.name.toLowerCase().includes(q);
      const matchesSubject = this.subjects.some((s) =>
        s.toLowerCase().includes(q)
      );
      if (!matchesName && !matchesSubject) return false;
    }

    // Filter by department
    if (filters.department && this.department !== filters.department) {
      return false;
    }

    // Filter by subject
    if (filters.subject && !this.subjects.includes(filters.subject)) {
      return false;
    }

    // Filter by modality
    if (
      filters.modality &&
      filters.modality !== "all" &&
      !this.hasModality(filters.modality)
    ) {
      return false;
    }

    return true;
  }

  /**
   * Convert to plain object (for serialization)
   */
  toJSON(): TutorData {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      department: this.department,
      subjects: [...this.subjects],
      rating: this.rating,
      totalSessions: this.totalSessions,
      bio: this.bio,
      modalities: [...this.modalities],
    };
  }
}
