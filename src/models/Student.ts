/**
 * Data required to construct a Student instance
 */
export interface StudentData {
  id: string;
  name: string;
  email: string;
  studentId: string;
  program: string;
  year: number;
}

/**
 * Student class - represents a student in the system
 *
 * Domain model class that encapsulates student data and behavior
 * Simpler than Tutor as students don't have subjects, ratings, or availability.
 */
export class Student {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly studentId: string;
  readonly program: string;
  readonly year: number;

  constructor(data: StudentData) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.studentId = data.studentId;
    this.program = data.program;
    this.year = data.year;
  }

  /**
   * Get initials from the student's name (for avatar)
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
   * Get first name only
   */
  getFirstName(): string {
    return this.name.split(" ")[0];
  }

  /**
   * Get display label for year (e.g., "Year 2")
   */
  getYearLabel(): string {
    return `Year ${this.year}`;
  }

  /**
   * Convert to plain object (for serialization)
   */
  toJSON(): StudentData {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      studentId: this.studentId,
      program: this.program,
      year: this.year,
    };
  }
}
