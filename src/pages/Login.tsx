
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const translations = {
  en: {
    title: "Account Access",
    loginTab: "Login",
    registerTab: "Register",
    email: "Email",
    password: "Password",
    login: "Login",
    register: "Register",
    confirmPassword: "Confirm Password",
    passwordMismatch: "Passwords do not match",
    loginError: "Invalid email or password",
    registerError: "Registration failed"
  },
  es: {
    title: "Acceso a la Cuenta",
    loginTab: "Iniciar Sesión",
    registerTab: "Registrarse",
    email: "Correo Electrónico",
    password: "Contraseña",
    login: "Iniciar Sesión",
    register: "Registrarse",
    confirmPassword: "Confirmar Contraseña",
    passwordMismatch: "Las contraseñas no coinciden",
    loginError: "Correo o contraseña inválidos",
    registerError: "Registro fallido"
  }
};

const Login = () => {
  const { login, register, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate("/gallery");
    } catch (error) {
      toast.error(t.loginError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error(t.passwordMismatch);
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(email, password);
      setActiveTab("login");
    } catch (error) {
      toast.error(t.registerError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center animate-fade-in">
      <div className="w-full max-w-md space-y-6 p-8 rounded-lg border border-border bg-card shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        </div>
        
        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t.loginTab}</TabsTrigger>
            <TabsTrigger value="register">{t.registerTab}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-4">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-2">
                <Label htmlFor="login-email">{t.email}</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">{t.password}</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full hover-scale" disabled={isLoading || authLoading}>
                {isLoading ? "Loading..." : t.login}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register" className="mt-4">
            <form className="space-y-6" onSubmit={handleRegister}>
              <div className="space-y-2">
                <Label htmlFor="register-email">{t.email}</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-password">{t.password}</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t.confirmPassword}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full hover-scale" disabled={isLoading || authLoading}>
                {isLoading ? "Loading..." : t.register}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
