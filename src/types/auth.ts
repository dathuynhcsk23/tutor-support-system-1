/**
 * User roles in the system
 */
export type Role = "student" | "tutor";

/**
 * Represents an authenticated user
 *
 * studentId/tutorId link the auth user to domain records.
 * A user may have one or both depending on their roles.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  /** Links to Student record if user has student role */
  studentId?: string;
  /** Links to Tutor record if user has tutor role */
  tutorId?: string;
}
