
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageToggle";
import { useArtworks } from "../contexts/ArtworkContext";
import { useAuth } from "../contexts/AuthContext";
import { Artwork } from "@/types/artwork";
import { Plus, GripVertical } from "lucide-react";
import ArtworkGrid from "@/components/gallery/ArtworkGrid";
import ArtworkDetail from "@/components/gallery/ArtworkDetail";
import UploadArtworkModal from "@/components/gallery/UploadArtworkModal";
import { useLocation } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

const translations = {
  en: {
    title: "Gallery",
    allCategories: "All",
    allTags: "All Tags",
    noArtworks: "No artworks found.",
    uploadArtwork: "Upload Artwork",
    reorderMode: "Reorder Mode",
    viewMode: "View Mode"
  },
  bg: {
    title: "Галерия",
    allCategories: "Всички",
    allTags: "Всички Етикети",
    noArtworks: "Няма намерени творби.",
    uploadArtwork: "Качи Творба",
    reorderMode: "Режим на пренареждане",
    viewMode: "Режим на преглед"
  }
};

const Gallery = () => {
  const { language } = useLanguage();
  const { artworks, isLoading, reorderArtworks } = useArtworks();
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  const t = translations[language];

  const [loaded, setLoaded] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>(artworks);
  const [visibleArtwork, setVisibleArtwork] = useState<Artwork | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [isForSaleModalOpen, setIsForSaleModalOpen] = useState(false);
  const [selectedForSaleArtwork, setSelectedForSaleArtwork] = useState<Artwork | null>(null);

  // Get unique tags
  const tagObjects = artworks
    .flatMap(artwork => artwork.tags)
    .filter((tag, index, self) =>
      index === self.findIndex(t => t.id === tag.id)
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    setLoaded(!isLoading);

    // Filter artworks based on selected tag
    let filtered = [...artworks];

    if (selectedTag) {
      filtered = filtered.filter(artwork =>
        artwork.tags.some(tag => tag.id === selectedTag)
      );
    }

    setFilteredArtworks(filtered);
  }, [selectedTag, artworks, isLoading]);

  // Handle opening artwork details from navigation state
  useEffect(() => {
    if (location.state?.openArtworkId && artworks.length > 0) {
      const artworkToOpen = artworks.find(art => art.id === location.state.openArtworkId);
      if (artworkToOpen) {
        setVisibleArtwork(artworkToOpen);
        // Clear the state to avoid reopening on component updates
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, artworks]);

  const handleTagSelect = (tagId: string | null) => {
    setSelectedTag(tagId);
    setIsReorderMode(false); // Exit reorder mode when filtering
  };

  const openArtworkDetail = (artwork: Artwork) => {
    if (!isReorderMode) {
      setVisibleArtwork(artwork);
    }
  };

  const closeArtworkDetail = () => {
    setVisibleArtwork(null);
  };

  const handleSetForSale = (artwork: Artwork) => {
    setSelectedForSaleArtwork(artwork);
    setVisibleArtwork(null);
    setIsForSaleModalOpen(true);
  };

  const handleReorder = async (reorderedArtworks: Artwork[]) => {
    await reorderArtworks(reorderedArtworks);
  };

  const toggleReorderMode = () => {
    setIsReorderMode(!isReorderMode);
    
    if (!isReorderMode) {
      // Entering reorder mode
      setSelectedTag(null); // Clear tag filter when reordering
      toast.info("Drag and drop artworks to reorder them");
    }
  };

  return (
    <>
      <div className={`space-y-8 ${loaded ? 'animate-fade-in' : 'opacity-0'}`}>
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-6">
            <h1 className="text-3xl font-bold">{t.title}</h1>

            <div className="flex gap-2">
              {isAdmin && (
                <>
                  <Button
                    onClick={toggleReorderMode}
                    variant={isReorderMode ? "secondary" : "outline"}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <GripVertical className="h-4 w-4" />
                    {isReorderMode ? t.viewMode : t.reorderMode}
                  </Button>

                  <Button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                    {t.uploadArtwork}
                  </Button>
                </>
              )}
            </div>
          </div>

          {!isReorderMode && (
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              <Badge
                key="all"
                variant={selectedTag === null ? "secondary" : "outline"}
                className="cursor-pointer hover-scale"
                onClick={() => handleTagSelect(null)}
              >
                {t.allTags}
              </Badge>
              {tagObjects.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTag === tag.id ? "secondary" : "outline"}
                  className="cursor-pointer hover-scale"
                  onClick={() => handleTagSelect(tag.id)}
                >
                  {language === 'en' ? tag.name : tag.name_bg}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <ArtworkGrid
          artworks={isReorderMode ? artworks : filteredArtworks}
          onArtworkClick={openArtworkDetail}
          noArtworksMessage={t.noArtworks}
          orderable={isAdmin && isReorderMode}
          onReorder={isReorderMode ? handleReorder : undefined}
        />
      </div>

      {visibleArtwork && (
        <ArtworkDetail
          artwork={visibleArtwork}
          onClose={closeArtworkDetail}
          onSetForSale={isAdmin ? handleSetForSale : undefined}
        />
      )}

      <UploadArtworkModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
      />
    </>
  );
};

export default Gallery;
