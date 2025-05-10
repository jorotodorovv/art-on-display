
import React, { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "@/components/ui/sonner";

interface User {
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // This is a simplified authentication flow. In a real app, you'd use Supabase, Firebase, etc.
  const login = async (email: string, password: string) => {
    // For demo purposes, we're hardcoding a single admin user
    // In a real application, this would validate against a database
    if (email === "admin@example.com" && password === "password") {
      const user = { email, isAdmin: true };
      setUser(user);
      localStorage.setItem("authUser", JSON.stringify(user));
      toast.success("Successfully logged in");
      return;
    }
    throw new Error("Invalid email or password");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
    toast.success("Successfully logged out");
  };

  // Check if user was previously logged in
  React.useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("authUser");
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
