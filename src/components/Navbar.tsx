import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Rocket, User, Bell } from 'lucide-react';

const navLinks = [
  { href: '/home', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/watchlist', label: 'Watchlist' },
  { href: '/alerts', label: 'Alerts' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.removeItem('cosmicwatch_isAuthenticated');
    localStorage.removeItem('cosmicwatch_userRole');
    navigate('/login', { replace: true });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2 group">
            <div className="relative">
              <Rocket className="h-8 w-8 text-primary transition-transform group-hover:rotate-12" />
              <div className="absolute inset-0 blur-lg bg-primary/30 group-hover:bg-primary/50 transition-colors" />
            </div>
            <span className="font-display text-xl font-bold tracking-wider text-foreground">
              COSMIC<span className="text-primary">WATCH</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  location.pathname === link.href
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/alerts">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive animate-pulse" />
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-primary/50 text-primary hover:bg-primary/10"
              onClick={onLogout}
            >
              <User className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-card border-border">
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      location.pathname === link.href
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-border pt-4 mt-4">
                  <Button className="w-full" variant="outline" onClick={() => {
                    setIsOpen(false);
                    onLogout();
                  }}>
                    <User className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
