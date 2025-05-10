
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    setLoaded(true);
  }, []);
  
  return (
    <div className={`space-y-8 ${loaded ? 'animate-fade-in' : 'opacity-0'}`}>
      <section className="flex flex-col lg:flex-row gap-8 items-center">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Contemporary Art by<br />
            <span className="text-primary">ArtistName</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Exploring the boundary between abstract and figurative art through diverse media and techniques.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild className="hover-scale">
              <Link to="/gallery">Browse Gallery</Link>
            </Button>
            <Button variant="outline" asChild className="hover-scale">
              <Link to="/about">About the Artist</Link>
            </Button>
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="aspect-square bg-muted rounded-md overflow-hidden image-hover">
            <img 
              src="https://images.unsplash.com/photo-1500673922987-e212871fec22" 
              alt="Featured artwork" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
      
      <section className="py-12">
        <h2 className="text-2xl font-semibold mb-6 text-center">Featured Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              id: 1,
              title: "Tranquil Waters",
              image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
              category: "Paintings"
            },
            {
              id: 2,
              title: "Mountain View",
              image: "https://images.unsplash.com/photo-1501854140801-50d01698950b",
              category: "Digital Art"
            },
            {
              id: 3,
              title: "Urban Landscape",
              image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625",
              category: "Photography"
            }
          ].map((work) => (
            <Link 
              to="/gallery" 
              key={work.id} 
              className="group block"
            >
              <div className="rounded-md overflow-hidden image-hover">
                <img 
                  src={work.image} 
                  alt={work.title} 
                  className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="mt-3">
                <h3 className="font-medium">{work.title}</h3>
                <p className="text-sm text-muted-foreground">{work.category}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button variant="outline" asChild className="hover-scale">
            <Link to="/gallery">View All Works</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
