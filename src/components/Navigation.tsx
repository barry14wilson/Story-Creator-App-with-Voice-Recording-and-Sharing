import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpenIcon, UserIcon, PenToolIcon } from 'lucide-react';
interface NavigationProps {
  isLoggedIn: boolean;
}
export const Navigation = ({
  isLoggedIn
}: NavigationProps) => {
  return <nav className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <BookOpenIcon size={28} />
          <span className="text-2xl font-bold">Robyn Reads</span>
        </Link>
        <div className="flex gap-6">
          <Link to="/" className="flex items-center gap-1 hover:text-yellow-200 transition-colors">
            <BookOpenIcon size={20} />
            <span>Home</span>
          </Link>
          {isLoggedIn ? <>
              <Link to="/create" className="flex items-center gap-1 hover:text-yellow-200 transition-colors">
                <PenToolIcon size={20} />
                <span>Create Story</span>
              </Link>
              <Link to="/profile" className="flex items-center gap-1 hover:text-yellow-200 transition-colors">
                <UserIcon size={20} />
                <span>My Stories</span>
              </Link>
            </> : <Link to="/login" className="flex items-center gap-1 hover:text-yellow-200 transition-colors">
              <UserIcon size={20} />
              <span>Login</span>
            </Link>}
        </div>
      </div>
    </nav>;
};