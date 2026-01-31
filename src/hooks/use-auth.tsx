"use client";

import { useRouter } from "next/navigation";
import {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactNode,
} from "react";
import type { AdminUser } from "@/lib/types";
import { auth } from "@/lib/firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        console.log("🚀 ~ AuthProvider ~ firebaseUser:", firebaseUser);
        if (firebaseUser) {
          // For this app, we'll assume any authenticated user is an admin.
          // In a real-world scenario, you might check for a custom claim or a role in your database.
          const adminUser: AdminUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || "admin@example.com",
            name: firebaseUser.displayName || "Admin User",
            role: "admin",
          };
          setUser(adminUser);

          // Request notification permission and save token
          const { requestNotificationPermission } =
            await import("@/lib/notifications");
          await requestNotificationPermission(firebaseUser.uid);
        } else {
          setUser(null);
        }
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Firebase login error:", error);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.push("/admin/login");
    } catch (error) {
      console.error("Firebase logout error:", error);
    }
  };

  const value = { user, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
