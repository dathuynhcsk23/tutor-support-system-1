import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import type { Role, User } from "@/types/auth";

// ============================================
// Auth Storage Class
// ============================================

const STORAGE_KEY = "tutor-support-auth";

interface StoredAuth {
  user: User;
  activeRole: Role | null;
}

/**
 * Handles persisting and retrieving auth state from localStorage.
 * Class will encapsulate all storage-related logic.
 */
class AuthStorage {
  read(): StoredAuth | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as StoredAuth;
    } catch {
      console.warn("Failed to parse stored auth");
      return null;
    }
  }

  save(user: User | null, activeRole: Role | null): void {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, activeRole }));
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Singleton instance
const authStorage = new AuthStorage();

// ============================================
// Mock Auth
// ============================================

const MOCK_USER: User = {
  id: "mock-user",
  name: "Nguyen Van A",
  email: "a.nguyen@hcmut.edu.vn",
  roles: ["student", "tutor"],
};

async function mockSignIn(): Promise<User> {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_USER), 500);
  });
}

// ============================================
// Auth Context
// ============================================

interface AuthContextValue {
  user: User | null;
  activeRole: Role | null;
  loading: boolean;
  signIn: () => void;
  selectRole: (role: Role) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load stored auth on mount
  useEffect(() => {
    const stored = authStorage.read();
    if (stored) {
      setUser(stored.user);
      setActiveRole(stored.activeRole);
    }
    setLoading(false);
  }, []);

  // Persist auth changes
  useEffect(() => {
    if (!loading) {
      authStorage.save(user, activeRole);
    }
  }, [user, activeRole, loading]);

  const signIn = useCallback(async () => {
    setLoading(true);
    const mockUser = await mockSignIn();
    setUser(mockUser);

    // If user has only one role, auto-select it
    if (mockUser.roles.length === 1) {
      const [singleRole] = mockUser.roles;
      setActiveRole(singleRole);
      navigate(`/${singleRole}`);
    } else {
      // Multiple roles - go to role selection
      navigate("/role");
    }

    setLoading(false);
  }, [navigate]);

  const selectRole = useCallback(
    (role: Role) => {
      if (!user || !user.roles.includes(role)) {
        return;
      }
      setActiveRole(role);
      navigate(`/${role}`);
    },
    [navigate, user]
  );

  const signOut = useCallback(() => {
    setUser(null);
    setActiveRole(null);
    authStorage.clear();
    navigate("/");
  }, [navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, activeRole, loading, signIn, selectRole, signOut }),
    [user, activeRole, loading, signIn, selectRole, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
