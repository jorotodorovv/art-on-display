import React, { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/LanguageToggle";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
interface EditableContentProps {
  id: string;
  content: {
    en: string;
    bg: string;
  };
  type: "heading" | "paragraph";
  className?: string;
  onUpdate?: (newContent: {
    en: string;
    bg: string;
  }) => void;
}
const EditableContent: React.FC<EditableContentProps> = ({
  id,
  content,
  type,
  className = "",
  onUpdate
}) => {
  const {
    isAdmin
  } = useAuth();
  const {
    language
  } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<{
    en: string;
    bg: string;
  }>(content);
  const editRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the editing area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isEditing && editRef.current && !editRef.current.contains(event.target as Node)) {
        handleCancel();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing]);
  const handleEdit = () => {
    setIsEditing(true);
  };
  const handleSave = async () => {
    try {
      // Call the onUpdate callback if provided
      if (onUpdate) {
        await onUpdate(editedContent);
      }
      toast.success(language === "en" ? "Content updated successfully" : "Съдържанието е актуализирано успешно");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error(language === "en" ? "Failed to update content" : "Неуспешно актуализиране на съдържанието");
    }
  };
  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  // Content to display based on current language
  const displayContent = language === "en" ? content.en : content.bg;

  // Function to handle content edits
  const handleContentChange = (lang: "en" | "bg", value: string) => {
    setEditedContent(prev => ({
      ...prev,
      [lang]: value
    }));
  };
  if (isEditing && isAdmin) {
    return <div ref={editRef} className="relative border border-primary p-2 rounded-md">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1">English</label>
            <ContentEditor initialValue={editedContent.en} type={type} onChange={value => handleContentChange("en", value)} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Bulgarian</label>
            <ContentEditor initialValue={editedContent.bg} type={type} onChange={value => handleContentChange("bg", value)} />
          </div>
        </div>
        <div className="absolute top-2 right-2 flex space-x-1">
          <Button variant="ghost" size="icon" onClick={handleSave} className="h-7 w-7">
            <Check className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleCancel} className="h-7 w-7">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>;
  }
  return <div className={`group relative ${className}`} id={id}>
      {type === "heading" ? <h2 className="text-5xl font-bold">{displayContent}</h2> : <p>{displayContent}</p>}
      
      {isAdmin && <Button variant="ghost" size="icon" onClick={handleEdit} className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7">
          <Pencil className="h-4 w-4" />
        </Button>}
    </div>;
};

// Sub-component for editing content
const ContentEditor: React.FC<{
  initialValue: string;
  type: "heading" | "paragraph";
  onChange: (value: string) => void;
}> = ({
  initialValue,
  type,
  onChange
}) => {
  // For headings, use a single-line input
  if (type === "heading") {
    return <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-md" value={initialValue} onChange={e => onChange(e.target.value)} autoFocus />;
  }

  // For paragraphs, use a textarea
  return <textarea className="w-full px-3 py-2 border border-gray-200 rounded-md resize-y" value={initialValue} onChange={e => onChange(e.target.value)} rows={3} autoFocus />;
};
export default EditableContent;