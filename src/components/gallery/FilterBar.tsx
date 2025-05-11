import React from "react";
import { useArtworks } from "../../contexts/ArtworkContext";
import { Badge } from "../ui/badge";
import { useLanguage } from "../../components/LanguageToggle";

interface FilterBarProps {
  selectedTags: string[];
  onTagSelect: (tagId: string) => void;
}

const translations = {
  en: {
    filterBy: "Filter by:",
    clearFilters: "Clear filters"
  },
  bg: {
    filterBy: "Филтрирай по:",
    clearFilters: "Изчисти филтрите"
  }
};

const FilterBar: React.FC<FilterBarProps> = ({ selectedTags, onTagSelect }) => {
  const { getTags } = useArtworks();
  const { language } = useLanguage();
  const t = translations[language];
  
  const tags = getTags();
  
  const handleClearFilters = () => {
    // Call onTagSelect for each selected tag to deselect it
    selectedTags.forEach(tagId => onTagSelect(tagId));
  };

  if (tags.length === 0) {
    return null; // Don't render the filter bar if there are no tags
  }

  return (
    <div className="mb-6 p-4 bg-muted rounded-lg">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium mr-2">{t.filterBy}</span>
        
        {tags.map(tag => (
          <Badge
            key={tag.id}
            variant={selectedTags.includes(tag.id) ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/90 transition-colors"
            onClick={() => onTagSelect(tag.id)}
          >
            {tag.name}
          </Badge>
        ))}
        
        {selectedTags.length > 0 && (
          <button
            onClick={handleClearFilters}
            className="text-xs text-muted-foreground hover:text-primary ml-2"
          >
            {t.clearFilters}
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;