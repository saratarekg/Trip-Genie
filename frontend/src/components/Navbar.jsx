'use client';

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom'; // Import Link from React Router
import logo from '../assets/images/tgLogofinal6.png';

const NavLink = ({ to, children }) => (
  <Link
    to={to}
    className="text-white hover:bg-white hover:bg-opacity-10 px-3 py-2 rounded-md text-sm font-medium">
    {children}
  </Link>
);

export function NavbarComponent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="relative">
        {/* Background Image */}
        <div
          className="absolute inset-0 w-full h-[70px] bg-cover bg-center"
          style={{ background: 'transparent' }}></div>

        {/* Navbar Content */}
        <div className="relative bg-black bg-opacity-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link to="/" className="flex items-center">
                  <img src={logo} alt="logo" className="h-12 w-auto" />
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {['Home', 'Explore', 'Travel', 'Museums', 'Pricing', 'Historical Places'].map((item) => (
                    <NavLink key={item} to={`/${item.toLowerCase().replace(/\s+/g, '-')}`}>
                      {item}
                    </NavLink>
                  ))}
                </div>
              </div>

              {/* Login, Sign Up, and Contact Us Buttons */}
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  <button className="text-white hover:bg-white hover:bg-opacity-10 px-3 py-2 rounded-md text-sm font-medium">
                    Login
                  </button>
                  <button className="ml-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Sign up
                  </button>

                  {/* New Contact Us Button */}
                  <Link to="/contact">
                    <button className="ml-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Contact Us
                    </button>
                  </Link>
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white hover:bg-opacity-10 focus:outline-none">
                  <span className="sr-only">Open main menu</span>
                  {isMenuOpen ? (
                    <X className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-black bg-opacity-50">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {['Home', 'Explore', 'Travel', 'Museums', 'Pricing', 'Historical Places'].map((item) => (
                  <Link
                    key={item}
                    to={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-white hover:bg-white hover:bg-opacity-10 block px-3 py-2 rounded-md text-base font-medium">
                    {item}
                  </Link>
                ))}
              </div>

              {/* Login, Sign Up, and Contact Us in Mobile View */}
              <div className="pt-4 pb-3 border-t border-white border-opacity-25">
                <div className="flex items-center px-5">
                  <button className="text-white hover:bg-white hover:bg-opacity-10 px-3 py-2 rounded-md text-base font-medium">
                    Login
                  </button>
                  <button className="ml-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-base font-medium">
                    Sign up
                  </button>
                  
                  {/* New Contact Us Button in Mobile */}
                  <Link to="/contact" className="ml-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-base font-medium">
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
