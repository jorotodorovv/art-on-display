import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { contentOperations } from '@/lib/supabase';

type Language = 'en' | 'bg';

interface ContentMap {
  [key: string]: {
    en: string;
    bg: string;
  };
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  content: ContentMap;
  updateContent: (key: string, value: string) => Promise<void>;
  isLoading: boolean;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [content, setContent] = useState<ContentMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');

  // Load content for the current page
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const pageContent = await contentOperations.getPageContent(currentPage);
        
        // Transform the data into our ContentMap format
        const contentMap: ContentMap = {};
        pageContent.forEach((item) => {
          contentMap[item.key] = {
            en: item.content_en,
            bg: item.content_bg
          };
        });
        
        setContent(contentMap);
      } catch (error) {
        console.error('Failed to load content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [currentPage]);

  // Update content in the database
  const updateContent = async (key: string, value: string) => {
    try {
      // Find the content item
      const contentItem = Object.entries(content).find(([k]) => k === key);
      if (!contentItem) return;

      // Prepare the update
      const updates = {
        [`content_${language}`]: value
      };

      // Find the ID from the database
      const dbContent = await contentOperations.getPageContent(currentPage);
      const dbItem = dbContent.find(item => item.key === key);

      if (dbItem) {
        // Update existing content
        await contentOperations.updateContent(dbItem.id!, updates);
      } else {
        // Create new content
        await contentOperations.upsertContent({
          key,
          content_en: language === 'en' ? value : '',
          content_bg: language === 'bg' ? value : '',
          page: currentPage
        });
      }

      // Update local state
      setContent(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          [language]: value
        }
      }));
    } catch (error) {
      console.error('Failed to update content:', error);
      throw error;
    }
  };

  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        content,
        updateContent,
        isLoading,
        currentPage,
        setCurrentPage
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Helper to get content in the current language
export const useContent = (key: string, fallback: string = '') => {
  const { language, content } = useLanguage();
  if (!content[key]) return fallback;
  return content[key][language] || fallback;
};