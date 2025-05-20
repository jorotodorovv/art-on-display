
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Artwork } from "@/types/artwork";
import { useLanguage } from "@/components/LanguageToggle";
import { EuroIcon } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface ArtworkGridProps {
  artworks: Artwork[];
  onArtworkClick: (artwork: Artwork) => void;
  noArtworksMessage: string;
  orderable?: boolean;
  onReorder?: (reorderedArtworks: Artwork[]) => Promise<void>;
}

const ArtworkGrid: React.FC<ArtworkGridProps> = ({ 
  artworks, 
  onArtworkClick,
  noArtworksMessage,
  orderable = false,
  onReorder
}) => {
  const { language } = useLanguage();
  const [items, setItems] = useState<Artwork[]>(artworks);
  const [isDragging, setIsDragging] = useState(false);
  
  // Update local state when artworks prop changes
  useEffect(() => {
    setItems(artworks);
  }, [artworks]);
  
  const handleDragStart = () => {
    setIsDragging(true);
    // Add a class to the body to indicate dragging (for styling)
    document.body.classList.add('dragging-artwork');
  };

  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false);
    document.body.classList.remove('dragging-artwork');
    
    // Drop outside the list or no movement
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }
    
    // Reorder the items
    const newItems = Array.from(items);
    const [movedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, movedItem);
    
    // Update state locally for immediate visual feedback
    setItems(newItems);
    
    // Persist the changes to the database
    if (onReorder) {
      await onReorder(newItems);
    }
  };

  if (artworks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{noArtworksMessage}</p>
      </div>
    );
  }

  // Render a single artwork item - extracted as a reusable component
  const renderArtworkItem = (artwork: Artwork, index?: number, isDragging?: boolean, dragHandleProps?: any) => {
    const title = language === 'en' ? artwork.title : (artwork.title_bg || artwork.title);
    
    // Common classes for both modes
    const containerClasses = orderable 
      ? `group cursor-grab transition-transform duration-300 ${isDragging ? 'shadow-lg scale-105 z-10' : ''}`
      : "group cursor-pointer relative";
    
    const imageClasses = `w-full aspect-[4/3] object-cover transition-transform duration-300 ${
      orderable && isDragging ? '' : 'group-hover:scale-105'
    }`;

    return (
      <div 
        key={artwork.id} 
        className={containerClasses}
        onClick={orderable && isDragging ? undefined : () => onArtworkClick(artwork)}
        {...(dragHandleProps || {})}
      >
        <div className="rounded-md overflow-hidden image-hover relative">
          <img 
            loading="lazy"
            src={artwork.image} 
            alt={title} 
            className={imageClasses}
          />
          {orderable && index !== undefined && (
            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium">
              {index + 1}
            </div>
          )}
        </div>
        <div className="mt-3">
          <h3 className="font-medium">{title}</h3>
          <div className="flex flex-wrap gap-1 mt-2">
            {artwork.tags.map(tag => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {language === 'en' ? tag.name : tag.name_bg}
              </Badge>
            ))}
          </div>
          
          {/* Price display for artworks that are for sale */}
          {artwork.for_sale && artwork.price && (
            <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground px-2 py-1 rounded-tl-md flex items-center gap-1 text-sm font-medium">
              <EuroIcon className="h-4 w-4" />
              <span>{artwork.price.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Common grid container class
  const gridContainerClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  // Regular grid (non-orderable)
  if (!orderable) {
    return (
      <div className={gridContainerClass}>
        {artworks.map((artwork) => renderArtworkItem(artwork))}
      </div>
    );
  }

  // Orderable grid with drag and drop
  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Droppable droppableId="artwork-grid" direction="horizontal">
        {(provided) => (
          <div 
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={gridContainerClass}
          >
            {items.map((artwork, index) => (
              <Draggable key={artwork.id.toString()} draggableId={artwork.id.toString()} index={index}>
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    {renderArtworkItem(
                      artwork, 
                      index, 
                      snapshot.isDragging, 
                      provided.dragHandleProps
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default ArtworkGrid;
