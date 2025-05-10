
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageToggle";
import { Upload, Import } from "lucide-react";
import { toast } from "@/components/ui/sonner";

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
    error: "Failed to upload image"
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
    error: "Error al subir la imagen"
  }
};

const Admin = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

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
    const newImages: string[] = [];
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const imageUrl = URL.createObjectURL(file);
        newImages.push(imageUrl);
      }
    });
    
    // Simulate upload delay
    setTimeout(() => {
      setUploadedImages(prev => [...prev, ...newImages]);
      setIsUploading(false);
      toast.success(t.success);
    }, 1500);
  };

  const handleImport = () => {
    // This would typically open a dialog to import from external sources
    // For demo purposes, let's just add some placeholder images
    const placeholders = [
      'https://source.unsplash.com/random/300x300?art',
      'https://source.unsplash.com/random/300x300?painting',
    ];
    
    setIsUploading(true);
    
    setTimeout(() => {
      setUploadedImages(prev => [...prev, ...placeholders]);
      setIsUploading(false);
      toast.success(t.success);
    }, 1500);
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
      </div>

      {isUploading && (
        <div className="text-center py-8">
          <p>{t.processing}</p>
        </div>
      )}

      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadedImages.map((image, index) => (
            <div key={index} className="aspect-square rounded-md overflow-hidden">
              <img
                src={image}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-full object-cover hover-scale transition-all"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Admin;
