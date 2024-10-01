'use client'

import React from 'react'
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import teapot from '../assets/images/teapot.svg'
const FooterSection = ({ title, items }) => (
  <div className="mb-6 md:mb-0">
    <h2 className="text-sm font-semibold text-white uppercase mb-4">{title}</h2>
    <ul className="text-gray-400">
      {items.map((item, index) => (
        <li key={index} className="mb-2">
          <a href="#" className="hover:underline">{item}</a>
        </li>
      ))}
    </ul>
  </div>
)

const SocialIcon = ({ Icon }) => (
  <a href="#" className="text-gray-400 hover:text-white">
    <Icon className="w-5 h-5" />
  </a>
)

export function FooterComponent() {
  const year = new Date().getFullYear();
  return (
    (<footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and Copyright */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <div className="flex items-center mb-4">
              <img src={teapot} alt="Logo" className="w-8 h-8 mr-2" />
              <span className="text-xl font-bold">Trip Genie</span>
            </div>
            <p className="text-sm text-gray-400">
              Copyright © Trip Genie {year} All rights reserved
            </p>
          </div>

          {/* Menu */}
          <FooterSection title="Menu" items={['Home', 'Explore', 'Travel', 'Blog', 'Pricing']} />

          {/* Information */}
          <FooterSection
            title="Information"
            items={['Destinations', 'Supports', 'Terms & Conditions', 'Privacy']} />

          {/* Contact Info */}
          <div>
            <h2 className="text-sm font-semibold text-white uppercase mb-4">Contact Info</h2>
            <ul className="text-gray-400">
              <li className="mb-2">+123 456 789</li>
              <li className="mb-2">info@travellian.com</li>
              <li className="mb-2">1245, New Yourk, USA</li>
            </ul>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex justify-center md:justify-end space-x-6">
            <SocialIcon Icon={Facebook} />
            <SocialIcon Icon={Twitter} />
            <SocialIcon Icon={Instagram} />
            <SocialIcon Icon={Linkedin} />
          </div>
        </div>
      </div>
    </footer>)
  );
}