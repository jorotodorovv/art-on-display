
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageToggle";
import { Upload, Import, Plus, X } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useArtworks } from "../contexts/ArtworkContext";
import { ArtworkTag } from "../types/artwork";

const translations = {
  en: {
    title: "Admin Dashboard",
    subtitle: "Manage your gallery",
    upload: "Upload Photos",
    import: "Import Photos",
    logout: "Logout",
    dropzone: "Drag and drop your image here, or click to select",
    processing: "Processing...",
    success: "Image uploaded successfully!",
    error: "Failed to upload image",
    imageTitle: "Image Title",
    imageDesc: "Image Description",
    category: "Category",
    year: "Year",
    addTag: "Add Tag",
    enterTag: "Enter tag",
    tags: "Tags",
    addToGallery: "Add to Gallery"
  },
  es: {
    title: "Panel de Administración",
    subtitle: "Administra tu galería",
    upload: "Subir Fotos",
    import: "Importar Fotos",
    logout: "Cerrar Sesión",
    dropzone: "Arrastra y suelta tu imagen aquí, o haz clic para seleccionar",
    processing: "Procesando...",
    success: "¡Imagen subida exitosamente!",
    error: "Error al subir la imagen",
    imageTitle: "Título de la Imagen",
    imageDesc: "Descripción de la Imagen",
    category: "Categoría",
    year: "Año",
    addTag: "Añadir Etiqueta",
    enterTag: "Ingrese etiqueta",
    tags: "Etiquetas",
    addToGallery: "Añadir a la Galería"
  }
};

const Admin = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language } = useLanguage();
  const { addArtwork, getTags } = useArtworks();
  const t = translations[language];
  
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Paintings");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<ArtworkTag[]>([]);
  
  const availableTags = getTags();
  
  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/login" />;
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    setIsUploading(true);
    
    // In a real application, we'd upload these to a server or storage service
    // For demo purposes, we're just creating local URLs
    if (files[0] && files[0].type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(files[0]);
      
      // Simulate upload delay
      setTimeout(() => {
        setUploadedImage(imageUrl);
        setIsUploading(false);
        toast.success(t.success);
      }, 1000);
    } else {
      setIsUploading(false);
      toast.error(t.error);
    }
  };

  const handleImport = () => {
    // This would typically open a dialog to import from external sources
    setIsUploading(true);
    
    // For demo purposes, let's just add a placeholder image
    setTimeout(() => {
      setUploadedImage('https://source.unsplash.com/random/800x600?art');
      setIsUploading(false);
      toast.success(t.success);
    }, 1000);
  };
  
  const addTag = () => {
    if (tagInput.trim()) {
      const tagId = tagInput.toLowerCase().replace(/\s+/g, '-');
      
      // Check if tag is already selected
      if (!selectedTags.some(tag => tag.id === tagId)) {
        // Check if tag exists in available tags
        const existingTag = availableTags.find(tag => tag.id === tagId);
        
        if (existingTag) {
          setSelectedTags([...selectedTags, existingTag]);
        } else {
          setSelectedTags([...selectedTags, { id: tagId, name: tagInput.trim() }]);
        }
      }
      
      setTagInput("");
    }
  };
  
  const removeTag = (id: string) => {
    setSelectedTags(selectedTags.filter(tag => tag.id !== id));
  };
  
  const handleAddToGallery = () => {
    if (!title || !uploadedImage) {
      toast.error("Please provide a title and upload an image");
      return;
    }
    
    addArtwork({
      title,
      image: uploadedImage,
      category,
      year,
      description,
      tags: selectedTags
    });
    
    // Reset the form
    setTitle("");
    setDescription("");
    setCategory("Paintings");
    setYear(new Date().getFullYear().toString());
    setSelectedTags([]);
    setUploadedImage(null);
    
    toast.success("Added to gallery successfully!");
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button variant="destructive" onClick={logout}>
          {t.logout}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {!uploadedImage ? (
          <>
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors hover:bg-accent/50 ${
                isDragging ? "border-primary bg-accent/50" : "border-border"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{t.dropzone}</p>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>

            <div
              className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors hover:bg-accent/50"
              onClick={handleImport}
            >
              <Import className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{t.import}</p>
            </div>
          </>
        ) : (
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="aspect-square rounded-md overflow-hidden">
              <img
                src={uploadedImage}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">{t.imageTitle}</label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.imageTitle}
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">{t.imageDesc}</label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.imageDesc}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-1">{t.category}</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="Paintings">Paintings</option>
                    <option value="Digital Art">Digital Art</option>
                    <option value="Photography">Photography</option>
                    <option value="Mixed Media">Mixed Media</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="year" className="block text-sm font-medium mb-1">{t.year}</label>
                  <Input
                    id="year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder={t.year}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">{t.tags}</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTags.map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
                      {tag.name}
                      <button 
                        onClick={() => removeTag(tag.id)}
                        className="hover:text-destructive"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder={t.enterTag}
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button type="button" size="icon" onClick={addTag}>
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
              
              <Button 
                className="w-full mt-4" 
                onClick={handleAddToGallery}
              >
                {t.addToGallery}
              </Button>
            </div>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="text-center py-8">
          <p>{t.processing}</p>
        </div>
      )}
    </div>
  );
};

export default Admin;
