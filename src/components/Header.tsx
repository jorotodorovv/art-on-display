
import { NavLink, Link } from "react-router-dom";
import { Instagram, Mail, User, LogOut } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import LanguageToggle from "./LanguageToggle";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import { getContentById } from "@/services/contentService";
import { useLanguage } from "./LanguageToggle";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { language } = useLanguage();
  const [navTexts, setNavTexts] = useState({
    home: { en: "Home", bg: "Начало" },
    about: { en: "About", bg: "За Мен" },
    gallery: { en: "Gallery", bg: "Галерия" },
    forSale: { en: "For Sale", bg: "За Продажба" },
    login: { en: "Login", bg: "Вход" }
  });

  useEffect(() => {
    async function loadNavTexts() {
      const homeText = await getContentById("nav-home");
      const aboutText = await getContentById("nav-about");
      const galleryText = await getContentById("nav-gallery");
      const forSaleText = await getContentById("nav-for-sale");
      const loginText = await getContentById("nav-login");

      setNavTexts({
        home: homeText || navTexts.home,
        about: aboutText || navTexts.about,
        gallery: galleryText || navTexts.gallery,
        forSale: forSaleText || navTexts.forSale,
        login: loginText || navTexts.login
      });
    }

    loadNavTexts();
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  return (
    <header className="sticky top-0 z-10 w-full bg-white/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <NavLink to="/" className="flex items-center">
            <span className="text-xl font-bold hover:opacity-80 transition-opacity">ArtistName</span>
          </NavLink>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `art-link text-sm font-medium ${isActive ? 'text-primary after:scale-x-100' : 'text-muted-foreground'}`
            }
            end
          >
            {language === "en" ? navTexts.home.en : navTexts.home.bg}
          </NavLink>
          <NavLink 
            to="/about" 
            className={({ isActive }) => 
              `art-link text-sm font-medium ${isActive ? 'text-primary after:scale-x-100' : 'text-muted-foreground'}`
            }
          >
            {language === "en" ? navTexts.about.en : navTexts.about.bg}
          </NavLink>
          <NavLink 
            to="/gallery" 
            className={({ isActive }) => 
              `art-link text-sm font-medium ${isActive ? 'text-primary after:scale-x-100' : 'text-muted-foreground'}`
            }
          >
            {language === "en" ? navTexts.gallery.en : navTexts.gallery.bg}
          </NavLink>
        </nav>
        
        <div className="flex items-center space-x-4">
          <LanguageToggle />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover-scale text-muted-foreground hover:text-primary"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Instagram</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a 
                  href="mailto:artist@example.com" 
                  className="hover-scale text-muted-foreground hover:text-primary"
                  aria-label="Email"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Email me</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isAuthenticated ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a 
                    href="#"
                    onClick={handleLogout}
                    className="hover-scale text-muted-foreground hover:text-primary"
                    aria-label="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link 
                    to="/login"
                    className="hover-scale text-muted-foreground hover:text-primary"
                    aria-label="Login"
                  >
                    <User className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Login</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
