import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpenIcon, UserIcon, PenToolIcon, LogOutIcon, MenuIcon, XIcon, CrownIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navigation = () => {
  const { user, profile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors font-body font-semibold ${
      isActive(path)
        ? 'bg-white/20 text-yellow-200'
        : 'hover:text-yellow-200 hover:bg-white/10'
    }`;

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setMobileMenuOpen(false)}>
            <BookOpenIcon size={28} className="group-hover:animate-wiggle" />
            <span className="text-2xl font-display">Robyn Reads</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <Link to="/" className={linkClass('/')}>
              <BookOpenIcon size={18} />
              <span>Home</span>
            </Link>
            {user ? (
              <>
                <Link to="/create" className={linkClass('/create')}>
                  <PenToolIcon size={18} />
                  <span>Create Story</span>
                </Link>
                <Link to="/profile" className={linkClass('/profile')}>
                  <UserIcon size={18} />
                  <span>My Stories</span>
                </Link>
                {profile?.tier === 'pro' && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-yellow-400/20 rounded-full text-yellow-200 text-xs font-bold">
                    <CrownIcon size={14} />
                    PRO
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/10 hover:text-yellow-200 transition-colors font-body font-semibold"
                >
                  <LogOutIcon size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link to="/login" className={linkClass('/login')}>
                <UserIcon size={18} />
                <span>Login</span>
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            <Link to="/" className={linkClass('/')} onClick={() => setMobileMenuOpen(false)}>
              <BookOpenIcon size={18} />
              <span>Home</span>
            </Link>
            {user ? (
              <>
                <Link to="/create" className={linkClass('/create')} onClick={() => setMobileMenuOpen(false)}>
                  <PenToolIcon size={18} />
                  <span>Create Story</span>
                </Link>
                <Link to="/profile" className={linkClass('/profile')} onClick={() => setMobileMenuOpen(false)}>
                  <UserIcon size={18} />
                  <span>My Stories</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/10 hover:text-yellow-200 transition-colors font-body font-semibold w-full"
                >
                  <LogOutIcon size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link to="/login" className={linkClass('/login')} onClick={() => setMobileMenuOpen(false)}>
                <UserIcon size={18} />
                <span>Login</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
