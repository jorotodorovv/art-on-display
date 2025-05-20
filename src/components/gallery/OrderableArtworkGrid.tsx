
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Artwork } from "@/types/artwork";
import { useLanguage } from "@/components/LanguageToggle";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { EuroIcon } from "lucide-react";

interface OrderableArtworkGridProps {
  artworks: Artwork[];
  onArtworkClick: (artwork: Artwork) => void;
  onReorder: (reorderedArtworks: Artwork[]) => Promise<void>;
  noArtworksMessage: string;
}

const OrderableArtworkGrid: React.FC<OrderableArtworkGridProps> = ({ 
  artworks, 
  onArtworkClick,
  onReorder,
  noArtworksMessage
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
    if (!result.destination) {
      return;
    }
    
    // Even if destination index is the same as source index, we still want to
    // process it as the user might have dragged horizontally or between rows
    const newItems = Array.from(items);
    const [movedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, movedItem);
    
    // Update state locally for immediate visual feedback
    setItems(newItems);
    
    // Persist the changes to the database
    await onReorder(newItems);
  };

  if (artworks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{noArtworksMessage}</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Droppable droppableId="artwork-grid" direction="horizontal">
        {(provided) => (
          <div 
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {items.map((artwork, index) => {
              // Get the appropriate title based on the selected language
              const title = language === 'en' ? artwork.title : (artwork.title_bg || artwork.title);
              
              return (
                <Draggable key={artwork.id.toString()} draggableId={artwork.id.toString()} index={index}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`group cursor-grab transition-transform duration-300 ${
                        snapshot.isDragging ? 'shadow-lg scale-105 z-10' : ''
                      }`}
                      onClick={snapshot.isDragging ? undefined : () => onArtworkClick(artwork)}
                    >
                      <div className="rounded-md overflow-hidden image-hover relative">
                        <img 
                          loading="lazy"
                          src={artwork.image} 
                          alt={title} 
                          className={`w-full aspect-[4/3] object-cover transition-transform duration-300 ${
                            snapshot.isDragging ? '' : 'group-hover:scale-105'
                          }`}
                        />
                        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium">
                          {index + 1}
                        </div>
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
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default OrderableArtworkGrid;
