
import { useState, useEffect } from "react";
import { useArtworks } from "../contexts/ArtworkContext";
import ArtworkGrid from "../components/gallery/ArtworkGrid";
import FilterBar from "../components/gallery/FilterBar";
import { useLanguage } from "@/contexts/LanguageContext";
import { Artwork } from "../types/artwork";
import { Spinner } from "../components/ui/spinner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ArtworkDetail from "@/components/gallery/ArtworkDetail";
import UploadArtworkModal from "@/components/gallery/UploadArtworkModal";
import SetForSaleModal from "@/components/gallery/SetForSaleModal";


const translations = {
  en: {
    title: "Gallery",
    noArtworks: "No artworks found",
    loading: "Loading artworks...",
    error: "Error loading artworks",
    uploadArtwork: "Upload Artwork"
  },
  bg: {
    title: "Галерия",
    noArtworks: "Няма намерени произведения",
    loading: "Зареждане на произведения...",
    error: "Грешка при зареждане на произведения",
    uploadArtwork: "Закачи Произведение"
  }
};

const Gallery = () => {
  const { artworks, loading, error } = useArtworks();
  const { isAuthenticated } = useAuth();
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [visibleArtwork, setVisibleArtwork] = useState<Artwork | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isForSaleModalOpen, setIsForSaleModalOpen] = useState(false);
  const [selectedForSaleArtwork, setSelectedForSaleArtwork] = useState<Artwork | null>(null);

  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    if (selectedTags.length === 0) {
      setFilteredArtworks(artworks);
    } else {
      setFilteredArtworks(
        artworks.filter(artwork =>
          artwork.tags.some(tag => selectedTags.includes(tag.id))
        )
      );
    }
  }, [artworks, selectedTags]);

  const handleTagSelect = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const openArtworkDetail = (artwork: Artwork) => {
    setVisibleArtwork(artwork);
  };

  const closeArtworkDetail = () => {
    setVisibleArtwork(null);
  };

  const handleSetForSale = (artwork: Artwork) => {
    setSelectedForSaleArtwork(artwork);
    setVisibleArtwork(null);
    setIsForSaleModalOpen(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex flex-col items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">{t.title}</h1>
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          {t.error}: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 animate-fade-in`}>
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-6">
          <h1 className="text-3xl font-bold">{t.title}</h1>

          {isAuthenticated && (
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              {t.uploadArtwork}
            </Button>
          )}
        </div>


        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <FilterBar selectedTags={selectedTags} onTagSelect={handleTagSelect} />
        </div>
      </div>

      <ArtworkGrid
        artworks={filteredArtworks}
        onArtworkClick={openArtworkDetail}
        noArtworksMessage={t.noArtworks}
      />

      {visibleArtwork && (
        <ArtworkDetail
          artwork={visibleArtwork}
          onClose={closeArtworkDetail}
          onSetForSale={isAuthenticated ? handleSetForSale : undefined}
        />
      )}

      <UploadArtworkModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
      />

      <SetForSaleModal
        open={isForSaleModalOpen}
        onOpenChange={setIsForSaleModalOpen}
        artwork={selectedForSaleArtwork}
      />
    </div>
  );
};

export default Gallery;
