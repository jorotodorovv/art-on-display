
import { Instagram, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full border-t border-border mt-8">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ArtistName. All rights reserved.
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover-scale text-muted-foreground hover:text-primary"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a 
              href="mailto:artist@example.com" 
              className="hover-scale text-muted-foreground hover:text-primary"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
