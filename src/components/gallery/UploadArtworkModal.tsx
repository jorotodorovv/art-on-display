
import React, { useState } from "react";
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
import { useArtworks } from "@/contexts/ArtworkContext";
import { useLanguage } from "@/components/LanguageToggle";
import { toast } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";

const translations = {
  en: {
    title: "Upload Artwork",
    imageUrl: "Image URL",
    artworkTitle: "Title",
    category: "Category",
    year: "Year",
    description: "Description",
    tags: "Tags (comma separated)",
    upload: "Upload",
    cancel: "Cancel",
    success: "Artwork uploaded successfully",
    error: "Please fill in all required fields"
  },
  bg: {
    title: "Subir Obra",
    imageUrl: "URL de Imagen",
    artworkTitle: "Título",
    category: "Categoría",
    year: "Año",
    description: "Descripción",
    tags: "Etiquetas (separadas por coma)",
    upload: "Subir",
    cancel: "Cancelar",
    success: "Obra subida exitosamente",
    error: "Por favor completa todos los campos requeridos"
  }
};

interface UploadArtworkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UploadArtworkModal: React.FC<UploadArtworkModalProps> = ({ open, onOpenChange }) => {
  const { addArtwork } = useArtworks();
  const { language } = useLanguage();
  const t = translations[language];
  
  const [formData, setFormData] = useState({
    title: "",
    image: "",
    category: "",
    year: "",
    description: "",
    tagsInput: ""
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { title, image, category, year, description, tagsInput } = formData;
    
    if (!title || !image || !category || !year) {
      toast.error(t.error);
      return;
    }
    
    const tagsList = tagsInput
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag !== "")
      .map(tag => ({
        id: tag.toLowerCase().replace(/\s+/g, "-"),
        name: tag
      }));
    
    addArtwork({
      title,
      image,
      category,
      year,
      description,
      tags: tagsList
    });
    
    toast.success(t.success);
    setFormData({
      title: "",
      image: "",
      category: "",
      year: "",
      description: "",
      tagsInput: ""
    });
    
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">{t.imageUrl}</Label>
            <Input
              id="image"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">{t.artworkTitle}</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">{t.category}</Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="year">{t.year}</Label>
              <Input
                id="year"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">{t.description}</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tagsInput">{t.tags}</Label>
            <Input
              id="tagsInput"
              name="tagsInput"
              value={formData.tagsInput}
              onChange={handleInputChange}
              placeholder="Nature, Abstract, Modern"
            />
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t.cancel}
            </Button>
            <Button type="submit">{t.upload}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadArtworkModal;
