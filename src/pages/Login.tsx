
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/LanguageToggle";
import { toast } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const translations = {
  en: {
    title: "Authentication",
    email: "Email",
    password: "Password",
    login: "Login",
    signup: "Sign Up",
    confirmPassword: "Confirm Password",
    loginTab: "Login",
    signupTab: "Sign Up",
    passwordsMismatch: "Passwords do not match",
    demoLoginTitle: "Demo Account",
    registerSuccess: "Registration successful! Please check your email."
  },
  bg: {
    title: "Autenticación",
    email: "Correo",
    password: "Contraseña",
    login: "Iniciar Sesión",
    signup: "Registrarse",
    confirmPassword: "Confirmar Contraseña",
    loginTab: "Iniciar Sesión",
    signupTab: "Registrarse",
    passwordsMismatch: "Las contraseñas no coinciden",
    demoLoginTitle: "Cuenta Demo",
    registerSuccess: "¡Registro exitoso! Por favor, revisa tu correo."
  }
};

const Login = () => {
  const { login, signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("login");

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate("/gallery");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      // The auth state listener will handle the redirect
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error(t.passwordsMismatch);
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signup(email, password);
      // Clear the form
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      // Switch to login tab
      setActiveTab("login");
    } catch (error) {
      console.error(error);
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
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t.loginTab}</TabsTrigger>
            <TabsTrigger value="signup">{t.signupTab}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
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
              
              <Button type="submit" className="w-full hover-scale" disabled={isLoading}>
                {isLoading ? "Loading..." : t.login}
              </Button>
            </form>
            
            <div className="text-center text-sm text-muted-foreground mt-4">
              {/* For development purposes only */}
              <p className="text-xs text-muted-foreground">{t.demoLoginTitle}: admin@example.com / password</p>
            </div>
          </TabsContent>
          
          <TabsContent value="signup">
            <form className="space-y-6" onSubmit={handleSignup}>
              <div className="space-y-2">
                <Label htmlFor="signup-email">{t.email}</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password">{t.password}</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">{t.confirmPassword}</Label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full hover-scale" disabled={isLoading}>
                {isLoading ? "Loading..." : t.signup}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
