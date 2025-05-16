
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useArtworks } from "@/contexts/ArtworkContext";
import { useLanguage } from "@/components/LanguageToggle";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { Plus, X, ImagePlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const translations = {
  en: {
    title: "Upload Artwork",
    artworkTitle: "Title (English)",
    artworkTitleBg: "Title (Bulgarian)",
    description: "Description (English)",
    descriptionBg: "Description (Bulgarian)",
    image: "Image",
    tags: "Tags",
    addTag: "Add Tag",
    createTag: "Create New Tag",
    cancel: "Cancel",
    upload: "Upload",
    enterTag: "Enter tag name",
    uploadingImage: "Uploading image...",
    imageUploadSuccess: "Image uploaded successfully",
    imageUploadError: "Error uploading image",
    adminOnly: "Only admins can upload artwork"
  },
  bg: {
    title: "Качване на творба",
    artworkTitle: "Заглавие (Английски)",
    artworkTitleBg: "Заглавие (Български)",
    description: "Описание (Английски)",
    descriptionBg: "Описание (Български)",
    image: "Изображение",
    tags: "Етикети",
    addTag: "Добави етикет",
    createTag: "Създай нов етикет",
    cancel: "Отказ",
    upload: "Качи",
    enterTag: "Въведи име на етикет",
    uploadingImage: "Качване на изображение...",
    imageUploadError: "Грешка при качване на изображението",
    imageUploadSuccess: "Изображението е качено успешно",
    adminOnly: "Само администраторите могат да качват творби"
  }
};

interface UploadArtworkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UploadArtworkModal: React.FC<UploadArtworkModalProps> = ({ open, onOpenChange }) => {
  const { addArtwork, getTags } = useArtworks();
  const { language } = useLanguage();
  const { isAdmin, user } = useAuth();
  const t = translations[language];
  
  const [title, setTitle] = useState("");
  const [titleBg, setTitleBg] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionBg, setDescriptionBg] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string; name_bg: string }[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [newTagInputBg, setNewTagInputBg] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  useEffect(() => {
    if (open) {
      loadTags();
    } else {
      resetForm();
    }
  }, [open]);
  
  const loadTags = async () => {
    try {
      const tagsData = await getTags();
      setAvailableTags(tagsData);
    } catch (error) {
      console.error("Error loading tags:", error);
      toast.error("Failed to load tags");
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prevTags => {
      if (prevTags.includes(tagId)) {
        return prevTags.filter(id => id !== tagId);
      } else {
        return [...prevTags, tagId];
      }
    });
  };
  
  const handleAddNewTag = async () => {
    if (!newTagInput.trim() || !newTagInputBg.trim()) {
      toast.error(language === 'en' ? "Both language fields are required" : "Двете езикови полета са задължителни");
      return;
    }
    
    try {
      // Create a slug from the tag name
      const tagId = newTagInput.toLowerCase().replace(/\s+/g, '-');
      
      // Check if the tag already exists
      const existingTag = availableTags.find(tag => tag.id === tagId);
      if (existingTag) {
        handleTagToggle(tagId);
        setNewTagInput("");
        setNewTagInputBg("");
        return;
      }
      
      // Add new tag to the database
      const { data, error } = await supabase
        .from('tags')
        .insert({ id: tagId, name: newTagInput.trim(), name_bg: newTagInputBg.trim() })
        .select()
        .single();
      
      if (error) {
        toast.error("Failed to create tag");
        console.error("Error creating tag:", error);
        return;
      }
      
      // Add the new tag to available tags and selected tags
      setAvailableTags(prev => [...prev, { id: data.id, name: data.name, name_bg: data.name_bg }]);
      setSelectedTags(prev => [...prev, data.id]);
      setNewTagInput("");
      setNewTagInputBg("");
      
    } catch (error) {
      console.error("Error adding new tag:", error);
      toast.error("Failed to create tag");
    }
  };
  
  const uploadImage = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `artwork/${fileName}`;
      
      console.log("Uploading file to path:", filePath);
      console.log("User authenticated:", !!user);
      console.log("User is admin:", isAdmin);
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Error details:', error);
        throw new Error(`Error uploading image: ${JSON.stringify(error)}`);
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
      
      toast.success(t.imageUploadSuccess);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error instanceof Error ? error.message : t.imageUploadError);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast.error(t.adminOnly);
      return;
    }
    
    if (!imageFile) {
      toast.error("Please select an image");
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Upload image first
      let imageUrl: string;
      try {
        imageUrl = await uploadImage(imageFile);
      } catch (error) {
        return; // Stop if image upload fails
      }
      
      // Add artwork with the image URL
      await addArtwork({
        title,
        title_bg: titleBg,
        description,
        description_bg: descriptionBg,
        image: imageUrl,
        tags: selectedTags
      });
      
      // Close the modal and reset the form
      onOpenChange(false);
      resetForm();
      
    } catch (error) {
      console.error("Error submitting artwork:", error);
      toast.error("Failed to upload artwork");
    } finally {
      setIsUploading(false);
    }
  };
  
  const resetForm = () => {
    setTitle("");
    setTitleBg("");
    setDescription("");
    setDescriptionBg("");
    setImageFile(null);
    setImagePreview("");
    setSelectedTags([]);
    setNewTagInput("");
    setNewTagInputBg("");
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t.artworkTitle}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="titleBg">{t.artworkTitleBg}</Label>
            <Input
              id="titleBg"
              value={titleBg}
              onChange={(e) => setTitleBg(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">{t.description}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descriptionBg">{t.descriptionBg}</Label>
            <Textarea
              id="descriptionBg"
              value={descriptionBg}
              onChange={(e) => setDescriptionBg(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">{t.image}</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image-input')?.click()}
                className="flex items-center gap-2"
              >
                <ImagePlus className="h-4 w-4" />
                Select Image
              </Button>
              <Input
                id="image-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                required={!imagePreview}
              />
              {imagePreview && (
                <div className="relative h-16 w-16 rounded overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-0 right-0 h-6 w-6"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>{t.tags}</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {availableTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                  className="cursor-pointer hover-scale"
                  onClick={() => handleTagToggle(tag.id)}
                >
                  {language === 'en' ? tag.name : tag.name_bg}
                </Badge>
              ))}
            </div>
            
            <div className="space-y-2">
              <Input
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder={language === 'en' ? "Enter tag name (English)" : "Въведете име на етикет (Английски)"}
                className="mb-2"
              />
              <Input
                value={newTagInputBg}
                onChange={(e) => setNewTagInputBg(e.target.value)}
                placeholder={language === 'en' ? "Enter tag name (Bulgarian)" : "Въведете име на етикет (Български)"}
                className="mb-2"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddNewTag}
                className="flex items-center gap-1 w-full"
              >
                <Plus className="h-4 w-4" />
                {t.addTag}
              </Button>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t.cancel}
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? t.uploadingImage : t.upload}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadArtworkModal;
