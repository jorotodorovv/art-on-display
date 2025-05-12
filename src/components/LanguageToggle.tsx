
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "bg": "en");
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
