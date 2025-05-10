
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 animate-fade-in">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
