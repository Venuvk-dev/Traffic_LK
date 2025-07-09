import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, User, LogOut, Settings, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">TrafficLK</h1>
              <p className="text-xs text-gray-500">Digital Fine Management</p>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Home
            </Link>
            <button 
              onClick={() => scrollToSection('features')}
              className="text-gray-700 hover:text-emerald-600 transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('services')}
              className="text-gray-700 hover:text-emerald-600 transition-colors"
            >
              Services
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-gray-700 hover:text-emerald-600 transition-colors"
            >
              Contact
            </button>
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <Link to="/admin" className="text-gray-700 hover:text-emerald-600 transition-colors">
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link to="/dashboard" className="text-gray-700 hover:text-emerald-600 transition-colors">
                    Dashboard
                  </Link>
                )}
                
                {user.role !== 'admin' && (
                  <>
                    <Link to="/fines" className="text-gray-700 hover:text-emerald-600 transition-colors">
                      Fines
                    </Link>
                    <Link to="/vehicles" className="text-gray-700 hover:text-emerald-600 transition-colors">
                      Vehicles
                    </Link>
                    <Link to="/disputes" className="text-gray-700 hover:text-emerald-600 transition-colors">
                      Disputes
                    </Link>
                    <Link to="/points" className="text-gray-700 hover:text-emerald-600 transition-colors flex items-center">
                      <Award className="h-4 w-4 mr-1" />
                      Points
                    </Link>
                  </>
                )}
                
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-emerald-600 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span>{user.firstName}</span>
                    {user.role === 'admin' && (
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                        Admin
                      </span>
                    )}
                  </button>
                  
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Profile
                      </Link>
                      {user.role !== 'admin' && (
                        <Link
                          to="/points"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Award className="inline h-4 w-4 mr-2" />
                          Driving Points
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Settings className="inline h-4 w-4 mr-2" />
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="inline h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-emerald-600"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-2">
            <Link 
              to="/" 
              className="block px-3 py-2 text-gray-700 hover:text-emerald-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <button 
              onClick={() => scrollToSection('features')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:text-emerald-600"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('services')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:text-emerald-600"
            >
              Services
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:text-emerald-600"
            >
              Contact
            </button>
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <Link 
                    to="/admin" 
                    className="block px-3 py-2 text-gray-700 hover:text-emerald-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link 
                    to="/dashboard" 
                    className="block px-3 py-2 text-gray-700 hover:text-emerald-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                
                {user.role !== 'admin' && (
                  <>
                    <Link 
                      to="/fines" 
                      className="block px-3 py-2 text-gray-700 hover:text-emerald-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Fines
                    </Link>
                    <Link 
                      to="/vehicles" 
                      className="block px-3 py-2 text-gray-700 hover:text-emerald-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Vehicles
                    </Link>
                    <Link 
                      to="/disputes" 
                      className="block px-3 py-2 text-gray-700 hover:text-emerald-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Disputes
                    </Link>
                    <Link 
                      to="/points" 
                      className="block px-3 py-2 text-gray-700 hover:text-emerald-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Award className="inline h-4 w-4 mr-2" />
                      Points
                    </Link>
                  </>
                )}
                
                <Link 
                  to="/profile" 
                  className="block px-3 py-2 text-gray-700 hover:text-emerald-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-emerald-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block px-3 py-2 text-gray-700 hover:text-emerald-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block px-3 py-2 text-gray-700 hover:text-emerald-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;