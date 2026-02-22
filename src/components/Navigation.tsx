import { Link, useLocation } from 'react-router-dom';
import { BookOpenIcon, UserIcon, PenToolIcon, LogOutIcon, CrownIcon, CompassIcon, PlusCircleIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navigation = () => {
  const { user, profile, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Desktop top nav link style
  const topLinkClass = (path: string) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors font-body font-semibold ${
      isActive(path)
        ? 'bg-white/20 text-yellow-200'
        : 'hover:text-yellow-200 hover:bg-white/10'
    }`;

  // Mobile bottom tab style
  const tabClass = (path: string) =>
    `flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors min-w-0 ${
      isActive(path)
        ? 'text-purple-600'
        : 'text-gray-400'
    }`;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* === Desktop Top Navigation === */}
      <nav className="hidden md:block bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg sticky top-0 z-50 no-print">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <BookOpenIcon size={28} className="group-hover:animate-wiggle" />
              <span className="text-2xl font-display">Robyn Reads</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link to="/" className={topLinkClass('/')}>
                <BookOpenIcon size={18} />
                <span>Home</span>
              </Link>
              <Link to="/explore" className={topLinkClass('/explore')}>
                <CompassIcon size={18} />
                <span>Explore</span>
              </Link>
              {user ? (
                <>
                  <Link to="/create" className={topLinkClass('/create')}>
                    <PenToolIcon size={18} />
                    <span>Create</span>
                  </Link>
                  <Link to="/profile" className={topLinkClass('/profile')}>
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
                <Link to="/login" className={topLinkClass('/login')}>
                  <UserIcon size={18} />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* === Mobile Top Header (minimal) === */}
      <header className="md:hidden bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg sticky top-0 z-50 no-print">
        <div className="flex justify-between items-center h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <BookOpenIcon size={24} />
            <span className="text-xl font-display">Robyn Reads</span>
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              {profile?.tier === 'pro' && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-400/20 rounded-full text-yellow-200 text-xs font-bold">
                  <CrownIcon size={12} />
                  PRO
                </span>
              )}
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Logout"
              >
                <LogOutIcon size={20} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 bg-white/20 rounded-lg text-sm font-body font-semibold"
            >
              Login
            </Link>
          )}
        </div>
      </header>

      {/* === Mobile Bottom Tab Bar === */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 no-print safe-area-bottom">
        <div className="flex items-center justify-around py-1 px-2">
          <Link to="/" className={tabClass('/')}>
            <BookOpenIcon size={22} />
            <span className="text-[10px] font-body font-semibold">Home</span>
          </Link>

          <Link to="/explore" className={tabClass('/explore')}>
            <CompassIcon size={22} />
            <span className="text-[10px] font-body font-semibold">Explore</span>
          </Link>

          {user ? (
            <>
              <Link
                to="/create"
                className="flex flex-col items-center -mt-4"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                  isActive('/create')
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500'
                }`}>
                  <PlusCircleIcon size={28} className="text-white" />
                </div>
                <span className="text-[10px] font-body font-semibold text-purple-600 mt-0.5">Create</span>
              </Link>

              <Link to="/profile" className={tabClass('/profile')}>
                <UserIcon size={22} />
                <span className="text-[10px] font-body font-semibold">Profile</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className={tabClass('/login')}>
                <UserIcon size={22} />
                <span className="text-[10px] font-body font-semibold">Login</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
};
