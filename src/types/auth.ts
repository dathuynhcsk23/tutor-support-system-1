/**
 * User roles in the system
 */
export type Role = "student" | "tutor";

/**
 * Represents an authenticated user
 */
export interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
}
