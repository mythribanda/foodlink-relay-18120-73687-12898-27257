import { Link } from "react-router-dom";
import { Package, Building2, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-food-sharing.jpg";
import iconDonate from "@/assets/icon-donate.png";
import iconNgo from "@/assets/icon-ngo.png";
import iconVolunteer from "@/assets/icon-volunteer.png";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-primary" />
              <span className="font-heading text-2xl font-bold text-primary">Foodlink</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#how-it-works" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                How it Works
              </a>
              <a href="#about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                About Us
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="outline" size="default">
                  Login
                </Button>
              </Link>
              <Link to="/auth?signup=true">
                <Button variant="default" size="default">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            filter: 'brightness(0.4)'
          }}
        />
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Don't waste it. Share it.
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-white/90">
              Connect surplus food with communities in need, one delivery at a time.
            </p>

            {/* Role-Based CTAs */}
            <div className="grid md:grid-cols-3 gap-6 mt-16">
              <Link to="/auth?role=donor" className="group">
                <div className="bg-card/95 backdrop-blur-sm rounded-xl p-8 shadow-card-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-border/50">
                  <div className="mb-6 flex justify-center">
                    <img src={iconDonate} alt="Donate Food" className="h-20 w-20" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                    Donate Food
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Share your surplus food with those who need it most
                  </p>
                  <Button variant="urgent" size="lg" className="mt-6 w-full">
                    Get Started
                  </Button>
                </div>
              </Link>

              <Link to="/auth?role=ngo" className="group">
                <div className="bg-card/95 backdrop-blur-sm rounded-xl p-8 shadow-card-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-border/50">
                  <div className="mb-6 flex justify-center">
                    <img src={iconNgo} alt="Receive Food" className="h-20 w-20" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                    Receive Food (NGO)
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Get fresh donations for your community programs
                  </p>
                  <Button variant="urgent" size="lg" className="mt-6 w-full">
                    Get Started
                  </Button>
                </div>
              </Link>

              <Link to="/auth?role=volunteer" className="group">
                <div className="bg-card/95 backdrop-blur-sm rounded-xl p-8 shadow-card-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-border/50">
                  <div className="mb-6 flex justify-center">
                    <img src={iconVolunteer} alt="Deliver Food" className="h-20 w-20" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                    Deliver Food (Volunteer)
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Help transport donations from donors to communities
                  </p>
                  <Button variant="urgent" size="lg" className="mt-6 w-full">
                    Get Started
                  </Button>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-4xl font-bold text-center mb-16 text-foreground">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-3">1. Donate</h3>
              <p className="text-muted-foreground">
                Restaurants and individuals post surplus food with photos and shelf life
              </p>
            </div>
            <div className="text-center">
              <div className="bg-secondary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Building2 className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-3">2. Request</h3>
              <p className="text-muted-foreground">
                NGOs browse nearby donations on a map and request pickups
              </p>
            </div>
            <div className="text-center">
              <div className="bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Bike className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-3">3. Deliver</h3>
              <p className="text-muted-foreground">
                Volunteers pick up from donors and deliver to communities in need
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2025 Foodlink. Making food sharing simple, fast, and trustworthy.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
