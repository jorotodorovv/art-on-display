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

  if (tags.length === 0) {
    return null; // Don't render the filter bar if there are no tags
  }

  return (
    tags.map(tag => (
      <Badge
        key={tag.id}
        variant={selectedTags.includes(tag.id) ? "default" : "outline"}
        className="cursor-pointer hover-scale"
        onClick={() => onTagSelect(tag.id)}
      >
        {tag.name}
      </Badge>
    ))
  );
};

export default FilterBar;