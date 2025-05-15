
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
    artworkTitle: "Title",
    description: "Description",
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
    title: "Subir Obra",
    artworkTitle: "Título",
    description: "Descripción",
    image: "Imagen",
    tags: "Etiquetas",
    addTag: "Añadir Etiqueta",
    createTag: "Crear Nueva Etiqueta",
    cancel: "Cancelar",
    upload: "Subir",
    enterTag: "Ingrese nombre de etiqueta",
    uploadingImage: "Subiendo imagen...",
    imageUploadError: "Error al subir la imagen",
    imageUploadSuccess: "Imagen subida exitosamente",
    adminOnly: "Solo los administradores pueden subir obras"
  }
};

interface UploadArtworkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UploadArtworkModal: React.FC<UploadArtworkModalProps> = ({ open, onOpenChange }) => {
  const { addArtwork, getTags } = useArtworks();
  const { language } = useLanguage();
  const { isAdmin } = useAuth();
  const t = translations[language];
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string }[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  useEffect(() => {
    if (open) {
      loadTags();
    } else {
      resetForm();
    }
  }, [open]);
  
  const loadTags = async () => {
    const tagsData = await getTags();
    setAvailableTags(tagsData);
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
    if (!newTagInput.trim()) return;
    
    try {
      // Create a slug from the tag name
      const tagId = newTagInput.toLowerCase().replace(/\s+/g, '-');
      
      // Check if the tag already exists
      const existingTag = availableTags.find(tag => tag.id === tagId);
      if (existingTag) {
        handleTagToggle(tagId);
        setNewTagInput("");
        return;
      }
      
      // Add new tag to the database
      const { data, error } = await supabase
        .from('tags')
        .insert({ id: tagId, name: newTagInput.trim() })
        .select()
        .single();
      
      if (error) {
        toast.error("Failed to create tag");
        console.error("Error creating tag:", error);
        return;
      }
      
      // Add the new tag to available tags and selected tags
      setAvailableTags(prev => [...prev, { id: data.id, name: data.name }]);
      setSelectedTags(prev => [...prev, data.id]);
      setNewTagInput("");
      
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
      
      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('images')
        .upload(filePath, file);
      
      if (error) {
        throw error;
      }
      
      // Get the public URL
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
      
      toast.success(t.imageUploadSuccess);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(t.imageUploadError);
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
        description,
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
    setDescription("");
    setImageFile(null);
    setImagePreview("");
    setSelectedTags([]);
    setNewTagInput("");
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
            <Label htmlFor="description">{t.description}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                  {tag.name}
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder={t.enterTag}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddNewTag}
                className="flex items-center gap-1"
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
