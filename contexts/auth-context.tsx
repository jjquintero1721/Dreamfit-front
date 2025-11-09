"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { SessionProvider } from "next-auth/react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role: "coach" | "mentee";
  coachCode?: string;
}

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "coach" | "mentee";
  coachCode?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProviderContent({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email,
        firstName: session.user.name || "",
        role: session.user.role as "coach" | "mentee",
        coachCode: session.user.coachCode,
      });

      // Set the access token for API calls
      if (session.accessToken) {
        api.defaults.headers.common["Authorization"] = `Bearer ${session.accessToken}`;
      }
    } else {
      setUser(null);
      delete api.defaults.headers.common["Authorization"];
    }
  }, [session]);

  useEffect(() => {
    const protectedRoutes = ["/dashboard"];
    const currentPath = window.location.pathname;

    if (
      status === "unauthenticated" &&
      protectedRoutes.some((route) => currentPath.startsWith(route))
    ) {
      router.push("/auth");
    }
  }, [status, router]);

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success("Successfully signed in!");

      // Wait for session to update
      setTimeout(() => {
        if (session?.user.role === "coach") {
          router.push("/dashboard");
        } else {
          router.push("/dashboard/mentee");
        }
      }, 100);
    } catch (error) {
      toast.error("Invalid credentials");
      throw error;
    }
  };

  const signup = async (data: SignupData) => {
    try {
      const response = await api.post("/auth/signup", data);

      toast.success("Account created successfully! Please sign in.");
      router.push("/auth");
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred during signup");
      }
      throw error;
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
    toast.success("Successfully signed out!");
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading: status === "loading",
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProviderContent>{children}</AuthProviderContent>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}