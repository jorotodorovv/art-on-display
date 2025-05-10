
import React, { useState, createContext, useContext, ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type LanguageContextType = {
  language: "en" | "bg";
  setLanguage: (lang: "en" | "bg") => void;
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<"en" | "bg">("en");

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "bg" : "en");
  };

  return (
    <div className="flex items-center space-x-2 animate-fade-in">
      <Switch
        id="language-toggle"
        checked={language === "bg"}
        onCheckedChange={toggleLanguage}
        aria-label="Toggle language"
      />
      <Label htmlFor="language-toggle" className="text-xs font-medium">
        {language === "en" ? "EN" : "BG"}
      </Label>
    </div>
  );
};

export default LanguageToggle;
