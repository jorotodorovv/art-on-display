
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/LanguageToggle";
import { toast } from "@/components/ui/sonner";

const translations = {
  en: {
    title: "Admin Login",
    email: "Email",
    password: "Password",
    login: "Login",
    error: "Invalid email or password"
  },
  es: {
    title: "Inicio de Sesión Admin",
    email: "Correo",
    password: "Contraseña",
    login: "Iniciar Sesión",
    error: "Correo o contraseña inválidos"
  }
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate("/admin");
    } catch (error) {
      toast.error(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center animate-fade-in">
      <div className="w-full max-w-md space-y-8 p-8 rounded-lg border border-border bg-card shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">{t.password}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" className="w-full hover-scale" disabled={isLoading}>
            {isLoading ? "Loading..." : t.login}
          </Button>
        </form>
        
        <div className="text-center text-sm text-muted-foreground mt-4">
          {/* For development purposes only */}
          <p>Demo: admin@example.com / password</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
