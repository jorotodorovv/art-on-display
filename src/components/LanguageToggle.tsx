
import React, { useState, createContext, useContext, ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Language } from "lucide-react";

type LanguageContextType = {
  language: "en" | "es";
  setLanguage: (lang: "en" | "es") => void;
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<"en" | "es">("en");

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "es" : "en");
  };

  return (
    <div className="flex items-center space-x-2 animate-fade-in">
      <Language className="h-4 w-4 text-muted-foreground" />
      <Switch
        id="language-toggle"
        checked={language === "es"}
        onCheckedChange={toggleLanguage}
        aria-label="Toggle language"
      />
      <Label htmlFor="language-toggle" className="text-xs font-medium">
        {language === "en" ? "EN" : "ES"}
      </Label>
    </div>
  );
};

export default LanguageToggle;
