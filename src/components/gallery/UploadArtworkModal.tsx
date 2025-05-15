
import React, { useState, useRef } from "react";
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
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X, FileImage } from "lucide-react";
import { useUploadFileMutation } from '@/lib/api/upload';
import { useAuth } from "@/contexts/AuthContext";

const translations = {
  en: {
    title: "Upload Artwork",
    imageUpload: "Upload Image",
    artworkTitle: "Title",
    description: "Description",
    tags: "Tags",
    addTag: "Add tag",
    upload: "Upload",
    cancel: "Cancel",
    success: "Artwork uploaded successfully",
    error: "Please fill in all required fields",
    dragHere: "Drag image here or click to browse",
    tagPlaceholder: "Enter a tag...",
    uploadError: "Failed to upload image. Please try again.",
    uploadingStatus: "Uploading image...",
    uploadGenericError: "An error occurred during upload.",
  },
  bg: {
    title: "Subir Obra",
    imageUpload: "Subir Imagen",
    artworkTitle: "Título",
    description: "Descripción",
    tags: "Etiquetas",
    addTag: "Añadir etiqueta",
    upload: "Subir",
    cancel: "Cancelar",
    success: "Obra subida exitosamente",
    error: "Por favor completa todos los campos requeridos",
    dragHere: "Arrastra la imagen aquí o haz clic para explorar",
    tagPlaceholder: "Introduce una etiqueta...",
    uploadError: "Грешка при качване на изображението. Моля, опитайте отново.",
    uploadingStatus: "Качване на изображение...",
    uploadGenericError: "Възникна грешка по време на качването.",
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Use the new mutation hook
  const uploadMutation = useUploadFileMutation();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    forSale: false,
    price: ""
  });

  const [tags, setTags] = useState<{ id: string, name: string }[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setImageFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() === "") return;

    const newTag = {
      id: tagInput.toLowerCase().replace(/\s+/g, "-"),
      name: tagInput.trim()
    };

    setTags(prevTags => [...prevTags, newTag]);
    setTagInput("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setTags(prevTags => prevTags.filter(tag => tag.id !== tagId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { title, description, price, forSale } = formData;

    if (!title) {
      toast.error(t.error + " (Title is missing)");
      return;
    }

    if (!imageFile) {
      toast.error(t.uploadError + " (No image file selected)");
      return;
    }

    try {
      toast.info(t.uploadingStatus);

      // Use a unique filename or the original filename.
      // Consider sanitizing the filename or generating a unique ID.
      const filename = imageFile.name;

      // Call the mutation
      const blobResult = await uploadMutation.mutateAsync({
        file: imageFile,
        filename: filename,
        token: user.access_token,
        artwork: {
          title: title,
          description: description,
          tags: tags.map(tag => tag.name),
          price: forSale ? Number(price) : undefined,
        }
      });

      if (!blobResult || !blobResult.url) {
        console.error("Vercel Blob upload did not return a valid URL:", blobResult);
        throw new Error(t.uploadError + " (Invalid response from upload service)");
      }

      addArtwork({
        title,
        blob_url: blobResult.url,
        date: new Date().toISOString(),
        description,
        tags: tags,
        forSale: forSale,
        price: forSale ? Number(price) : undefined
      });

      toast.success(t.success);

      // Reset form
      setFormData({
        title: "",
        description: "",
        forSale: false,
        price: ""
      });

      setTags([]);
      setPreviewImage(null);
      setImageFile(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onOpenChange(false);

    } catch (error) {
      console.error("Upload failed:", error);
      const errorMessage = error instanceof Error ? error.message : t.uploadGenericError;
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {previewImage ? (
              <div className="relative">
                <img src={previewImage} alt="Preview" className="max-h-48 mx-auto rounded-md" />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewImage(null);
                    setImageFile(null);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="py-4 flex flex-col items-center text-muted-foreground">
                <FileImage className="h-8 w-8 mb-2" />
                <p>{t.dragHere}</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
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
            <Label>{t.tags}</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <Badge key={tag.id} className="flex gap-1 items-center">
                  {tag.name}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveTag(tag.id)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={t.tagPlaceholder}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                size="sm"
                className="flex-shrink-0"
                disabled={!tagInput.trim()}
              >
                <Plus className="h-4 w-4 mr-1" />
                {t.addTag}
              </Button>
            </div>
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
