'use client'

import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'

const NavLink = ({ href, children }) => (
  <a
    href={href}
    className="text-white hover:bg-white hover:bg-opacity-10 px-3 py-2 rounded-md text-sm font-medium">
    {children}
  </a>
)

export function NavbarComponent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    (<nav className="fixed top-0 left-0 right-0 z-50">
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
                <a href="/" className="flex items-center">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="ml-2 text-white text-lg font-semibold">Travellian</span>
                </a>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {['Home', 'Explore', 'Travel', 'Blog', 'Pricing'].map((item) => (
                    <NavLink key={item} href={`/${item.toLowerCase()}`}>
                      {item}
                    </NavLink>
                  ))}
                </div>
              </div>
              
              {/* Login and Sign Up */}
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  <button
                    className="text-white hover:bg-white hover:bg-opacity-10 px-3 py-2 rounded-md text-sm font-medium">
                    Login
                  </button>
                  <button
                    className="ml-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Sign up
                  </button>
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
                {['Home', 'Explore', 'Travel', 'Blog', 'Pricing'].map((item) => (
                  <a
                    key={item}
                    href={`/${item.toLowerCase()}`}
                    className="text-white hover:bg-white hover:bg-opacity-10 block px-3 py-2 rounded-md text-base font-medium">
                    {item}
                  </a>
                ))}
              </div>
              <div className="pt-4 pb-3 border-t border-white border-opacity-25">
                <div className="flex items-center px-5">
                  <button
                    className="text-white hover:bg-white hover:bg-opacity-10 px-3 py-2 rounded-md text-base font-medium">
                    Login
                  </button>
                  <button
                    className="ml-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-base font-medium">
                    Sign up
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>)
  );
}