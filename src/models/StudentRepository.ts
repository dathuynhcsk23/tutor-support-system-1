import { Student, type StudentData } from "./Student";

/**
 * StudentRepository - Singleton repository primarily for Student lookup
 */
export class StudentRepository {
  private static instance: StudentRepository;
  private students: Map<string, Student> = new Map();

  private constructor() {}

  /**
   * Get the singleton instance
   */
  static getInstance(): StudentRepository {
    if (!StudentRepository.instance) {
      StudentRepository.instance = new StudentRepository();
    }
    return StudentRepository.instance;
  }

  /**
   * Initialize repository with student data
   */
  initialize(studentsData: StudentData[]): void {
    this.students.clear();
    studentsData.forEach((data) => {
      const student = new Student(data);
      this.students.set(student.id, student);
    });
  }

  /**
   * Find a student by their ID
   */
  findById(id: string): Student | undefined {
    return this.students.get(id);
  }

  /**
   * Get a student by ID, throws if not found
   */
  getById(id: string): Student {
    const student = this.findById(id);
    if (!student) {
      throw new Error(`Student not found: ${id}`);
    }
    return student;
  }

  /**
   * Get multiple students by their IDs
   */
  findByIds(ids: string[]): Student[] {
    return ids
      .map((id) => this.findById(id))
      .filter((s): s is Student => s !== undefined);
  }

  /**
   * Get all students
   */
  getAll(): Student[] {
    return Array.from(this.students.values());
  }

  /**
   * Get total count
   */
  count(): number {
    return this.students.size;
  }

  /**
   * Check if a student exists
   */
  exists(id: string): boolean {
    return this.students.has(id);
  }

  /**
   * Get all students except the specified one
   */
  findAllExcluding(excludeStudentId: string): Student[] {
    return this.getAll().filter((student) => student.id !== excludeStudentId);
  }

  /**
   * Get multiple students by their IDs, excluding a specific student
   */
  findByIdsExcluding(ids: string[], excludeStudentId: string): Student[] {
    return ids
      .filter((id) => id !== excludeStudentId)
      .map((id) => this.findById(id))
      .filter((s): s is Student => s !== undefined);
  }
}

// Export singleton instance
export const studentRepository = StudentRepository.getInstance();
