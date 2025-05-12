import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';

interface EditableTextProps {
  contentKey: string;
  defaultText: string;
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';
  className?: string;
}

const EditableText: React.FC<EditableTextProps> = ({
  contentKey,
  defaultText,
  as = 'p',
  className = '',
}) => {
  const { user } = useAuth();
  const { language, content, updateContent } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState('');
  
  // Get the text content from the language context or use default
  useEffect(() => {
    if (content[contentKey] && content[contentKey][language]) {
      setText(content[contentKey][language]);
    } else {
      setText(defaultText);
    }
  }, [content, contentKey, language, defaultText]);
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    // Reset to the current content
    if (content[contentKey] && content[contentKey][language]) {
      setText(content[contentKey][language]);
    } else {
      setText(defaultText);
    }
    setIsEditing(false);
  };
  
  const handleSave = async () => {
    try {
      await updateContent(contentKey, text);
      setIsEditing(false);
      toast.success('Content updated successfully');
    } catch (error) {
      console.error('Failed to update content:', error);
      toast.error('Failed to update content');
    }
  };
  
  // Render the appropriate HTML element based on the 'as' prop
  const Component = as;
  
  if (isEditing && user?.isAdmin) {
    return (
      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[100px] w-full"
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave}>Save</Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="group relative">
      <Component className={className}>
        {content[contentKey] && content[contentKey][language] 
          ? content[contentKey][language] 
          : defaultText}
      </Component>
      {user?.isAdmin && (
        <Button
          size="sm"
          variant="ghost"
          className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleEdit}
        >
          Edit
        </Button>
      )}
    </div>
  );
};

export default EditableText;